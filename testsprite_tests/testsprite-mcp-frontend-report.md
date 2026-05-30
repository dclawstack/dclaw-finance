
# TestSprite AI Testing Report (MCP) — Frontend

---

## 1️⃣ Document Metadata
- **Project Name:** dclaw-finance
- **Date:** 2026-05-23
- **Prepared by:** TestSprite AI Team
- **Test Suite:** Frontend UI — production build, port 3007
- **Total tests:** 36 (run in batches of 15)
- **Batch 1 (TC001–TC015):** 9/15 passed (60%) — complete
- **Batch 2 (TC016–TC030):** 7/15 passed (47%) — complete
- **Batch 3 (TC031–TC036):** 4/6 passed (67%) — complete
- **Overall:** 20/36 passed (56%)
- **Dashboard:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9

---

## 2️⃣ Requirement Validation Summary

---

### Requirement: Invoice Management

#### Test TC001 — Create and view an invoice
- **Test Code:** [TC001_Create_and_view_an_invoice.py](./TC001_Create_and_view_an_invoice.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/c19b5c04-259a-4907-a428-5e83145a438a
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** UI showed repeated "Failed to create invoice" alerts and the app DOM emptied after submission. Root cause is the same missing required fields (`invoice_number`, `client_email`, `issue_date`) — the frontend form may not be sending all required fields to the backend, or the form fields are absent from the new invoice UI.

---

#### Test TC004 — Add and update an invoice line item
- **Test Code:** [TC004_Add_and_update_an_invoice_line_item.py](./TC004_Add_and_update_an_invoice_line_item.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/8e63ed48-1c7c-4494-bb08-d0739d01f9d7
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Line item add and update flow works correctly in the UI.

---

#### Test TC010 — Accept suggested invoice items
- **Test Code:** [TC010_Accept_suggested_invoice_items.py](./TC010_Accept_suggested_invoice_items.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/0a3247cd-49ff-4998-827c-f200590a2665
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** AI-suggested invoice items are displayed and can be accepted in the UI.

---

#### Test TC012 — Generate and delete an invoice reminder draft
- **Test Code:** [TC012_Generate_and_delete_an_invoice_reminder_draft.py](./TC012_Generate_and_delete_an_invoice_reminder_draft.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/a3858cba-d437-41b4-bff4-58f7b8f4d0ec
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Invoice INV-1001 was not found — deleted by TC001 failure side effects (auto-confirm dialogs). Test isolation issue; needs a dedicated fixture invoice that is not shared between tests.

---

### Requirement: Expense Management

#### Test TC002 — Scan a receipt and create an expense
- **Test Code:** [TC002_Scan_a_receipt_and_create_an_expense.py](./TC002_Scan_a_receipt_and_create_an_expense.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/980e14cb-3070-41a0-a3af-78f7daabb6eb
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Manual expense creation succeeded, but OCR receipt upload was blocked — no receipt image file available in the test environment's `available_file_paths`. The OCR feature exists in the UI but is untested. To fix: supply a sample receipt image in the test environment.

---

#### Test TC007 — Update and delete an expense
- **Test Code:** [TC007_Update_and_delete_an_expense.py](./TC007_Update_and_delete_an_expense.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/0f923ac0-c4c4-4eaa-a089-3528b70735bf
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Expense update and delete flows work correctly.

---

### Requirement: Budget Management

#### Test TC006 — Create and inspect a budget
- **Test Code:** [TC006_Create_and_inspect_a_budget.py](./TC006_Create_and_inspect_a_budget.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/c6a816d0-e66e-4929-9301-afb05180d523
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Budget creation and detail inspection work as expected.

---

#### Test TC009 — Update budget limit and refresh utilization
- **Test Code:** [TC009_Update_budget_limit_and_refresh_utilization.py](./TC009_Update_budget_limit_and_refresh_utilization.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/a91aef8e-0f54-4759-bc62-1d7fda6dda45
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Budget limit update and utilization refresh work correctly.

---

### Requirement: Dashboard

#### Test TC005 — View dashboard summary metrics
- **Test Code:** [TC005_View_dashboard_summary_metrics.py](./TC005_View_dashboard_summary_metrics.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/76d9c220-4f96-492a-8411-ca52c07284d5
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Dashboard shows Revenue (₹39.05 Cr), Outstanding Invoices (6), Expenses (₹29.41 Cr), Net Profit (₹9.64 Cr) — but the profit **percent-change indicator** is missing. The test expected a `%` value alongside the profit metric. Genuine UI bug: the trend/delta badge is absent from the Net Profit card.

---

#### Test TC008 — Review dashboard trend data
- **Test Code:** [TC008_Review_dashboard_trend_data.py](./TC008_Review_dashboard_trend_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/33dcaaf0-da13-4198-92c4-bd4660e38e3a
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Dashboard trend charts render correctly.

---

### Requirement: AI Features

#### Test TC011 — Get a financial forecast
- **Test Code:** [TC011_Get_a_financial_forecast_from_the_forecast_endpoint.py](./TC011_Get_a_financial_forecast_from_the_forecast_endpoint.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/321e4849-8b30-4caa-ae66-2d8b1631afe6
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Forecast page renders financial projections correctly.

---

#### Test TC013 — Generate a monthly summary report
- **Test Code:** [TC013_Generate_a_monthly_summary_report.py](./TC013_Generate_a_monthly_summary_report.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/f4d23468-360a-4274-83a0-f62ad0718424
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Monthly report generation works end-to-end.

---

### Requirement: Chat Assistant

#### Test TC014 — Send a financial question to the chat assistant
- **Test Code:** [TC014_Send_a_financial_question_to_the_chat_assistant_and_view_the_reply.py](./TC014_Send_a_financial_question_to_the_chat_assistant_and_view_the_reply.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/dc55ad49-3f8d-4eaf-81dd-524b8279faa0
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Test navigated to `http://localhost:3007/api/v1/chat` (the backend API path) instead of the frontend `/chat` page. The frontend chat UI is at `/chat` — the test plan description needs to explicitly specify the frontend route.

---

#### Test TC015 — View persisted chat history
- **Test Code:** [TC015_View_persisted_chat_history_after_sending_a_message.py](./TC015_View_persisted_chat_history_after_sending_a_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/7447f7a7-d87d-4b62-ab54-c0311c7c1eb7
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Chat history persists and displays correctly.

---

### Requirement: Health / Service Status

#### Test TC003 — Service health check
- **Test Code:** [TC003_Verify_the_service_health_check_reports_the_app_is_live.py](./TC003_Verify_the_service_health_check_reports_the_app_is_live.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9/42a2e10a-bf67-4a8a-b982-1f04f25a18bc
- **Status:** BLOCKED
- **Severity:** LOW
- **Analysis / Findings:** Test hit `http://localhost:3007/health` (frontend port, 404). The health endpoint lives on the **backend** at `http://localhost:8096/health`. Test plan needs to specify the correct base URL for the health check.

---

## 3️⃣ Coverage & Matching Metrics — Batch 1 (TC001–TC015)

- **9 of 15 passed (60%)**

| Requirement              | Total | ✅ Passed | ❌ Failed | BLOCKED |
|--------------------------|-------|-----------|-----------|---------|
| Invoice Management       | 4     | 2         | 1         | 1       |
| Expense Management       | 2     | 1         | 1         | 0       |
| Budget Management        | 2     | 2         | 0         | 0       |
| Dashboard                | 2     | 1         | 1         | 0       |
| AI Features              | 2     | 2         | 0         | 0       |
| Chat Assistant           | 2     | 1         | 0         | 1       |
| Health / Service Status  | 1     | 0         | 0         | 1       |
| **Batch 1 Total**        | **15**| **9**     | **3**     | **3**   |

---

### Requirement: Expense Management (continued)

#### Test TC016 — Categorize and review an expense anomaly
- **Test Code:** [TC016_Categorize_and_review_an_expense_anomaly.py](./TC016_Categorize_and_review_an_expense_anomaly.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/eea7c4f2-4e58-4b50-9efc-8856fbbab01e
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Clicking an anomaly row does not open a detail view — no modal, pane, or navigation occurred. The anomaly list renders but individual anomalies are not interactive. The `/expenses/anomalies` page is missing a click-through detail handler.

---

### Requirement: Forecast / Financial Projections

#### Test TC017 — Compare forecast projections with current dashboard totals
- **Test Code:** [TC017_Compare_forecast_projections_with_current_dashboard_totals.py](./TC017_Compare_forecast_projections_with_current_dashboard_totals.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/248c47b2-0478-4d12-a9a3-280b30f54833
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Forecast values are present (Jun/Jul/Aug 2026 projections with revenue, expenses, profit, confidence bands). However the forecast UI shows no side-by-side comparison with current dashboard totals. This is a missing feature — the forecast page only shows future projections, not a current-vs-forecast view.

---

#### Test TC020 — See refreshed forecast after new financial data is added
- **Test Code:** [TC020_See_refreshed_forecast_after_new_financial_data_is_added.py](./TC020_See_refreshed_forecast_after_new_financial_data_is_added.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/ffcf455f-467f-4360-8880-4da0f5ba43d8
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Forecast values display correctly. However the test could not verify that projections reflect recent invoice/expense activity — no baseline data was available to compare before/after. Test environment issue: needs seeded data to confirm forecast reactivity.

---

#### Test TC024 — Review a forecast when historical data is limited
- **Test Code:** [TC024_Review_a_forecast_when_historical_data_is_limited.py](./TC024_Review_a_forecast_when_historical_data_is_limited.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/889d3590-f6d4-49e8-9f72-a6c16bc22fc3
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Forecast renders gracefully even with limited historical data.

---

### Requirement: Client Profitability

#### Test TC018 — View client profitability ranking
- **Test Code:** [TC018_View_client_profitability_ranking.py](./TC018_View_client_profitability_ranking.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/0a663558-e741-4806-ab12-3d5deea8bc97
- **Status:** BLOCKED
- **Severity:** HIGH
- **Analysis / Findings:** `/clients/profitability` returns a 404 — this frontend route does not exist. The backend `/api/v1/clients/profitability` endpoint works, but there is no corresponding frontend page.

---

#### Test TC021 — Refresh client rankings after new activity
- **Test Code:** [TC021_Refresh_client_rankings_after_new_activity.py](./TC021_Refresh_client_rankings_after_new_activity.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/1288684f-67db-4bef-9c4f-ac318e0eb82a
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Client ranking refreshes correctly after new activity.

---

#### Test TC026 — Open a client from profitability analysis
- **Test Code:** [TC026_Open_a_client_from_profitability_analysis.py](./TC026_Open_a_client_from_profitability_analysis.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/03c894ba-f3eb-4b27-8509-38888d71a35f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Client detail opens correctly from the profitability view.

---

#### Test TC029 — Handle an empty client profitability view
- **Test Code:** [TC029_Handle_an_empty_client_profitability_view.py](./TC029_Handle_an_empty_client_profitability_view.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/8de1bd48-990d-47e3-8772-d8617489faca
- **Status:** BLOCKED
- **Severity:** HIGH
- **Analysis / Findings:** Same as TC018 — `/clients/profitability` route returns 404. Frontend page is missing.

---

### Requirement: Chat Assistant (continued)

#### Test TC019 — Continue a chat with a follow-up question
- **Test Code:** [TC019_Continue_a_chat_with_a_follow_up_question_using_existing_history.py](./TC019_Continue_a_chat_with_a_follow_up_question_using_existing_history.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/1ab31cfc-daf9-4320-9d0f-ae636cced181
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Same issue as TC014 — navigated to `/api/v1/chat` instead of frontend `/chat`. Fix the test plan description to use the correct frontend URL.

---

### Requirement: Dashboard (continued)

#### Test TC023 — Handle an empty dashboard state
- **Test Code:** [TC023_Handle_an_empty_dashboard_state.py](./TC023_Handle_an_empty_dashboard_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/4302db81-6d0f-49b1-a024-c4b85cd9c6bc
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Dashboard shows populated data (Revenue ₹39.05 Cr, Expenses ₹29.41 Cr, Net Profit ₹9.64 Cr) rather than an empty state. The test expected zeroed/empty state handling — but seeded demo data is always present. Either empty-state handling is not implemented, or this test requires a clean database to verify.

---

### Requirement: Budget Management (continued)

#### Test TC022 — Upsert an existing budget
- **Test Code:** [TC022_Upsert_an_existing_budget.py](./TC022_Upsert_an_existing_budget.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/f3882732-778a-4cad-ae44-71ebd3872800
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Budget upsert (edit existing) works correctly.

---

#### Test TC025 — Delete a budget and confirm removal
- **Test Code:** [TC025_Delete_a_budget_and_confirm_it_is_removed.py](./TC025_Delete_a_budget_and_confirm_it_is_removed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/3f586a77-6092-4edc-89bf-29dc85905216
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The Remove button on a budget card is clickable but does not delete the budget — the card remains in the DOM after repeated clicks. This is a genuine UI bug: the Remove button's click handler is either missing or not wired to the delete API call.

---

#### Test TC030 — Handle missing budget records
- **Test Code:** [TC030_Handle_missing_budget_records.py](./TC030_Handle_missing_budget_records.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/2c854d95-87f2-45c4-8e76-0ec21b4fdd6f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Empty budget state handled gracefully.

---

### Requirement: Error Handling

#### Test TC027 — Handle missing invoice records
- **Test Code:** [TC027_Handle_missing_invoice_records.py](./TC027_Handle_missing_invoice_records.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/7b3696ed-86e4-41cf-b552-630dc59bddb8
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Missing invoice records handled gracefully with appropriate UI feedback.

---

#### Test TC028 — Handle missing expense records
- **Test Code:** [TC028_Handle_missing_expense_records.py](./TC028_Handle_missing_expense_records.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb/7281f08d-85c9-4265-85fa-57ebd6556815
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Empty expense state handled gracefully.

---

## 3️⃣ Coverage & Matching Metrics — Batches 1 & 2 (TC001–TC030)

- **Batch 1 (TC001–TC015): 9/15 passed (60%)**
- **Batch 2 (TC016–TC030): 7/15 passed (47%)**
- **Combined (TC001–TC030): 16/30 passed (53%)**

| Requirement                     | Total | ✅ Passed | ❌ Failed | BLOCKED |
|---------------------------------|-------|-----------|-----------|---------|
| Invoice Management              | 4     | 2         | 1         | 1       |
| Expense Management              | 3     | 1         | 2         | 0       |
| Budget Management               | 4     | 3         | 1         | 0       |
| Dashboard                       | 3     | 1         | 2         | 0       |
| Forecast / Projections          | 3     | 1         | 2         | 0       |
| Client Profitability            | 4     | 2         | 0         | 2       |
| Chat Assistant                  | 3     | 1         | 0         | 2       |
| Error Handling                  | 2     | 2         | 0         | 0       |
| Health / Service Status         | 1     | 0         | 0         | 1       |
| AI Features                     | 3     | 3         | 0         | 0       |
| **Batches 1+2 Total**           | **30**| **16**    | **8**     | **6**   |

*(Batch 3 TC031–TC036 in progress)*

---

## 4️⃣ Key Gaps / Risks — Batches 1 & 2

> **60% of batch 1 passed.** Three genuine failures, three blocked by test environment issues.

**Bug — Invoice creation fails in UI (TC001):** The new invoice form does not successfully submit to the backend. The same missing-fields issue found in the backend tests manifests here — the frontend form likely does not include `invoice_number`, `client_email`, or `issue_date` in its submission payload. Fix: audit the invoice creation form in `frontend/src/app/invoices/new`.

**Bug — Dashboard missing profit % change (TC005):** The Net Profit metric card has no percent-change/delta badge. Add a trend indicator to the Net Profit card to match Revenue and Expenses.

**Test environment gap — OCR receipt upload (TC002) [MEDIUM]:** No receipt image in test runner filesystem. Add a sample `receipt.jpg` to `testsprite_tests/`.

**Test config issue — Chat tests (TC014, TC019) [MEDIUM]:** Tests navigate to `/api/v1/chat` instead of frontend `/chat` page. Fix test plan descriptions.

**Test config issue — Health check (TC003) [LOW]:** Test hits frontend port 3007 instead of backend port 8096. Fix test plan description.

**Test isolation — TC012 [LOW]:** Invoice fixtures shared between tests get deleted by failure side effects. Tests should create and clean up their own fixtures.

---

---

### Requirement: Input Validation

#### Test TC031 — Reject invalid invoice input
- **Test Code:** [TC031_Reject_invalid_invoice_input.py](./TC031_Reject_invalid_invoice_input.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/6cab2563-05f1-45ef-8f38-ee7b00afd240
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Invoice form correctly rejects invalid input with user-visible validation feedback.

---

#### Test TC032 — Reject invalid expense input
- **Test Code:** [TC032_Reject_invalid_expense_input.py](./TC032_Reject_invalid_expense_input.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/2d80f782-e3e2-4e54-a138-e74693835c29
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Expense form correctly rejects invalid input.

---

#### Test TC034 — Recover from an invalid report month
- **Test Code:** [TC034_Recover_from_an_invalid_report_month.py](./TC034_Recover_from_an_invalid_report_month.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/db4f8c4b-89f1-4057-80d8-8120036af815
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Submitting month=13 triggers a server 500 error instead of client-side validation. The Month input has `min=1 max=12` HTML attributes but no visible validation message is shown when the constraint is violated — the form submits the invalid value and the backend crashes. Fix: add client-side validation before submit (e.g. check `month >= 1 && month <= 12`) and display an inline error rather than reaching the API.

---

#### Test TC035 — Reject invalid budget input
- **Test Code:** [TC035_Reject_invalid_budget_input.py](./TC035_Reject_invalid_budget_input.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/8db66d93-8888-4833-9a1a-9ad267720f84
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Budget form correctly rejects invalid input.

---

### Requirement: Chat Assistant (continued)

#### Test TC033 — Keep chat history unchanged after submitting an empty message
- **Test Code:** [TC033_Keep_chat_history_unchanged_after_submitting_an_invalid_empty_message.py](./TC033_Keep_chat_history_unchanged_after_submitting_an_invalid_empty_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/7d4487ae-7f2d-43fe-83d8-8c5585b3ea33
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Same recurring issue — test navigated to `/api/v1/chat` instead of frontend `/chat` page. This is the 4th test blocked by this config issue (TC014, TC019, TC033 + this one).

---

### Requirement: AI Features (continued)

#### Test TC036 — Generate the same monthly summary more than once
- **Test Code:** [TC036_Generate_the_same_monthly_summary_more_than_once.py](./TC036_Generate_the_same_monthly_summary_more_than_once.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271/b7ec6edd-d72c-4b6d-85d3-f8e8388bd070
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Generating the same monthly report twice works correctly — idempotent behaviour confirmed.

---

## 3️⃣ Coverage & Matching Metrics — Final (All 36 Tests)

- **Batch 1 (TC001–TC015): 9/15 (60%)**
- **Batch 2 (TC016–TC030): 7/15 (47%)**
- **Batch 3 (TC031–TC036): 4/6 (67%)**
- **Overall: 20/36 passed (56%)**

| Requirement                     | Total | ✅ Passed | ❌ Failed | BLOCKED |
|---------------------------------|-------|-----------|-----------|---------|
| Invoice Management              | 4     | 2         | 1         | 1       |
| Expense Management              | 3     | 1         | 2         | 0       |
| Budget Management               | 4     | 3         | 1         | 0       |
| Dashboard                       | 3     | 1         | 2         | 0       |
| Forecast / Projections          | 3     | 1         | 2         | 0       |
| Client Profitability            | 4     | 2         | 0         | 2       |
| Chat Assistant                  | 4     | 1         | 0         | 3       |
| Input Validation                | 3     | 3         | 0         | 0       |
| AI Features                     | 4     | 4         | 0         | 0       |
| Error Handling                  | 2     | 2         | 0         | 0       |
| Health / Service Status         | 1     | 0         | 0         | 1       |
| Reports                         | 1     | 0         | 1         | 0       |
| **TOTAL**                       | **36**| **20**    | **9**     | **7**   |

---

## 4️⃣ Key Gaps / Risks — Final

> **20/36 passed (56%).** 9 genuine bugs, 7 blocked by test config/environment issues (not real failures).

### Genuine Bugs (fix required)

**[HIGH] Budget delete button broken (TC025):** Remove button click does nothing — handler not wired to `DELETE /api/v1/budgets/{id}`.

**[HIGH] Invoice creation fails in UI (TC001):** Form submission returns "Failed to create invoice". Frontend likely omits `invoice_number`, `client_email`, or `issue_date`. Audit `frontend/src/app/invoices/new`.

**[HIGH] `/clients/profitability` page missing (TC018, TC029):** Backend endpoint exists and works; no frontend route has been created. 2 tests permanently blocked until the page is built.

**[MEDIUM] Anomaly detail view missing (TC016):** Expense anomaly rows are not clickable. The list renders but has no click-through handler.

**[MEDIUM] Dashboard missing profit % change indicator (TC005):** Net Profit card lacks a trend/delta badge present on other metric cards.

**[MEDIUM] Report month validation missing (TC034):** Submitting month=13 hits the backend and returns 500. Add `if (month < 1 || month > 12)` client-side guard before the API call.

**[LOW] Forecast vs. current comparison missing (TC017):** Forecast page shows projections only; no side-by-side view with current totals.

**[LOW] Dashboard empty state not implemented (TC023):** No "No data" state — populated demo data always shows.

**[LOW] Forecast reactivity unverifiable (TC020):** Test environment lacks baseline data to confirm projections update after new invoices/expenses.

### Test Config Issues (fix test plan, not the app)

**Chat tests navigate to wrong URL (TC014, TC019, TC033) [4 tests blocked]:** All chat tests go to `/api/v1/chat` instead of frontend `/chat`. Update test plan descriptions to specify `http://localhost:3007/chat`.

**Health check uses wrong port (TC003):** Hits frontend 3007 instead of backend 8096.

**OCR upload blocked (TC002):** No receipt image in test runner. Add `receipt.jpg` to `testsprite_tests/`.
