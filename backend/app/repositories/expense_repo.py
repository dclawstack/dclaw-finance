from uuid import UUID
from datetime import date
from sqlalchemy import select, func, extract, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense


class ExpenseRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, expense: Expense) -> Expense:
        self.session.add(expense)
        await self.session.commit()
        await self.session.refresh(expense)
        return expense

    async def get(self, expense_id: UUID) -> Expense | None:
        result = await self.session.execute(
            select(Expense).where(Expense.id == expense_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[Expense]:
        result = await self.session.execute(
            select(Expense)
            .order_by(desc(Expense.date))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def list_by_category(self, category: str, skip: int = 0, limit: int = 100) -> list[Expense]:
        result = await self.session.execute(
            select(Expense)
            .where(Expense.category == category)
            .order_by(desc(Expense.date))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_monthly_total(self, year: int, month: int) -> float:
        result = await self.session.execute(
            select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
                extract("year", Expense.date) == year,
                extract("month", Expense.date) == month,
            )
        )
        return result.scalar_one()

    async def update(self, expense: Expense) -> Expense:
        await self.session.commit()
        await self.session.refresh(expense)
        return expense

    async def delete(self, expense: Expense) -> None:
        await self.session.delete(expense)
        await self.session.commit()
