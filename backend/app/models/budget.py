from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    monthly_limit: Mapped[float] = mapped_column(nullable=False)
    year: Mapped[int] = mapped_column(nullable=False)
    month: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
