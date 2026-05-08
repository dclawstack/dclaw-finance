from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.invoice import Invoice


class InvoiceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, invoice: Invoice) -> Invoice:
        self.session.add(invoice)
        await self.session.commit()
        await self.session.refresh(invoice)
        return invoice

    async def get(self, invoice_id: UUID) -> Invoice | None:
        result = await self.session.execute(
            select(Invoice)
            .where(Invoice.id == invoice_id)
            .options(selectinload(Invoice.items))
        )
        return result.scalar_one_or_none()

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[Invoice]:
        result = await self.session.execute(
            select(Invoice)
            .order_by(desc(Invoice.created_at))
            .offset(skip)
            .limit(limit)
            .options(selectinload(Invoice.items))
        )
        return result.scalars().all()

    async def list_by_status(self, status: str, skip: int = 0, limit: int = 100) -> list[Invoice]:
        result = await self.session.execute(
            select(Invoice)
            .where(Invoice.status == status)
            .order_by(desc(Invoice.created_at))
            .offset(skip)
            .limit(limit)
            .options(selectinload(Invoice.items))
        )
        return result.scalars().all()

    async def get_by_invoice_number(self, invoice_number: str) -> Invoice | None:
        result = await self.session.execute(
            select(Invoice)
            .where(Invoice.invoice_number == invoice_number)
            .options(selectinload(Invoice.items))
        )
        return result.scalar_one_or_none()

    async def update(self, invoice: Invoice) -> Invoice:
        await self.session.commit()
        await self.session.refresh(invoice)
        return invoice

    async def delete(self, invoice: Invoice) -> None:
        await self.session.delete(invoice)
        await self.session.commit()
