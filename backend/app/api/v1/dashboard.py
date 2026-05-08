from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.expense import Expense
from app.schemas.invoice import InvoiceResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(db: AsyncSession = Depends(get_db)) -> dict:
    # Total revenue: sum of totals for paid invoices
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0.0)).where(Invoice.status == "paid")
    )
    total_revenue = revenue_result.scalar_one()

    # Outstanding invoices: count of sent or overdue invoices
    outstanding_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.status.in_(["sent", "overdue"]))
    )
    outstanding_invoices = outstanding_result.scalar_one()

    # Total expenses
    expenses_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0.0))
    )
    total_expenses = expenses_result.scalar_one()

    net_profit = round(total_revenue - total_expenses, 2)

    # Overdue invoices
    today = date.today()
    overdue_result = await db.execute(
        select(Invoice)
        .where(Invoice.due_date < today)
        .where(Invoice.status.in_(["sent", "draft"]))
        .order_by(Invoice.due_date)
    )
    overdue_invoices = overdue_result.scalars().all()

    # Expenses by category
    category_result = await db.execute(
        select(Expense.category, func.coalesce(func.sum(Expense.amount), 0.0)).group_by(
            Expense.category
        )
    )
    expenses_by_category = {row[0]: float(row[1]) for row in category_result.all()}

    # Ensure all categories exist with 0.0
    all_categories = ["office", "travel", "software", "marketing", "salary", "other"]
    for cat in all_categories:
        if cat not in expenses_by_category:
            expenses_by_category[cat] = 0.0

    return {
        "total_revenue": float(total_revenue),
        "outstanding_invoices": outstanding_invoices,
        "total_expenses": float(total_expenses),
        "net_profit": net_profit,
        "overdue_invoices": [
            {
                "id": str(inv.id),
                "invoice_number": inv.invoice_number,
                "client_name": inv.client_name,
                "total": inv.total,
                "due_date": inv.due_date.isoformat(),
            }
            for inv in overdue_invoices
        ],
        "expenses_by_category": expenses_by_category,
    }
