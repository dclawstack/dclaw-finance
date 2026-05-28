from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.report_generator import generate_monthly_summary
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])


class MonthlySummaryRequest(BaseModel):
    year: int = Field(ge=2000, le=2099)
    month: int = Field(ge=1, le=12)


@router.post("/monthly-summary")
async def monthly_summary(
    data: MonthlySummaryRequest,
    dry_run: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if dry_run:
        today = date.today()
        return {
            "period": today.strftime("%B %Y"),
            "year": today.year,
            "month": today.month,
            "revenue": 15000.0,
            "expenses": 8500.0,
            "profit": 6500.0,
            "top_categories": {"software": 3000.0, "salary": 4000.0, "office": 1500.0},
            "summary": "Strong month with healthy margins. Software and salary are the primary cost drivers. Consider optimising recurring SaaS subscriptions to improve profitability.",
        }
    return await generate_monthly_summary(db, data.year, data.month)
