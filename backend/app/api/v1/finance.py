import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CreateModelRequest(BaseModel):
    name: str
    revenue: float
    expenses: float
    forecast_months: int


class FinancialModel(BaseModel):
    id: str
    name: str
    revenue: float
    expenses: float
    risk_score: int
    forecast_months: int
    created_at: str


class ForecastResult(BaseModel):
    month: int
    projected_revenue: float
    projected_profit: float


@router.post("/models", response_model=FinancialModel)
async def create_model(req: CreateModelRequest) -> FinancialModel:
    return FinancialModel(
        id=str(uuid.uuid4()),
        name=req.name,
        revenue=req.revenue,
        expenses=req.expenses,
        risk_score=random.randint(1, 100),
        forecast_months=req.forecast_months,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/models/{id}/forecast", response_model=list[ForecastResult])
async def get_forecast(id: str) -> list[ForecastResult]:
    results: list[ForecastResult] = []
    base_revenue = 100000.0
    base_expenses = 75000.0
    for month in range(1, 13):
        projected_revenue = base_revenue * (1 + month * 0.02)
        projected_profit = projected_revenue - base_expenses
        results.append(
            ForecastResult(
                month=month,
                projected_revenue=round(projected_revenue, 2),
                projected_profit=round(projected_profit, 2),
            )
        )
    return results
