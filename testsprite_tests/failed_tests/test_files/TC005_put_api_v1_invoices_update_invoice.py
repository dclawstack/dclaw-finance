import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_put_api_v1_invoices_update_invoice():
    # First create an invoice fixture with all required creation fields
    create_payload = {
        "client_name": "Original Client",
        "amount": 1000.0,
        "due_date": "2024-06-30"
    }
    invoice_id = None
    try:
        # Create new invoice
        create_resp = requests.post(f"{BASE_URL}/api/v1/invoices", json=create_payload, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected 201 Created but got {create_resp.status_code}"
        created_invoice = create_resp.json()
        invoice_id = created_invoice.get("id")
        assert invoice_id is not None, "Created invoice has no 'id'"
        assert created_invoice["client_name"] == create_payload["client_name"]
        assert created_invoice["due_date"] == create_payload["due_date"]
        
        # Prepare update payload - update client_name, due_date and amount (all required fields)
        update_payload = {
            "client_name": "Updated Client",
            "due_date": "2024-07-15",
            "amount": 1200.0
        }

        # Update the invoice via PUT
        update_resp = requests.put(f"{BASE_URL}/api/v1/invoices/{invoice_id}", json=update_payload, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Expected 200 OK but got {update_resp.status_code}"
        updated_invoice = update_resp.json()
        assert updated_invoice["id"] == invoice_id
        assert updated_invoice["client_name"] == update_payload["client_name"]
        assert updated_invoice["due_date"] == update_payload["due_date"]

        # Test updating a non-existent invoice ID (e.g. 9999999)
        not_found_resp = requests.put(f"{BASE_URL}/api/v1/invoices/9999999", json=update_payload, timeout=TIMEOUT)
        assert not_found_resp.status_code == 404, f"Expected 404 Not Found but got {not_found_resp.status_code}"

    finally:
        # Clean up by deleting the created invoice if it was created
        if invoice_id:
            requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}", timeout=TIMEOUT)


test_put_api_v1_invoices_update_invoice()
