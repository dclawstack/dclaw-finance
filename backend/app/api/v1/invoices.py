from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.repositories.invoice_repo import InvoiceRepository
from app.repositories.invoice_item_repo import InvoiceItemRepository
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.schemas.invoice_item import InvoiceItemCreate, InvoiceItemUpdate, InvoiceItemResponse
from app.services.ai_writer import draft_reminder, suggest_line_items

router = APIRouter(prefix="/invoices", tags=["invoices"])


class SuggestItemsRequest(BaseModel):
    client_name: str
    first_item: str


def _recalc_invoice(invoice: Invoice) -> None:
    subtotal = round(sum(item.amount for item in invoice.items), 2)
    tax_amount = round(subtotal * (invoice.tax_rate / 100.0), 2)
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total = round(subtotal + tax_amount, 2)


@router.post("/suggest-items")
async def suggest_items(
    data: SuggestItemsRequest,
    dry_run: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    if dry_run:
        return [
            {"description": "Consulting — Additional Hours", "typical_unit_price": 150.0},
            {"description": "Project Management", "typical_unit_price": 120.0},
            {"description": "Documentation", "typical_unit_price": 80.0},
        ]
    result = await db.execute(
        select(InvoiceItem.description)
        .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
        .where(Invoice.client_name == data.client_name)
        .order_by(Invoice.issue_date.desc())
        .limit(20)
    )
    history = [row[0] for row in result.all()]
    return await suggest_line_items(data.client_name, data.first_item, history)


@router.post("", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    data: InvoiceCreate, db: AsyncSession = Depends(get_db)
) -> Invoice:
    repo = InvoiceRepository(db)
    item_repo = InvoiceItemRepository(db)

    invoice = Invoice(
        invoice_number=data.invoice_number,
        client_name=data.client_name,
        client_email=data.client_email,
        issue_date=data.issue_date,
        due_date=data.due_date,
        status=data.status,
        tax_rate=data.tax_rate,
        notes=data.notes,
        subtotal=data.subtotal,
        tax_amount=data.tax_amount,
        total=data.total,
    )
    invoice = await repo.create(invoice)

    for item_data in data.items:
        item = InvoiceItem(
            invoice_id=invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            amount=item_data.amount,
        )
        await item_repo.create(item)

    await db.refresh(invoice, attribute_names=["items"])
    return invoice


@router.get("", response_model=list[InvoiceResponse])
async def list_invoices(
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> list[Invoice]:
    repo = InvoiceRepository(db)
    if status:
        return await repo.list_by_status(status, skip=skip, limit=limit)
    return await repo.list_all(skip=skip, limit=limit)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: UUID, db: AsyncSession = Depends(get_db)) -> Invoice:
    repo = InvoiceRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID, data: InvoiceUpdate, db: AsyncSession = Depends(get_db)
) -> Invoice:
    repo = InvoiceRepository(db)
    item_repo = InvoiceItemRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    update_data = data.model_dump(exclude_unset=True)
    update_data.pop("items", None)
    for field, value in update_data.items():
        setattr(invoice, field, value)

    if data.items is not None:
        existing = await item_repo.list_by_invoice(invoice.id)
        for ex in existing:
            await item_repo.delete(ex)
        invoice.items = []
        for item_data in data.items:
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                amount=item_data.amount,
            )
            invoice.items.append(item)

    _recalc_invoice(invoice)
    invoice = await repo.update(invoice)
    await db.refresh(invoice, attribute_names=["items"])
    return invoice


@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(invoice_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    repo = InvoiceRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    await repo.delete(invoice)


@router.post("/{invoice_id}/reminder-draft")
async def reminder_draft(
    invoice_id: UUID,
    dry_run: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> dict:
    repo = InvoiceRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status not in ("overdue", "sent"):
        raise HTTPException(status_code=400, detail="Invoice must be in 'sent' or 'overdue' status")
    if dry_run:
        return {
            "subject": f"Payment Reminder: Invoice #{invoice.invoice_number} — ${invoice.total:.2f} Due",
            "body": f"Dear {invoice.client_name},\n\nThis is a friendly reminder that invoice #{invoice.invoice_number} for ${invoice.total:.2f} was due on {invoice.due_date}. Please arrange payment at your earliest convenience.\n\nThank you.",
        }
    return await draft_reminder(
        invoice.invoice_number,
        invoice.client_name,
        str(invoice.due_date),
        invoice.total,
    )


@router.post("/{invoice_id}/items", response_model=InvoiceItemResponse, status_code=201)
async def add_invoice_item(
    invoice_id: UUID, data: InvoiceItemCreate, db: AsyncSession = Depends(get_db)
) -> InvoiceItem:
    repo = InvoiceRepository(db)
    item_repo = InvoiceItemRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    item = InvoiceItem(
        invoice_id=invoice.id,
        description=data.description,
        quantity=data.quantity,
        unit_price=data.unit_price,
        amount=data.amount,
    )
    invoice.items.append(item)
    await db.flush()
    await db.refresh(item)
    _recalc_invoice(invoice)
    await repo.update(invoice)
    return item


@router.put("/{invoice_id}/items/{item_id}", response_model=InvoiceItemResponse)
async def update_invoice_item(
    invoice_id: UUID,
    item_id: UUID,
    data: InvoiceItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> InvoiceItem:
    repo = InvoiceRepository(db)
    item_repo = InvoiceItemRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    item = await item_repo.get(item_id)
    if not item or item.invoice_id != invoice_id:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    if data.quantity is not None or data.unit_price is not None:
        item.amount = round(item.quantity * item.unit_price, 2)

    await db.flush()
    await db.refresh(item)
    _recalc_invoice(invoice)
    await repo.update(invoice)
    return item


@router.delete("/{invoice_id}/items/{item_id}", status_code=204)
async def delete_invoice_item(
    invoice_id: UUID, item_id: UUID, db: AsyncSession = Depends(get_db)
) -> None:
    repo = InvoiceRepository(db)
    item_repo = InvoiceItemRepository(db)
    invoice = await repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    item = await item_repo.get(item_id)
    if not item or item.invoice_id != invoice_id:
        raise HTTPException(status_code=404, detail="Item not found")

    await item_repo.delete(item)
    invoice.items = [i for i in invoice.items if i.id != item_id]
    _recalc_invoice(invoice)
    await repo.update(invoice)
