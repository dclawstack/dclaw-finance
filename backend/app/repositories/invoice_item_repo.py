from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.invoice_item import InvoiceItem


class InvoiceItemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, item: InvoiceItem) -> InvoiceItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def get(self, item_id: UUID) -> InvoiceItem | None:
        result = await self.session.execute(
            select(InvoiceItem).where(InvoiceItem.id == item_id)
        )
        return result.scalar_one_or_none()

    async def list_by_invoice(self, invoice_id: UUID) -> list[InvoiceItem]:
        result = await self.session.execute(
            select(InvoiceItem).where(InvoiceItem.invoice_id == invoice_id)
        )
        return result.scalars().all()

    async def update(self, item: InvoiceItem) -> InvoiceItem:
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item: InvoiceItem) -> None:
        await self.session.delete(item)
        await self.session.commit()
