from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
