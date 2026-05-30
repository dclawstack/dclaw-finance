import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_put_api_v1_invoices_invoice_id_items_item_id_update_line_item():
    headers = {"Content-Type": "application/json"}

    # Create an invoice to get invoice_id
    invoice_payload = {
        "client_name": "Test Client TC009",
        "client_email": "testclient009@example.com",
        "invoice_number": "INV-009",
        "issue_date": "2030-11-30",
        "amount": 1000.0,
        "due_date": "2030-12-31"
    }
    invoice_resp = requests.post(f"{BASE_URL}/api/v1/invoices", json=invoice_payload, headers=headers, timeout=TIMEOUT)
    assert invoice_resp.status_code == 201, f"Invoice creation failed: {invoice_resp.text}"
    invoice_data = invoice_resp.json()
    invoice_id = invoice_data.get("id")
    assert invoice_id is not None, "Invoice ID not found in creation response"

    # Add a line item to the invoice to get item_id
    item_payload = {
        "description": "Test Item",
        "quantity": 2,
        "unit_price": 100.0
    }
    item_resp = requests.post(f"{BASE_URL}/api/v1/invoices/{invoice_id}/items", json=item_payload, headers=headers, timeout=TIMEOUT)
    assert item_resp.status_code == 201, f"Add line item failed: {item_resp.text}"
    item_data = item_resp.json()
    item_id = item_data.get("id")
    assert item_id is not None, "Item ID not found in add line item response"

    try:
        # Update the invoice line item quantity and unit_price
        update_payload = {
            "description": "Updated Test Item",
            "quantity": 5,
            "unit_price": 90.0
        }
        update_resp = requests.put(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}/items/{item_id}",
            json=update_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update line item failed: {update_resp.text}"
        updated_item = update_resp.json()
        assert updated_item.get("id") == item_id, "Updated item ID mismatch"
        assert updated_item.get("description") == update_payload["description"], "Description not updated"
        assert updated_item.get("quantity") == update_payload["quantity"], "Quantity not updated"
        assert updated_item.get("unit_price") == update_payload["unit_price"], "Unit price not updated"
    finally:
        # Cleanup: Delete the line item
        del_item_resp = requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}/items/{item_id}", timeout=TIMEOUT)
        assert del_item_resp.status_code == 204, f"Failed to delete line item: {del_item_resp.text}"

        # Cleanup: Delete the invoice
        del_invoice_resp = requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}", timeout=TIMEOUT)
        assert del_invoice_resp.status_code == 204, f"Failed to delete invoice: {del_invoice_resp.text}"

test_put_api_v1_invoices_invoice_id_items_item_id_update_line_item()
