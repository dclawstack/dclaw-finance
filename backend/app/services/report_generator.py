import json
from datetime import date
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.services.llm_client import chat, SONNET


async def generate_monthly_summary(db: AsyncSession, year: int, month: int) -> dict:
    rev_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
            Invoice.status == "paid",
            extract("year", Invoice.issue_date) == year,
            extract("month", Invoice.issue_date) == month,
        )
    )
    revenue = float(rev_result.scalar_one())

    exp_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            extract("year", Expense.date) == year,
            extract("month", Expense.date) == month,
        )
    )
    expenses = float(exp_result.scalar_one())

    cat_result = await db.execute(
        select(Expense.category, func.coalesce(func.sum(Expense.amount), 0.0))
        .where(extract("year", Expense.date) == year, extract("month", Expense.date) == month)
        .group_by(Expense.category)
    )
    by_category = {row[0]: float(row[1]) for row in cat_result.all()}
    top_categories = sorted(by_category.items(), key=lambda x: x[1], reverse=True)[:3]
    profit = revenue - expenses

    month_name = date(year, month, 1).strftime("%B %Y")
    context = {
        "period": month_name,
        "revenue_inr": revenue,
        "expenses_inr": expenses,
        "profit_inr": profit,
        "top_cost_drivers": [{"category": c, "amount_inr": a} for c, a in top_categories],
    }

    prompt = (
        f"You are a financial advisor for an Indian enterprise AI company. "
        f"Financial summary for {month_name} (all amounts in INR):\n"
        f"{json.dumps(context, indent=2)}\n\n"
        "Write a concise executive summary covering:\n"
        "1. Revenue vs expenses overview\n"
        "2. Top cost drivers\n"
        "3. Profit trend assessment\n"
        "4. Three specific actionable recommendations\n"
        "Under 300 words. Write in plain text only — no markdown, no asterisks, no bullet symbols. "
        "Use numbered lists and clear paragraphs. Format amounts in lakhs (e.g. Rs 1.20 L)."
    )

    raw = await chat(prompt, model=SONNET, max_tokens=600)
    # Strip any markdown the LLM returns despite the instruction
    import re
    summary_text = re.sub(r"\*{1,3}(.+?)\*{1,3}", r"\1", raw).strip()

    return {
        "period": month_name,
        "year": year,
        "month": month,
        "revenue": revenue,
        "expenses": expenses,
        "profit": profit,
        "top_categories": dict(top_categories),
        "summary": summary_text,
    }
