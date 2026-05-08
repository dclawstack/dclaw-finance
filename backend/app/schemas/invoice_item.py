from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, model_validator, ConfigDict


class InvoiceItemBase(BaseModel):
    description: str = Field(..., max_length=500)
    quantity: float = Field(default=1.0, ge=0)
    unit_price: float = Field(default=0.0, ge=0)
    amount: float = Field(default=0.0, ge=0)


class InvoiceItemCreate(InvoiceItemBase):
    @model_validator(mode="after")
    def calculate_amount(self):
        self.amount = round(self.quantity * self.unit_price, 2)
        return self


class InvoiceItemUpdate(BaseModel):
    description: str | None = Field(default=None, max_length=500)
    quantity: float | None = Field(default=None, ge=0)
    unit_price: float | None = Field(default=None, ge=0)
    amount: float | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def calculate_amount(self):
        if self.quantity is not None and self.unit_price is not None:
            self.amount = round(self.quantity * self.unit_price, 2)
        return self


class InvoiceItemResponse(InvoiceItemBase):
    id: UUID
    invoice_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
