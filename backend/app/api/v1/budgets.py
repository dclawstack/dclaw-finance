from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.repositories.budget_repo import BudgetRepository
from app.services.llm_client import chat, HAIKU

router = APIRouter(prefix="/budgets", tags=["budgets"])


class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float
    year: int
    month: int


class BudgetUpdate(BaseModel):
    monthly_limit: float | None = None


class BudgetResponse(BaseModel):
    id: UUID
    category: str
    monthly_limit: float
    year: int
    month: int

    model_config = {"from_attributes": True}


@router.get("/status")
async def budget_status(
    year: int = Query(default=None),
    month: int = Query(default=None),
    dry_run: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    today = date.today()
    y = year or today.year
    m = month or today.month

    repo = BudgetRepository(db)
    budgets = await repo.list_by_month(y, m)
    if not budgets:
        return []

    # Get actual spend per category for the month
    result = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            extract("year", Expense.date) == y,
            extract("month", Expense.date) == m,
        )
        .group_by(Expense.category)
    )
    actuals = {row[0]: float(row[1]) for row in result.all()}

    statuses = []
    breaches = []
    for budget in budgets:
        actual = actuals.get(budget.category, 0.0)
        utilization = actual / budget.monthly_limit if budget.monthly_limit > 0 else 0.0
        entry = {
            "budget_id": str(budget.id),
            "category": budget.category,
            "monthly_limit": budget.monthly_limit,
            "actual_spend": round(actual, 2),
            "utilization": round(utilization, 3),
            "ai_suggestion": None,
        }
        statuses.append(entry)
        if utilization >= 0.8:
            breaches.append(entry)

    if breaches and not dry_run:
        import json
        items = "\n".join(
            f"- {b['category']}: spent ₹{b['actual_spend']:,.0f} of ₹{b['monthly_limit']:,.0f} budget "
            f"({b['utilization']*100:.0f}% utilization)"
            for b in breaches
        )
        prompt = (
            f"These budget categories are at ≥80% utilization:\n{items}\n"
            f"For each, suggest one specific cost-cutting action. "
            f"Return a JSON object mapping category name to suggestion string."
        )
        text = await chat(prompt, model=HAIKU, max_tokens=256)
        start = text.find("{")
        end = text.rfind("}") + 1
        suggestions: dict = {}
        if start >= 0 and end > start:
            try:
                suggestions = json.loads(text[start:end])
            except Exception:
                pass
        for entry in statuses:
            if entry["category"] in suggestions:
                entry["ai_suggestion"] = suggestions[entry["category"]]
    elif breaches and dry_run:
        for entry in breaches:
            entry["ai_suggestion"] = f"Consider reducing {entry['category']} spend by reviewing recurring costs."

    return statuses


@router.post("", response_model=BudgetResponse)
async def create_or_update_budget(
    data: BudgetCreate, db: AsyncSession = Depends(get_db)
) -> Budget:
    """Create a budget, or update the limit if one already exists for this category/month."""
    repo = BudgetRepository(db)
    existing = await repo.get_by_category_month(data.category, data.year, data.month)
    if existing:
        existing.monthly_limit = data.monthly_limit
        return await repo.update(existing)
    budget = Budget(
        category=data.category,
        monthly_limit=data.monthly_limit,
        year=data.year,
        month=data.month,
    )
    return await repo.create(budget)


@router.get("", response_model=list[BudgetResponse])
async def list_budgets(
    year: int = Query(default=None),
    month: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[Budget]:
    repo = BudgetRepository(db)
    today = date.today()
    y = year or today.year
    m = month or today.month
    return await repo.list_by_month(y, m)


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: UUID, data: BudgetUpdate, db: AsyncSession = Depends(get_db)
) -> Budget:
    repo = BudgetRepository(db)
    budget = await repo.get(budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if data.monthly_limit is not None:
        budget.monthly_limit = data.monthly_limit
    return await repo.update(budget)


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(budget_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    repo = BudgetRepository(db)
    budget = await repo.get(budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await repo.delete(budget)
