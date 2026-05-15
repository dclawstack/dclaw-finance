import json
import time
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.services.llm_client import chat, HAIKU

router = APIRouter(prefix="/clients", tags=["clients"])

_cache: dict = {"ts": 0.0, "data": []}
CACHE_TTL = 86400  # 24 hours


@router.get("/profitability")
async def client_profitability(db: AsyncSession = Depends(get_db)) -> list[dict]:
    if time.time() - _cache["ts"] < CACHE_TTL:
        return _cache["data"]

    result = await db.execute(
        select(
            Invoice.client_name,
            func.sum(Invoice.total).label("total_revenue"),
            func.count(Invoice.id).label("invoice_count"),
            func.sum(
                case((Invoice.status == "paid", Invoice.total), else_=0)
            ).label("paid_revenue"),
        ).group_by(Invoice.client_name)
    )

    rows = result.all()
    if not rows:
        return []

    clients_raw = []
    for row in rows:
        total_rev = float(row.total_revenue or 0)
        paid_rev = float(row.paid_revenue or 0)
        outstanding = total_rev - paid_rev
        clients_raw.append({
            "client_name": row.client_name,
            "total_revenue": round(total_rev, 2),
            "invoice_count": row.invoice_count,
            "outstanding": round(outstanding, 2),
        })

    max_rev = max((c["total_revenue"] for c in clients_raw), default=1)
    max_outstanding = max((c["outstanding"] for c in clients_raw), default=1) or 1

    for c in clients_raw:
        rev_score = c["total_revenue"] / max_rev if max_rev else 0
        outstanding_score = 1.0 - (c["outstanding"] / max_outstanding)
        c["score"] = round((rev_score * 0.7 + outstanding_score * 0.3) * 100, 1)

    clients_raw.sort(key=lambda x: x["score"], reverse=True)

    top = clients_raw[:3]
    bottom = clients_raw[-3:] if len(clients_raw) > 3 else []
    highlight = top + [c for c in bottom if c not in top]

    if highlight:
        try:
            items_text = "\n".join(
                f"{i+1}. {c['client_name']}: revenue=₹{c['total_revenue']:,.0f}, "
                f"outstanding=₹{c['outstanding']:,.0f}, score={c['score']}"
                for i, c in enumerate(highlight)
            )
            prompt = (
                f"These are key clients ranked by profitability score:\n{items_text}\n"
                f"For each numbered client, write ONE brief sentence of insight "
                f"about their financial relationship. Plain text only, no markdown. "
                f"Return a JSON array of strings in order."
            )
            text = await chat(prompt, model=HAIKU, max_tokens=512)
            start = text.find("[")
            end = text.rfind("]") + 1
            insights: list[str] = []
            if start >= 0 and end > start:
                try:
                    insights = json.loads(text[start:end])
                except Exception:
                    pass
            for i, c in enumerate(highlight):
                c["ai_insight"] = insights[i] if i < len(insights) else ""
        except Exception:
            # AI unavailable — return data without insights
            for c in highlight:
                c["ai_insight"] = ""

    for c in clients_raw:
        if "ai_insight" not in c:
            c["ai_insight"] = ""

    _cache["ts"] = time.time()
    _cache["data"] = clients_raw
    return clients_raw
