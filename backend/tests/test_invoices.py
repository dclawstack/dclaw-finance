from datetime import date
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.invoice_repo import InvoiceRepository
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem


@pytest.mark.asyncio
async def test_create_invoice(client: AsyncClient):
    payload = {
        "invoice_number": "INV-001",
        "client_name": "Acme Corp",
        "client_email": "billing@acme.com",
        "issue_date": "2024-01-01",
        "due_date": "2024-01-31",
        "tax_rate": 10.0,
        "items": [
            {"description": "Consulting", "quantity": 10, "unit_price": 100.0},
            {"description": "Design", "quantity": 5, "unit_price": 200.0},
        ],
    }
    resp = await client.post("/api/v1/invoices", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["invoice_number"] == "INV-001"
    assert data["client_name"] == "Acme Corp"
    assert data["subtotal"] == 2000.0
    assert data["tax_amount"] == 200.0
    assert data["total"] == 2200.0
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_invoices(client: AsyncClient):
    resp = await client.get("/api/v1/invoices")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_invoice(client: AsyncClient):
    payload = {
        "invoice_number": "INV-002",
        "client_name": "Beta Inc",
        "client_email": "hello@beta.com",
        "issue_date": "2024-02-01",
        "due_date": "2024-02-28",
        "tax_rate": 0.0,
        "items": [{"description": "Widget", "quantity": 2, "unit_price": 50.0}],
    }
    create_resp = await client.post("/api/v1/invoices", json=payload)
    inv_id = create_resp.json()["id"]

    resp = await client.get(f"/api/v1/invoices/{inv_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["invoice_number"] == "INV-002"


@pytest.mark.asyncio
async def test_update_invoice(client: AsyncClient):
    payload = {
        "invoice_number": "INV-003",
        "client_name": "Gamma LLC",
        "client_email": "info@gamma.com",
        "issue_date": "2024-03-01",
        "due_date": "2024-03-31",
        "tax_rate": 0.0,
        "items": [{"description": "Service", "quantity": 1, "unit_price": 500.0}],
    }
    create_resp = await client.post("/api/v1/invoices", json=payload)
    inv_id = create_resp.json()["id"]

    update = {
        "status": "sent",
        "items": [
            {"description": "Service A", "quantity": 2, "unit_price": 300.0},
            {"description": "Service B", "quantity": 1, "unit_price": 100.0},
        ],
        "tax_rate": 5.0,
    }
    resp = await client.put(f"/api/v1/invoices/{inv_id}", json=update)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "sent"
    assert data["subtotal"] == 700.0
    assert data["tax_amount"] == 35.0
    assert data["total"] == 735.0


@pytest.mark.asyncio
async def test_delete_invoice(client: AsyncClient):
    payload = {
        "invoice_number": "INV-004",
        "client_name": "Delta Co",
        "client_email": "d@delta.com",
        "issue_date": "2024-04-01",
        "due_date": "2024-04-30",
        "tax_rate": 0.0,
        "items": [],
    }
    create_resp = await client.post("/api/v1/invoices", json=payload)
    inv_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/v1/invoices/{inv_id}")
    assert resp.status_code == 204

    get_resp = await client.get(f"/api/v1/invoices/{inv_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_filter_by_status(client: AsyncClient):
    payload = {
        "invoice_number": "INV-005",
        "client_name": "Epsilon",
        "client_email": "e@eps.com",
        "issue_date": "2024-05-01",
        "due_date": "2024-05-31",
        "status": "paid",
        "tax_rate": 0.0,
        "items": [{"description": "X", "quantity": 1, "unit_price": 100.0}],
    }
    await client.post("/api/v1/invoices", json=payload)

    resp = await client.get("/api/v1/invoices?status=paid")
    assert resp.status_code == 200
    data = resp.json()
    assert all(inv["status"] == "paid" for inv in data)


@pytest.mark.asyncio
async def test_invoice_item_endpoints(client: AsyncClient):
    payload = {
        "invoice_number": "INV-006",
        "client_name": "Zeta",
        "client_email": "z@zeta.com",
        "issue_date": "2024-06-01",
        "due_date": "2024-06-30",
        "tax_rate": 0.0,
        "items": [],
    }
    create_resp = await client.post("/api/v1/invoices", json=payload)
    inv_id = create_resp.json()["id"]

    item_resp = await client.post(
        f"/api/v1/invoices/{inv_id}/items",
        json={"description": "New Item", "quantity": 3, "unit_price": 50.0},
    )
    assert item_resp.status_code == 201
    item_data = item_resp.json()
    assert item_data["amount"] == 150.0
    item_id = item_data["id"]

    # Update item
    upd_resp = await client.put(
        f"/api/v1/invoices/{inv_id}/items/{item_id}",
        json={"quantity": 2, "unit_price": 100.0},
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["amount"] == 200.0

    # Delete item
    del_resp = await client.delete(f"/api/v1/invoices/{inv_id}/items/{item_id}")
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_repo_list_by_status(db_session: AsyncSession):
    repo = InvoiceRepository(db_session)
    inv = Invoice(
        invoice_number="REP-001",
        client_name="Repo Client",
        client_email="repo@test.com",
        issue_date=date(2024, 1, 1),
        due_date=date(2024, 1, 15),
        status="sent",
        subtotal=100.0,
        tax_rate=0.0,
        tax_amount=0.0,
        total=100.0,
    )
    await repo.create(inv)

    sent = await repo.list_by_status("sent")
    assert any(i.invoice_number == "REP-001" for i in sent)


@pytest.mark.asyncio
async def test_repo_get_by_invoice_number(db_session: AsyncSession):
    repo = InvoiceRepository(db_session)
    inv = Invoice(
        invoice_number="REP-002",
        client_name="Repo Client 2",
        client_email="repo2@test.com",
        issue_date=date(2024, 1, 1),
        due_date=date(2024, 1, 15),
        status="draft",
        subtotal=50.0,
        tax_rate=0.0,
        tax_amount=0.0,
        total=50.0,
    )
    await repo.create(inv)

    found = await repo.get_by_invoice_number("REP-002")
    assert found is not None
    assert found.client_name == "Repo Client 2"
