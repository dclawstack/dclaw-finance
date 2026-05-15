from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.budget import Budget


class BudgetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, budget: Budget) -> Budget:
        self.session.add(budget)
        await self.session.commit()
        await self.session.refresh(budget)
        return budget

    async def get(self, budget_id: UUID) -> Budget | None:
        result = await self.session.execute(select(Budget).where(Budget.id == budget_id))
        return result.scalar_one_or_none()

    async def get_by_category_month(
        self, category: str, year: int, month: int
    ) -> Budget | None:
        result = await self.session.execute(
            select(Budget).where(
                Budget.category == category,
                Budget.year == year,
                Budget.month == month,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_month(self, year: int, month: int) -> list[Budget]:
        result = await self.session.execute(
            select(Budget).where(Budget.year == year, Budget.month == month)
        )
        return list(result.scalars().all())

    async def update(self, budget: Budget) -> Budget:
        await self.session.commit()
        await self.session.refresh(budget)
        return budget

    async def delete(self, budget: Budget) -> None:
        await self.session.delete(budget)
        await self.session.commit()
