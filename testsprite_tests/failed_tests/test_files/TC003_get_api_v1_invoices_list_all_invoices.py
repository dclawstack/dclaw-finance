import requests

BASE_URL = "http://localhost:8096"
TIMEOUT = 30


def test_get_api_v1_invoices_list_all_invoices():
    url = f"{BASE_URL}/api/v1/invoices"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        invoices = response.json()
        assert isinstance(invoices, list), f"Expected response to be a list, got {type(invoices)}"
        # Optionally, check elements structure if list is not empty
        if invoices:
            invoice = invoices[0]
            assert "id" in invoice, "Invoice should contain 'id'"
            assert "client_name" in invoice, "Invoice should contain 'client_name'"
            assert "due_date" in invoice, "Invoice should contain 'due_date'"
            assert "total" in invoice or "amount" in invoice, "Invoice should contain 'total' or 'amount'"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_get_api_v1_invoices_list_all_invoices()