from uuid import UUID, uuid4
from datetime import datetime
from datetime import date as Date
from sqlalchemy import String, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(default=0.0)
    date: Mapped[Date] = mapped_column(nullable=False)
    vendor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ai_suggested_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
