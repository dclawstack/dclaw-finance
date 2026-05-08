import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard(client: AsyncClient):
    # Seed an invoice
    inv_payload = {
        "invoice_number": "DASH-001",
        "client_name": "Dash Corp",
        "client_email": "dash@corp.com",
        "issue_date": "2024-01-01",
        "due_date": "2020-01-01",
        "status": "sent",
        "tax_rate": 0.0,
        "items": [{"description": "Service", "quantity": 1, "unit_price": 1000.0}],
    }
    await client.post("/api/v1/invoices", json=inv_payload)

    # Seed an expense
    exp_payload = {
        "category": "office",
        "description": "Rent",
        "amount": 300.0,
        "date": "2024-01-01",
    }
    await client.post("/api/v1/expenses", json=exp_payload)

    resp = await client.get("/api/v1/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_revenue" in data
    assert "outstanding_invoices" in data
    assert "total_expenses" in data
    assert "net_profit" in data
    assert "overdue_invoices" in data
    assert "expenses_by_category" in data
    assert isinstance(data["overdue_invoices"], list)
    assert "office" in data["expenses_by_category"]
