from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.repositories.invoice_repo import InvoiceRepository
from app.repositories.invoice_item_repo import InvoiceItemRepository
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.schemas.invoice_item import InvoiceItemCreate, InvoiceItemUpdate, InvoiceItemResponse

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _recalc_invoice(invoice: Invoice) -> None:
    subtotal = round(sum(item.amount for item in invoice.items), 2)
    tax_amount = round(subtotal * (invoice.tax_rate / 100.0), 2)
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total = round(subtotal + tax_amount, 2)


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
    # Handle items separately
    update_data.pop("items", None)

    for field, value in update_data.items():
        setattr(invoice, field, value)

    if data.items is not None:
        # Remove existing items and recreate
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

    # Recalculate amount if quantity or unit_price changed
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
