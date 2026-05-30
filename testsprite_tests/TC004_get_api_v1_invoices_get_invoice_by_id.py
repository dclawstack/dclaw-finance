import requests

BASE_URL = "http://localhost:8096"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_get_invoice_by_id_tc004():
    # Required fields to create invoice fixture
    invoice_data = {
        "invoice_number": "INV-0001-TC004",
        "client_name": "ACME Corp",
        "client_email": "contact@acmecorp.com",
        "issue_date": "2024-01-10",
        "due_date": "2024-01-31"
    }

    invoice_id = None
    try:
        # Create invoice fixture
        response = requests.post(
            f"{BASE_URL}/api/v1/invoices",
            json=invoice_data,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        created_invoice = response.json()
        invoice_id = created_invoice.get("id")
        assert invoice_id is not None, "Created invoice missing 'id'"
        # Validate returned fields contain required keys
        assert created_invoice.get("client_name") == invoice_data["client_name"]
        assert created_invoice.get("due_date") == invoice_data["due_date"]
        assert "total" in created_invoice

        # GET /api/v1/invoices/{invoice_id} - existing invoice
        get_response = requests.get(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_response.status_code == 200, f"Expected 200 OK for existing invoice, got {get_response.status_code}"
        invoice_details = get_response.json()
        # Validate response fields
        assert invoice_details.get("id") == invoice_id
        assert invoice_details.get("client_name") == invoice_data["client_name"]
        assert invoice_details.get("due_date") == invoice_data["due_date"]
        assert "total" in invoice_details

        # GET /api/v1/invoices/{non_existent_id} - non-existent invoice test
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        not_found_response = requests.get(
            f"{BASE_URL}/api/v1/invoices/{non_existent_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert not_found_response.status_code == 404, f"Expected 404 Not Found for non-existent invoice, got {not_found_response.status_code}"

    finally:
        # Cleanup: delete created invoice if exists
        if invoice_id:
            try:
                delete_response = requests.delete(
                    f"{BASE_URL}/api/v1/invoices/{invoice_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # Either 204 No Content or 404 if already deleted
                assert delete_response.status_code in (204, 404)
            except Exception:
                pass

test_get_invoice_by_id_tc004()