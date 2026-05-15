from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.chat_message import ChatMessage
from app.repositories.chat_repo import ChatRepository
from app.services.nl_query import answer_question

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("")
async def chat(data: ChatRequest, db: AsyncSession = Depends(get_db)) -> dict:
    repo = ChatRepository(db)
    user_msg = ChatMessage(role="user", content=data.message)
    await repo.create(user_msg)

    answer = await answer_question(db, data.message)

    ai_msg = ChatMessage(role="assistant", content=answer)
    await repo.create(ai_msg)

    return {"reply": answer}


@router.get("/history")
async def chat_history(db: AsyncSession = Depends(get_db)) -> list[dict]:
    repo = ChatRepository(db)
    messages = await repo.list_recent(limit=50)
    return [
        {"id": str(m.id), "role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
        for m in messages
    ]
