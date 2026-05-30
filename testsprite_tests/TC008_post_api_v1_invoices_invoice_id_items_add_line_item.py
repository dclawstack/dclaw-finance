import requests
import uuid

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_post_api_v1_invoices_invoice_id_items_add_line_item():
    invoice_id = None
    item_id = None

    # Prepare headers
    headers = {
        "Content-Type": "application/json"
    }

    # Create a new invoice to add line item to
    invoice_data = {
        "client_name": f"Test Client {uuid.uuid4()}",
        "amount": 1500.00,
        "due_date": "2026-12-31",
        "invoice_number": f"INV-{uuid.uuid4()}",
        "client_email": "testclient@example.com",
        "issue_date": "2026-05-01"
    }

    try:
        # Create invoice
        response = requests.post(
            f"{BASE_URL}/api/v1/invoices",
            json=invoice_data,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert response.status_code == 201, f"Invoice creation failed: {response.text}"
        invoice_response = response.json()
        invoice_id = invoice_response.get("id")
        assert invoice_id is not None, "Invoice ID not returned"

        # Prepare line item data
        line_item_data = {
            "description": "Test line item",
            "quantity": 3,
            "unit_price": 200.0
        }

        # Add line item to the invoice
        response = requests.post(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}/items",
            json=line_item_data,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert response.status_code == 201, f"Adding line item failed: {response.text}"
        item_response = response.json()
        item_id = item_response.get("id")
        assert item_id is not None, "Item ID not returned"
        assert item_response.get("description") == line_item_data["description"]
        assert item_response.get("quantity") == line_item_data["quantity"]
        assert item_response.get("unit_price") == line_item_data["unit_price"]

    finally:
        # Cleanup: Delete the invoice if it was created (which will remove all items)
        if invoice_id:
            requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}", timeout=TIMEOUT)


test_post_api_v1_invoices_invoice_id_items_add_line_item()
