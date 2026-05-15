from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.expense import Expense
from app.repositories.expense_repo import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services.ai_categorizer import suggest_category
from app.services.receipt_ocr import extract_receipt
from app.services.anomaly_detector import detect_anomalies

router = APIRouter(prefix="/expenses", tags=["expenses"])


class CategorizationRequest(BaseModel):
    description: str
    vendor: str | None = None


@router.post("/categorize")
async def categorize_expense(
    data: CategorizationRequest,
    dry_run: bool = Query(False),
) -> dict:
    if dry_run:
        return {"suggested_category": "software", "confidence": 0.9}
    return await suggest_category(data.vendor or "", data.description)


@router.post("/ocr")
async def ocr_receipt(
    file: UploadFile = File(...),
    dry_run: bool = Query(False),
) -> dict:
    if dry_run:
        return {
            "vendor": "Acme Corp",
            "amount": 42.50,
            "date": "2024-01-15",
            "description": "Office supplies",
            "suggested_category": "office",
        }
    content = await file.read()
    media_type = file.content_type or "image/jpeg"
    return await extract_receipt(content, media_type)


@router.get("/anomalies")
async def get_anomalies(db: AsyncSession = Depends(get_db)) -> list[dict]:
    return await detect_anomalies(db)


@router.post("", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    data: ExpenseCreate, db: AsyncSession = Depends(get_db)
) -> Expense:
    repo = ExpenseRepository(db)
    expense = Expense(
        category=data.category,
        description=data.description,
        amount=data.amount,
        date=data.date,
        vendor=data.vendor,
        receipt_url=data.receipt_url,
    )
    return await repo.create(expense)


@router.get("", response_model=list[ExpenseResponse])
async def list_expenses(
    category: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> list[Expense]:
    repo = ExpenseRepository(db)
    if category:
        return await repo.list_by_category(category, skip=skip, limit=limit)
    return await repo.list_all(skip=skip, limit=limit)


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: UUID, db: AsyncSession = Depends(get_db)) -> Expense:
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: UUID, data: ExpenseUpdate, db: AsyncSession = Depends(get_db)
) -> Expense:
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    return await repo.update(expense)


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(expense_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await repo.delete(expense)
