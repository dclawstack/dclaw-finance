import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_post_api_v1_invoices_create_new_invoice():
    url = f"{BASE_URL}/api/v1/invoices"
    payload = {
        "invoice_number": "INV-1001",
        "client_name": "Acme Corp",
        "client_email": "contact@acmecorp.com",
        "issue_date": "2026-06-01",
        "due_date": "2026-06-15"
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = None
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status code 201 but got {response.status_code}"
        data = response.json()
        # Validate required response fields presence and types
        assert "id" in data and isinstance(data["id"], (int, str)), "Response missing 'id' or invalid type"
        assert "client_name" in data and data["client_name"] == payload["client_name"], "client_name mismatch"
        assert "due_date" in data and data["due_date"] == payload["due_date"], "due_date mismatch"
        # total and subtotal: check presence and type float or number compatible
        assert "total" in data and isinstance(data["total"], (float, int)), "Missing or invalid 'total'"
        assert "subtotal" in data and isinstance(data["subtotal"], (float, int)), "Missing or invalid 'subtotal'"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        # attempt to delete created invoice if id is available
        if response and response.status_code == 201:
            invoice_id = response.json().get("id")
            if invoice_id:
                try:
                    del_url = f"{BASE_URL}/api/v1/invoices/{invoice_id}"
                    del_resp = requests.delete(del_url, timeout=TIMEOUT)
                    assert del_resp.status_code == 204, f"Failed to delete invoice with id {invoice_id}"
                except requests.RequestException:
                    pass

test_post_api_v1_invoices_create_new_invoice()