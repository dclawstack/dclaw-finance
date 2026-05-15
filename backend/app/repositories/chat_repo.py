from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat_message import ChatMessage


class ChatRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, message: ChatMessage) -> ChatMessage:
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def list_recent(self, limit: int = 50) -> list[ChatMessage]:
        result = await self.session.execute(
            select(ChatMessage).order_by(ChatMessage.created_at.desc()).limit(limit)
        )
        return list(reversed(result.scalars().all()))
