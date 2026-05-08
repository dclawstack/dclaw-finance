from uuid import UUID
from datetime import datetime
from datetime import date as Date
from pydantic import BaseModel, Field, model_validator, ConfigDict
from app.schemas.invoice_item import InvoiceItemCreate, InvoiceItemUpdate, InvoiceItemResponse


class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., max_length=50)
    client_name: str = Field(..., max_length=255)
    client_email: str = Field(..., max_length=255)
    issue_date: Date
    due_date: Date
    status: str = Field(default="draft")
    tax_rate: float = Field(default=0.0, ge=0)
    notes: str | None = None


class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate] = Field(default_factory=list)
    subtotal: float = Field(default=0.0, ge=0)
    tax_amount: float = Field(default=0.0, ge=0)
    total: float = Field(default=0.0, ge=0)

    @model_validator(mode="after")
    def calculate_totals(self):
        subtotal = round(sum(item.amount for item in self.items), 2)
        tax_amount = round(subtotal * (self.tax_rate / 100.0), 2)
        self.subtotal = subtotal
        self.tax_amount = tax_amount
        self.total = round(subtotal + tax_amount, 2)
        return self


class InvoiceUpdate(BaseModel):
    invoice_number: str | None = Field(default=None, max_length=50)
    client_name: str | None = Field(default=None, max_length=255)
    client_email: str | None = Field(default=None, max_length=255)
    issue_date: Date | None = None
    due_date: Date | None = None
    status: str | None = None
    tax_rate: float | None = Field(default=None, ge=0)
    notes: str | None = None
    items: list[InvoiceItemCreate] | None = None
    subtotal: float | None = Field(default=None, ge=0)
    tax_amount: float | None = Field(default=None, ge=0)
    total: float | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def calculate_totals(self):
        if self.items is not None and self.tax_rate is not None:
            subtotal = round(sum(item.amount for item in self.items), 2)
            tax_amount = round(subtotal * (self.tax_rate / 100.0), 2)
            self.subtotal = subtotal
            self.tax_amount = tax_amount
            self.total = round(subtotal + tax_amount, 2)
        return self


class InvoiceResponse(InvoiceBase):
    id: UUID
    subtotal: float
    tax_amount: float
    total: float
    items: list[InvoiceItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
