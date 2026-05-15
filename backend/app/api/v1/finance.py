import statistics
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.expense import Expense

router = APIRouter(prefix="/forecast", tags=["forecast"])


def _exponential_smooth(data: list[float], alpha: float = 0.3) -> list[float]:
    if not data:
        return []
    smoothed = [data[0]]
    for x in data[1:]:
        smoothed.append(alpha * x + (1 - alpha) * smoothed[-1])
    return smoothed


async def _monthly_totals(
    db: AsyncSession, months: list[tuple[int, int]]
) -> tuple[list[float], list[float]]:
    revenues: list[float] = []
    expenses: list[float] = []
    for year, month in months:
        rev = await db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
                Invoice.status == "paid",
                extract("year", Invoice.issue_date) == year,
                extract("month", Invoice.issue_date) == month,
            )
        )
        exp = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
                extract("year", Expense.date) == year,
                extract("month", Expense.date) == month,
            )
        )
        revenues.append(float(rev.scalar_one()))
        expenses.append(float(exp.scalar_one()))
    return revenues, expenses


@router.get("")
async def get_forecast(db: AsyncSession = Depends(get_db)) -> list[dict]:
    today = date.today()
    # Use 6 complete historical months — skip current (partial) month
    hist_months: list[tuple[int, int]] = []
    for i in range(6, 0, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        hist_months.append((y, m))

    hist_rev, hist_exp = await _monthly_totals(db, hist_months)
    smoothed_rev = _exponential_smooth(hist_rev)
    smoothed_exp = _exponential_smooth(hist_exp)

    last_rev = smoothed_rev[-1]
    last_exp = smoothed_exp[-1]

    # Cap growth at ±20% to prevent extreme outlier months from skewing projections
    raw_rev_growth = (
        (hist_rev[-1] - hist_rev[-2]) / hist_rev[-2]
        if len(hist_rev) >= 2 and hist_rev[-2] > 0
        else 0.0
    )
    raw_exp_growth = (
        (hist_exp[-1] - hist_exp[-2]) / hist_exp[-2]
        if len(hist_exp) >= 2 and hist_exp[-2] > 0
        else 0.0
    )
    rev_growth = max(-0.20, min(0.20, raw_rev_growth))
    exp_growth = max(-0.20, min(0.20, raw_exp_growth))

    try:
        rev_std = statistics.stdev(hist_rev) if len(hist_rev) > 1 else 0.0
        exp_std = statistics.stdev(hist_exp) if len(hist_exp) > 1 else 0.0
    except statistics.StatisticsError:
        rev_std = exp_std = 0.0

    results: list[dict] = []
    for i in range(1, 4):
        m = today.month + i
        y = today.year
        while m > 12:
            m -= 12
            y += 1
        month_label = date(y, m, 1).strftime("%b %Y")
        proj_rev = max(0.0, last_rev * (1 + rev_growth * i))
        proj_exp = max(0.0, last_exp * (1 + exp_growth * i))
        proj_profit = proj_rev - proj_exp
        results.append({
            "month": month_label,
            "projected_revenue": round(proj_rev, 2),
            "projected_expenses": round(proj_exp, 2),
            "projected_profit": round(proj_profit, 2),
            "confidence_band_low": round(proj_profit - rev_std - exp_std, 2),
            "confidence_band_high": round(proj_profit + rev_std + exp_std, 2),
        })

    return results
