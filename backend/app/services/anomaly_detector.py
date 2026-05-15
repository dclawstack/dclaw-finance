import json
import time
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.services.llm_client import chat, HAIKU

_cache: dict = {"ts": 0.0, "data": []}
CACHE_TTL = 3600


async def detect_anomalies(db: AsyncSession) -> list[dict]:
    if time.time() - _cache["ts"] < CACHE_TTL:
        return _cache["data"]

    stats_result = await db.execute(
        select(
            Expense.category,
            func.avg(Expense.amount).label("mean"),
            func.stddev_pop(Expense.amount).label("stddev"),
        ).group_by(Expense.category)
    )
    stats = {
        row.category: {"mean": float(row.mean or 0), "stddev": float(row.stddev or 0)}
        for row in stats_result
    }

    all_result = await db.execute(select(Expense).order_by(Expense.date.desc()))
    all_expenses = list(all_result.scalars().all())

    flagged = []
    for exp in all_expenses:
        s = stats.get(exp.category, {"mean": 0, "stddev": 0})
        if s["stddev"] > 0:
            zscore = (exp.amount - s["mean"]) / s["stddev"]
            if zscore > 2.0:
                flagged.append({"expense": exp, "zscore": round(zscore, 2)})

    if not flagged:
        _cache["ts"] = time.time()
        _cache["data"] = []
        return []

    items_text = "\n".join(
        f"{i+1}. Vendor={e['expense'].vendor or 'unknown'}, "
        f"Category={e['expense'].category}, "
        f"Amount=₹{e['expense'].amount:,.0f}, Z-score={e['zscore']}"
        for i, e in enumerate(flagged)
    )
    prompt = (
        f"These expenses are statistical outliers (z-score > 2) in their category:\n{items_text}\n"
        f"For each numbered item, write ONE brief sentence explaining why it might be unusual. "
        f"Plain text only, no markdown. Return a JSON array of strings in order."
    )
    explanations: list[str] = []
    try:
        text = await chat(prompt, model=HAIKU, max_tokens=512)
        start, end = text.find("["), text.rfind("]") + 1
        if start >= 0 and end > start:
            try:
                explanations = json.loads(text[start:end])
            except Exception:
                pass
    except Exception:
        pass  # Show anomalies without AI explanations if LLM unavailable

    default_msg = "Unusually high expense for this category."
    result = [
        {
            "expense": {
                "id": str(item["expense"].id),
                "category": item["expense"].category,
                "description": item["expense"].description,
                "amount": item["expense"].amount,
                "date": item["expense"].date.isoformat(),
                "vendor": item["expense"].vendor,
            },
            "zscore": item["zscore"],
            "llm_explanation": explanations[i] if i < len(explanations) else default_msg,
        }
        for i, item in enumerate(flagged)
    ]

    _cache["ts"] = time.time()
    _cache["data"] = result
    return result
