import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_delete_api_v1_invoices_delete_invoice():
    invoice_data = {
        "invoice_number": "INV-TEST-006",
        "client_name": "Test Client",
        "client_email": "testclient@example.com",
        "issue_date": "2024-06-01",
        "due_date": "2024-06-15"
    }
    headers = {"Content-Type": "application/json"}

    # Create invoice to delete
    response_create = requests.post(
        f"{BASE_URL}/api/v1/invoices",
        json=invoice_data,
        headers=headers,
        timeout=TIMEOUT
    )
    assert response_create.status_code == 201, f"Failed to create invoice for test, status: {response_create.status_code}"
    created_invoice = response_create.json()
    invoice_id = created_invoice.get("id")
    assert invoice_id, "No invoice ID returned on creation"

    try:
        # Delete the created invoice
        response_delete = requests.delete(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}",
            timeout=TIMEOUT
        )
        assert response_delete.status_code == 204 or response_delete.status_code == 404, (
            f"Unexpected status code on delete: {response_delete.status_code}"
        )

        # Confirm deletion by attempting to GET the invoice
        response_get = requests.get(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}",
            timeout=TIMEOUT
        )
        assert response_get.status_code == 404, (
            f"Invoice still accessible after delete, status: {response_get.status_code}"
        )

    finally:
        # Cleanup: If invoice still exists, attempt to delete it
        if invoice_id is not None:
            requests.delete(f"{BASE_URL}/api/v1/invoices/{invoice_id}", timeout=TIMEOUT)


test_delete_api_v1_invoices_delete_invoice()