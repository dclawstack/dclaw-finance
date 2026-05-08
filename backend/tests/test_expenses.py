from datetime import date
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.expense_repo import ExpenseRepository
from app.models.expense import Expense


@pytest.mark.asyncio
async def test_create_expense(client: AsyncClient):
    payload = {
        "category": "software",
        "description": "AWS Bill",
        "amount": 250.0,
        "date": "2024-01-15",
        "vendor": "Amazon",
    }
    resp = await client.post("/api/v1/expenses", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] == "software"
    assert data["amount"] == 250.0


@pytest.mark.asyncio
async def test_list_expenses(client: AsyncClient):
    resp = await client.get("/api/v1/expenses")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_expense(client: AsyncClient):
    payload = {
        "category": "travel",
        "description": "Flight to NYC",
        "amount": 400.0,
        "date": "2024-02-10",
        "vendor": "Delta",
    }
    create_resp = await client.post("/api/v1/expenses", json=payload)
    exp_id = create_resp.json()["id"]

    resp = await client.get(f"/api/v1/expenses/{exp_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["description"] == "Flight to NYC"


@pytest.mark.asyncio
async def test_update_expense(client: AsyncClient):
    payload = {
        "category": "office",
        "description": "Chairs",
        "amount": 120.0,
        "date": "2024-03-01",
    }
    create_resp = await client.post("/api/v1/expenses", json=payload)
    exp_id = create_resp.json()["id"]

    update = {"amount": 150.0, "vendor": "IKEA"}
    resp = await client.put(f"/api/v1/expenses/{exp_id}", json=update)
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 150.0
    assert data["vendor"] == "IKEA"


@pytest.mark.asyncio
async def test_delete_expense(client: AsyncClient):
    payload = {
        "category": "marketing",
        "description": "Ads",
        "amount": 500.0,
        "date": "2024-04-01",
    }
    create_resp = await client.post("/api/v1/expenses", json=payload)
    exp_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/v1/expenses/{exp_id}")
    assert resp.status_code == 204

    get_resp = await client.get(f"/api/v1/expenses/{exp_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_filter_by_category(client: AsyncClient):
    payload = {
        "category": "salary",
        "description": "Monthly payroll",
        "amount": 5000.0,
        "date": "2024-05-01",
    }
    await client.post("/api/v1/expenses", json=payload)

    resp = await client.get("/api/v1/expenses?category=salary")
    assert resp.status_code == 200
    data = resp.json()
    assert all(e["category"] == "salary" for e in data)


@pytest.mark.asyncio
async def test_repo_list_by_category(db_session: AsyncSession):
    repo = ExpenseRepository(db_session)
    exp = Expense(
        category="software",
        description="Figma",
        amount=45.0,
        date=date(2024, 6, 1),
    )
    await repo.create(exp)

    software = await repo.list_by_category("software")
    assert any(e.description == "Figma" for e in software)


@pytest.mark.asyncio
async def test_repo_get_monthly_total(db_session: AsyncSession):
    repo = ExpenseRepository(db_session)
    exp = Expense(
        category="office",
        description="Printer",
        amount=200.0,
        date=date(2024, 7, 15),
    )
    await repo.create(exp)

    total = await repo.get_monthly_total(2024, 7)
    assert total >= 200.0
