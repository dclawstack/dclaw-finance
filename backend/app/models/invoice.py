from uuid import UUID, uuid4
from datetime import datetime
from datetime import date as Date
from sqlalchemy import String, Enum, Float, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_email: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_date: Mapped[Date] = mapped_column(nullable=False)
    due_date: Mapped[Date] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("draft", "sent", "paid", "overdue", "cancelled", name="invoice_status"),
        default="draft",
    )
    subtotal: Mapped[float] = mapped_column(default=0.0)
    tax_rate: Mapped[float] = mapped_column(default=0.0)
    tax_amount: Mapped[float] = mapped_column(default=0.0)
    total: Mapped[float] = mapped_column(default=0.0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    items: Mapped[list["InvoiceItem"]] = relationship(
        back_populates="invoice", lazy="selectin", cascade="all, delete-orphan"
    )
