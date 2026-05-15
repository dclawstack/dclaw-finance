from uuid import UUID
from datetime import datetime
from datetime import date as Date
from pydantic import BaseModel, Field, ConfigDict


class ExpenseBase(BaseModel):
    category: str = Field(...)
    description: str = Field(..., max_length=500)
    amount: float = Field(default=0.0, ge=0)
    date: Date
    vendor: str | None = Field(default=None, max_length=255)
    receipt_url: str | None = Field(default=None, max_length=500)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: str | None = None
    description: str | None = Field(default=None, max_length=500)
    amount: float | None = Field(default=None, ge=0)
    date: Date | None = None
    vendor: str | None = Field(default=None, max_length=255)
    receipt_url: str | None = Field(default=None, max_length=500)


class ExpenseResponse(ExpenseBase):
    id: UUID
    ai_suggested_category: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
