import json
from datetime import date
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.services.llm_client import agentic_loop, SONNET

# OpenAI-format tool definitions
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_expense_summary",
            "description": "Get total expenses grouped by category. Optionally filter by year and/or month.",
            "parameters": {
                "type": "object",
                "properties": {
                    "year": {"type": "integer", "description": "Year e.g. 2026"},
                    "month": {"type": "integer", "description": "Month 1-12; omit for full year"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_revenue_summary",
            "description": "Get total revenue from paid invoices. Optionally filter by year and/or month.",
            "parameters": {
                "type": "object",
                "properties": {
                    "year": {"type": "integer"},
                    "month": {"type": "integer", "description": "Month 1-12; omit for full year"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_dashboard_summary",
            "description": "Get overall financial snapshot: revenue, expenses, net profit, outstanding invoices.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_recent_expenses",
            "description": "List recent expenses, optionally filtered by category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["office", "travel", "software", "marketing", "salary", "other"],
                    },
                    "limit": {"type": "integer", "description": "Max results, default 10"},
                },
            },
        },
    },
]


def _make_executor(db: AsyncSession):
    async def execute(name: str, inp: dict) -> str:
        today = date.today()
        year = inp.get("year", today.year)
        month = inp.get("month")

        if name == "get_expense_summary":
            q = select(Expense.category, func.sum(Expense.amount)).group_by(Expense.category)
            q = q.where(extract("year", Expense.date) == year)
            if month:
                q = q.where(extract("month", Expense.date) == month)
            result = await db.execute(q)
            data = {row[0]: round(float(row[1]), 2) for row in result.all()}
            return json.dumps({"expense_by_category_inr": data, "total_inr": round(sum(data.values()), 2)})

        if name == "get_revenue_summary":
            q = select(func.coalesce(func.sum(Invoice.total), 0.0)).where(Invoice.status == "paid")
            q = q.where(extract("year", Invoice.issue_date) == year)
            if month:
                q = q.where(extract("month", Invoice.issue_date) == month)
            result = await db.execute(q)
            return json.dumps({"total_revenue_inr": round(float(result.scalar_one()), 2)})

        if name == "get_dashboard_summary":
            rev = await db.execute(
                select(func.coalesce(func.sum(Invoice.total), 0.0)).where(Invoice.status == "paid")
            )
            exp = await db.execute(select(func.coalesce(func.sum(Expense.amount), 0.0)))
            outstanding = await db.execute(
                select(func.count(Invoice.id)).where(Invoice.status.in_(["sent", "overdue"]))
            )
            total_rev = float(rev.scalar_one())
            total_exp = float(exp.scalar_one())
            return json.dumps({
                "total_revenue_inr": round(total_rev, 2),
                "total_expenses_inr": round(total_exp, 2),
                "net_profit_inr": round(total_rev - total_exp, 2),
                "outstanding_invoices": outstanding.scalar_one(),
            })

        if name == "list_recent_expenses":
            limit = inp.get("limit", 10)
            q = select(Expense).order_by(Expense.date.desc()).limit(limit)
            if inp.get("category"):
                q = q.where(Expense.category == inp["category"])
            result = await db.execute(q)
            return json.dumps([
                {"date": e.date.isoformat(), "category": e.category, "vendor": e.vendor,
                 "description": e.description, "amount_inr": e.amount}
                for e in result.scalars().all()
            ])

        return json.dumps({"error": f"Unknown tool: {name}"})
    return execute


async def answer_question(db: AsyncSession, message: str) -> str:
    system = (
        "You are a financial assistant for an Indian enterprise AI company. "
        "All amounts are in Indian Rupees (INR). "
        "Use the provided tools to fetch real data, then answer accurately. "
        "Format amounts in lakhs (₹X.XX L) when over ₹1,00,000."
    )
    return await agentic_loop(
        user_message=message,
        tools=TOOLS,
        tool_executor=_make_executor(db),
        model=SONNET,
        system=system,
    )
