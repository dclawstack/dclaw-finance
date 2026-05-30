from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.expense import Expense

router = APIRouter(prefix="/cash-flow", tags=["cash-flow"])


async def _monthly_revenue_expense(
    db: AsyncSession, year: int, month: int
) -> tuple[float, float]:
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
    return float(rev.scalar_one()), float(exp.scalar_one())


@router.get("/13-week")
async def get_13_week_forecast(db: AsyncSession = Depends(get_db)) -> dict:
    """13-week rolling cash flow projection based on trailing 3 months of actuals."""
    today = date.today()

    hist_months: list[tuple[int, int]] = []
    for i in range(3, 0, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        hist_months.append((y, m))

    monthly_rev = []
    monthly_exp = []
    for y, m in hist_months:
        r, e = await _monthly_revenue_expense(db, y, m)
        monthly_rev.append(r)
        monthly_exp.append(e)

    # Convert monthly averages to weekly (÷ 4.33)
    avg_weekly_rev = sum(monthly_rev) / (len(monthly_rev) * 4.33)
    avg_weekly_exp = sum(monthly_exp) / (len(monthly_exp) * 4.33)

    # Trend from most recent month vs average, capped at ±10%
    raw_rev_trend = (
        (monthly_rev[-1] / 4.33 - avg_weekly_rev) / avg_weekly_rev
        if avg_weekly_rev > 0
        else 0.0
    )
    raw_exp_trend = (
        (monthly_exp[-1] / 4.33 - avg_weekly_exp) / avg_weekly_exp
        if avg_weekly_exp > 0
        else 0.0
    )
    rev_trend = max(-0.10, min(0.10, raw_rev_trend / 3))
    exp_trend = max(-0.05, min(0.05, raw_exp_trend / 3))

    weeks = []
    running_balance = 0.0
    for i in range(1, 14):
        week_start = today + timedelta(weeks=i - 1)
        week_end = week_start + timedelta(days=6)
        taper = min(i, 4)  # trend tapers off after week 4
        projected_inflow = max(0.0, avg_weekly_rev * (1 + rev_trend * taper))
        projected_outflow = max(0.0, avg_weekly_exp * (1 + exp_trend * taper))
        net = projected_inflow - projected_outflow
        running_balance += net
        weeks.append({
            "week": i,
            "week_start": week_start.isoformat(),
            "week_end": week_end.isoformat(),
            "projected_inflow": round(projected_inflow, 2),
            "projected_outflow": round(projected_outflow, 2),
            "net_cash_flow": round(net, 2),
            "running_balance": round(running_balance, 2),
        })

    return {
        "weeks": weeks,
        "summary": {
            "total_inflow": round(sum(w["projected_inflow"] for w in weeks), 2),
            "total_outflow": round(sum(w["projected_outflow"] for w in weeks), 2),
            "net_13_week": round(sum(w["net_cash_flow"] for w in weeks), 2),
            "weeks_positive": sum(1 for w in weeks if w["net_cash_flow"] > 0),
            "weeks_negative": sum(1 for w in weeks if w["net_cash_flow"] <= 0),
        },
    }


@router.get("/optimization")
async def get_cash_flow_optimization(db: AsyncSession = Depends(get_db)) -> list[dict]:
    """Identify the top 3 cash flow optimization levers from trailing 3 months of expense data."""
    today = date.today()

    category_totals: dict[str, float] = {}
    for i in range(3, 0, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        result = await db.execute(
            select(Expense.category, func.sum(Expense.amount))
            .where(
                extract("year", Expense.date) == y,
                extract("month", Expense.date) == m,
            )
            .group_by(Expense.category)
        )
        for cat, amt in result.all():
            category_totals[cat] = category_totals.get(cat, 0) + float(amt)

    if not category_totals:
        return []

    total = sum(category_totals.values())
    levers = []
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]:
        pct = (amt / total * 100) if total > 0 else 0
        levers.append({
            "category": cat,
            "total_3_months": round(amt, 2),
            "percentage_of_spend": round(pct, 1),
            "monthly_avg": round(amt / 3, 2),
            "potential_saving_10pct": round(amt * 0.10, 2),
            "suggestion": (
                f"Reduce {cat} spend by 10% to save ₹{amt * 0.10:,.0f} over 3 months"
            ),
        })

    return levers
