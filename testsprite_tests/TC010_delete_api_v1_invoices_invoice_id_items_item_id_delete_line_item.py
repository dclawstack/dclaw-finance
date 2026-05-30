import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_delete_invoice_line_item():
    # Invoice fixture data
    invoice_data = {
        "invoice_number": "INV-10010",
        "client_name": "Test Client",
        "client_email": "testclient@example.com",
        "issue_date": "2024-01-01",
        "due_date": "2024-01-31"
    }

    # Create invoice
    response_invoice = requests.post(
        f"{BASE_URL}/api/v1/invoices",
        json=invoice_data,
        timeout=TIMEOUT
    )
    assert response_invoice.status_code == 201, f"Failed to create invoice: {response_invoice.text}"
    invoice = response_invoice.json()
    invoice_id = invoice.get("id")
    assert invoice_id is not None, "Invoice ID missing in response"

    # Line item fixture data
    line_item_data = {
        "description": "Test Line Item",
        "quantity": 2,
        "unit_price": 10.5,
        "amount": 21.0
    }

    # Add line item to invoice
    response_item = requests.post(
        f"{BASE_URL}/api/v1/invoices/{invoice_id}/items",
        json={
            "description": line_item_data["description"],
            "quantity": line_item_data["quantity"],
            "unit_price": line_item_data["unit_price"]
        },
        timeout=TIMEOUT
    )
    assert response_item.status_code == 201, f"Failed to add line item: {response_item.text}"
    line_item = response_item.json()
    item_id = line_item.get("id")
    assert item_id is not None, "Item ID missing in response"

    try:
        # Delete invoice line item
        response_delete = requests.delete(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}/items/{item_id}",
            timeout=TIMEOUT
        )
        assert response_delete.status_code == 204, f"Expected 204 No Content, got {response_delete.status_code}"

        # Validate line item deletion by attempting to GET the line item should return 404 or not found
        # Since GET individual items endpoint is not documented, we confirm deletion by listing items or expect no errors if queried in other ways
        # Here, try to list all items for invoice and check item absence if supported:
        response_items_list = requests.get(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}",
            timeout=TIMEOUT
        )
        assert response_items_list.status_code == 200, f"Failed to get invoice after deletion: {response_items_list.text}"
        invoice_data_after = response_items_list.json()
        items = invoice_data_after.get("items", [])
        assert all(item.get("id") != item_id for item in items), "Deleted line item still present in invoice items"
    finally:
        # Cleanup: delete invoice
        requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}", timeout=TIMEOUT)

test_delete_invoice_line_item()