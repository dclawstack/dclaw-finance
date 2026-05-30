import requests

def test_post_api_v1_invoices_suggest_items():
    base_url = "http://localhost:8096"
    url = f"{base_url}/api/v1/invoices/suggest-items"
    params = {"dry_run": "true"}
    headers = {"Content-Type": "application/json"}
    payload = {
        "client_name": "Test Client",
        "first_item": "Sample item description"
    }
    try:
        response = requests.post(url, json=payload, params=params, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, list), "Response JSON is not a list"
        # Further validate that each item in the list has expected keys of InvoiceItem if possible
        # Since schema not fully detailed here, just confirm presence of dict entries in list
        for item in json_data:
            assert isinstance(item, dict), "Invoice item is not an object"
            # Common invoice line item fields may exist; no fields explicitly known here, so skip deep checks
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_v1_invoices_suggest_items()