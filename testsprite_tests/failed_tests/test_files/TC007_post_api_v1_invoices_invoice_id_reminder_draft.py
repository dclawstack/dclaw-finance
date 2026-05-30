import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8096"
TIMEOUT = 30

def test_post_invoice_reminder_draft():
    # Create invoice with valid future due_date in ISO8601 format
    invoice_data = {
        "client_name": "Test Client",
        "amount": 1000.0,
        "due_date": (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),  # ISO8601 format
    }

    invoice_id = None
    try:
        # Create a new invoice
        response = requests.post(
            f"{BASE_URL}/api/v1/invoices",
            json=invoice_data,
            timeout=TIMEOUT
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        invoice = response.json()
        assert "id" in invoice, "Response missing invoice id"
        invoice_id = invoice["id"]

        # Update the invoice to have an overdue due_date in ISO8601 format
        update_data = {
            "client_name": invoice_data["client_name"],
            "amount": invoice_data["amount"],
            "due_date": (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),  # overdue
        }
        put_response = requests.put(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}",
            json=update_data,
            timeout=TIMEOUT
        )
        assert put_response.status_code == 200, f"Expected 200 on update, got {put_response.status_code}"

        # POST reminder draft for this invoice id
        reminder_response = requests.post(
            f"{BASE_URL}/api/v1/invoices/{invoice_id}/reminder-draft",
            timeout=TIMEOUT
        )
        assert reminder_response.status_code == 200, f"Expected 200, got {reminder_response.status_code}"
        reminder_text = reminder_response.text
        assert isinstance(reminder_text, str) and len(reminder_text) > 0, "Reminder draft should be a non-empty string"

    finally:
        if invoice_id:
            # Cleanup: delete the created invoice
            delete_response = requests.delete(
                f"{BASE_URL}/api/v1/invoices/{invoice_id}",
                timeout=TIMEOUT
            )
            # 204 expected on delete, but ignore if not found
            assert delete_response.status_code in (204, 404), f"Cleanup delete failed with status {delete_response.status_code}"

test_post_invoice_reminder_draft()
