# TestSprite — Failed Test Terminal Output
# Run date: 2026-05-23
# Format: testError field from each failed/blocked test result
#
# NOTE: Only batch 3 (TC031–TC036) results are stored locally in test_results_batch3_raw.json.
# Batch 1 (TC001–TC015) and Batch 2 (TC016–TC030) results are on the cloud dashboard only.
# Error text for batches 1+2 below is extracted from the AI analysis in the reports.
#
# =============================================================================

## BACKEND FAILURES

### TC009 — PUT /api/v1/invoices/{id}/items/{item_id} — update line item
Status: FAILED
Dashboard: https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/1ca2b9bb-39ce-49bc-a955-428161b315ab

ERROR:
  AssertionError: Invoice creation in TC009 fixture returned 422 Unprocessable Entity.
  Root cause: test plan description for TC009 did not propagate the correct invoice creation
  schema. The fixture omitted required fields (invoice_number, client_email, issue_date, due_date).
  The update-line-item endpoint itself is assumed functional (TC008 POST and TC010 DELETE pass).

FIX NEEDED:
  Update TC009 description in testsprite_backend_test_plan.json to match TC002–TC006 pattern:
  "Required fields: invoice_number, client_name, client_email, issue_date (YYYY-MM-DD), due_date (YYYY-MM-DD)"

# =============================================================================

## FRONTEND FAILURES — BATCH 1 (TC001–TC015)
# Source: testsprite-mcp-frontend-report.md analysis sections
# Raw JSON: NOT available locally — see batch 1 dashboard below
# Dashboard: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9

---

### TC001 — Create and view an invoice
Status: FAILED (HIGH severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/c19b5c04-259a-4907-a428-5e83145a438a

OBSERVED BEHAVIOR:
  - Repeated "Failed to create invoice" toast/alert appeared after form submission
  - App DOM emptied after submission (blank page or error state)
  - Invoice did not appear in the list

ROOT CAUSE:
  Frontend form at /invoices/new likely omits required fields invoice_number, client_email, or
  issue_date from its POST /api/v1/invoices payload. Backend returns 422 Unprocessable Entity.

RELEVANT SOURCE FILE:
  frontend/src/app/invoices/new/page.tsx

---

### TC002 — Scan a receipt and create an expense
Status: FAILED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/980e14cb-3070-41a0-a3af-78f7daabb6eb

OBSERVED BEHAVIOR:
  - Manual expense creation succeeded
  - OCR receipt upload was blocked — no receipt image available in test runner filesystem
  - available_file_paths returned empty list

ROOT CAUSE:
  Test environment issue: no receipt.jpg supplied to the test runner.
  OCR endpoint (POST /api/v1/expenses/upload-receipt) itself was not tested.

FIX NEEDED:
  Add a sample receipt.jpg to testsprite_tests/ so the test runner can upload it.

---

### TC003 — Verify the service health check reports the app is live
Status: BLOCKED (LOW severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/42a2e10a-bf67-4a8a-b982-1f04f25a18bc

OBSERVED BEHAVIOR:
  - Test hit http://localhost:3007/health (frontend port)
  - 404 Not Found returned — Next.js has no /health route

ROOT CAUSE:
  Test config issue: health endpoint is at http://localhost:8096/health (backend).
  Test plan description needs to specify the backend URL.

FIX NEEDED:
  Update TC003 description in testsprite_frontend_test_plan.json:
  "Navigate to http://localhost:8096/health to verify the backend health check."

---

### TC005 — View dashboard summary metrics
Status: FAILED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/76d9c220-4f96-492a-8411-ca52c07284d5

OBSERVED BEHAVIOR:
  - Dashboard loaded with: Revenue ₹39.05 Cr, Outstanding Invoices 6, Expenses ₹29.41 Cr, Net Profit ₹9.64 Cr
  - Net Profit card missing a percent-change/delta badge (e.g. "+12%")
  - Revenue and Expenses cards may have trend indicators; Net Profit does not

ROOT CAUSE:
  Genuine UI bug: Net Profit KPI card does not render a trend/delta badge.

RELEVANT SOURCE FILE:
  frontend/src/app/page.tsx (dashboard) or the KPI card component

---

### TC012 — Generate and delete an invoice reminder draft
Status: BLOCKED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/a3858cba-d437-41b4-bff4-58f7b8f4d0ec

OBSERVED BEHAVIOR:
  - Invoice INV-1001 not found (likely deleted by TC001 failure side effects)
  - Auto-confirm dialogs from TC001 failure cascade may have deleted shared fixture

ROOT CAUSE:
  Test isolation issue: tests share the same invoice fixtures. TC001 side effects deleted
  the invoice that TC012 depends on.

FIX NEEDED:
  Each test should create and clean up its own invoice fixture instead of relying on
  a pre-existing INV-1001.

---

### TC014 — Send a financial question to the chat assistant
Status: BLOCKED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/dc55ad49-3f8d-4eaf-81dd-524b8279faa0

OBSERVED BEHAVIOR:
  - Test navigated to http://localhost:3007/api/v1/chat
  - Got JSON response: {"detail":"Method Not Allowed"} (backend proxied via Next.js)
  - No chat input field, submit button, or conversation list found on page

ROOT CAUSE:
  Test config issue: chat frontend UI is at /chat, not /api/v1/chat.

FIX NEEDED:
  Update TC014 description in testsprite_frontend_test_plan.json:
  "Navigate to http://localhost:3007/chat to access the chat assistant UI."

# =============================================================================

## FRONTEND FAILURES — BATCH 2 (TC016–TC030)
# Source: testsprite-mcp-frontend-report.md analysis sections
# Raw JSON: NOT available locally — see batch 2 dashboard below
# Dashboard: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb

---

### TC016 — Categorize and review an expense anomaly
Status: FAILED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/eea7c4f2-4e58-4b50-9efc-8856fbbab01e

OBSERVED BEHAVIOR:
  - Anomaly detection list rendered correctly with anomaly entries
  - Clicking an anomaly row did nothing — no modal, detail pane, or navigation
  - No error thrown; click was silently ignored

ROOT CAUSE:
  Genuine UI bug: expense anomaly rows are not interactive. The click handler is missing
  from the anomaly list item component.

RELEVANT SOURCE FILE:
  frontend/src/app/expenses/ (anomaly list component)

---

### TC017 — Compare forecast projections with current dashboard totals
Status: FAILED (LOW severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/248c47b2-0478-4d12-a9a3-280b30f54833

OBSERVED BEHAVIOR:
  - Forecast page loaded with Jun/Jul/Aug 2026 projections (revenue, expenses, profit, confidence bands)
  - No side-by-side comparison with current dashboard totals visible
  - Only future projections shown

ROOT CAUSE:
  Missing feature: forecast page does not include a current-vs-projected comparison panel.

RELEVANT SOURCE FILE:
  frontend/src/app/forecast/page.tsx

---

### TC018 — View client profitability ranking
Status: BLOCKED (HIGH severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/0a663558-e741-4806-ab12-3d5deea8bc97

OBSERVED BEHAVIOR:
  - Navigation to /clients/profitability returned 404
  - Next.js "This page could not be found" error page

ROOT CAUSE:
  Genuine missing feature: no frontend page at /clients/profitability.
  Backend endpoint GET /api/v1/clients/profitability works correctly.

RELEVANT SOURCE FILE:
  frontend/src/app/clients/ — page needs to be created

---

### TC019 — Continue a chat with a follow-up question
Status: BLOCKED (MEDIUM severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/1ab31cfc-daf9-4320-9d0f-ae636cced181

OBSERVED BEHAVIOR:
  - Same as TC014: navigated to /api/v1/chat instead of frontend /chat
  - {"detail":"Method Not Allowed"} response

ROOT CAUSE:
  Same test config issue as TC014. Fix test plan description for TC019.

---

### TC020 — See refreshed forecast after new financial data is added
Status: FAILED (LOW severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/ffcf455f-467f-4360-8880-4da0f5ba43d8

OBSERVED BEHAVIOR:
  - Forecast values displayed correctly for Jun/Jul/Aug 2026
  - Test could not compare "before" vs "after" adding new financial data
  - No baseline data available to measure change

ROOT CAUSE:
  Test environment issue: needs seeded baseline data + a clear before/after state.
  Forecast rendering itself works.

---

### TC023 — Handle an empty dashboard state
Status: FAILED (LOW severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/4302db81-6d0f-49b1-a024-c4b85cd9c6bc

OBSERVED BEHAVIOR:
  - Dashboard loaded with populated data: Revenue ₹39.05 Cr, Expenses ₹29.41 Cr, Net Profit ₹9.64 Cr
  - No empty-state/zero-state UI was shown

ROOT CAUSE:
  Two possible causes: (1) empty state UI is not implemented; (2) demo seed data is always
  present so the empty state is never reached. Test requires a clean database.

RELEVANT SOURCE FILE:
  frontend/src/app/page.tsx

---

### TC025 — Delete a budget and confirm removal
Status: FAILED (HIGH severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/3f586a77-6092-4edc-89bf-29dc85905216

OBSERVED BEHAVIOR:
  - Budget card "Remove" button was visible and clickable
  - Clicking Remove did nothing — budget card remained in DOM after repeated clicks
  - No network request to DELETE /api/v1/budgets/{id} was observed
  - No error thrown; click silently ignored

ROOT CAUSE:
  Genuine UI bug: Remove button's onClick handler is either missing or not wired to
  the delete API call.

RELEVANT SOURCE FILE:
  frontend/src/app/budgets/page.tsx

---

### TC029 — Handle an empty client profitability view
Status: BLOCKED (HIGH severity)
Visualization: https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/8de1bd48-990d-47e3-8772-d8617489faca

OBSERVED BEHAVIOR:
  - Same as TC018: /clients/profitability returns 404

ROOT CAUSE:
  Same missing frontend page as TC018.

# =============================================================================

## FRONTEND FAILURES — BATCH 3 (TC031–TC036)
# Raw JSON: AVAILABLE locally in test_results_batch3_raw.json
# Dashboard: https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271

---

### TC033 — Keep chat history unchanged after submitting an invalid empty message
Status: BLOCKED
testId: 7d4487ae-7f2d-43fe-83d8-8c5585b3ea33
Visualization: https://testsprite-videos.s3.us-east-1.amazonaws.com/84783428-c0b1-70c7-bdd4-f4417332967f/1779529329904111//tmp/test_task/result.webm

testError (raw from JSON):
  TEST BLOCKED

  The test could not be run — the chat UI could not be reached at /api/v1/chat using a GET request.

  Observations:
  - A GET request to /api/v1/chat returned JSON: {"detail":"Method Not Allowed"}.
  - No interactive chat UI elements (no input field, submit button, or conversation list) were present on the page.

---

### TC034 — Recover from an invalid report month
Status: FAILED
testId: db4f8c4b-89f1-4057-80d8-8120036af815
Visualization: https://testsprite-videos.s3.us-east-1.amazonaws.com/84783428-c0b1-70c7-bdd4-f4417332967f/1779529568212704//tmp/test_task/result.webm

testError (raw from JSON):
  TEST FAILURE

  Client-side, user-visible validation feedback for an invalid report month was not observed.
  Submitting an out-of-range month produced server errors instead of a clear validation message,
  so the UI does not provide the expected validation feedback to the user in this session.

  Observations:
  - Repeated attempts to submit month=13 produced numerous auto-closed alerts with
    "Failed to generate report: API error 500: Internal Server Error"; the server responded
    with 500 errors rather than a client-side validation message.
  - The Month input element is present and has min=1 and max=12 attributes (Month input index=1044),
    but no aria-invalid/invalid attribute or standalone validation message text was visible in the
    page state or screenshot.
  - After correcting to Month=12 and generating, the Executive Summary for December 2026 displayed,
    confirming report generation works for valid inputs but the expected visible client-side
    invalid-month feedback was not found.

RELEVANT SOURCE FILE:
  frontend/src/app/reports/page.tsx
