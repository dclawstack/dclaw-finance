# Test Artifacts Folder
# Run date: 2026-05-23
# Backend: 10 tests (9 passed, 1 failed) | Frontend: 36 tests across 3 batches (20 passed, 16 failed/blocked)

---

## What's in here

| File / Folder | Contents |
|---|---|
| `test_files/` | ALL 46 `.py` test files — 36 frontend (all 3 batches) + 10 backend |
| `test_results_batch3_raw.json` | Raw TestSprite JSON for batch 3 (TC031–TC036, 6 tests) |
| `terminal_errors.md` | Full error text for all 17 failures/blocks |

---

## Raw JSON — what's available vs what's not

TestSprite writes results to `testsprite_tests/tmp/test_results.json` and **overwrites it on every run**.
Four runs were executed: backend (10 tests), batch 1 (15), batch 2 (15), batch 3 (6).
Only the last run survives locally.

| Run | Tests | Local JSON | Where to get full JSON |
|---|---|---|---|
| Backend | 10 | NOT available (overwritten) | https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3 |
| Frontend batch 1 (TC001–TC015) | 15 | NOT available (overwritten) | https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9 |
| Frontend batch 2 (TC016–TC030) | 15 | NOT available (overwritten) | https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb |
| Frontend batch 3 (TC031–TC036) | 6 | **`test_results_batch3_raw.json`** | https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271 |

To get the missing JSONs, visit each dashboard URL → export or copy the results payload.

---

## What's NOT available locally

| Artifact | Where to find it |
|---|---|
| Browser screen recordings (webm) | S3 — individual URLs listed in `terminal_errors.md` per test |
| Browser console logs / network HAR | Embedded in the webm recordings — no separate file |
| Playwright traces (.zip) | Not generated — TestSprite runs tests server-side without local trace output |

---

## Test files in test_files/

### Backend failures (1)
| File | Status | Root cause |
|---|---|---|
| `TC009_put_api_v1_invoices_invoice_id_items_item_id_update_line_item.py` | FAILED | Fixture missing required invoice fields in test plan |

### Frontend failures (9 FAILED)
| File | Status | Root cause |
|---|---|---|
| `TC001_Create_and_view_an_invoice.py` | FAILED | Form omits invoice_number/client_email/issue_date → 422 |
| `TC002_Scan_a_receipt_and_create_an_expense.py` | FAILED | No receipt.jpg in test runner filesystem |
| `TC005_View_dashboard_summary_metrics.py` | FAILED | Net Profit card missing % change indicator |
| `TC016_Categorize_and_review_an_expense_anomaly.py` | FAILED | Anomaly rows not clickable — handler missing |
| `TC017_Compare_forecast_projections_with_current_dashboard_totals.py` | FAILED | Forecast page missing current-vs-projected view |
| `TC020_See_refreshed_forecast_after_new_financial_data_is_added.py` | FAILED | No baseline data to compare before/after |
| `TC023_Handle_an_empty_dashboard_state.py` | FAILED | Empty state UI not implemented |
| `TC025_Delete_a_budget_and_confirm_it_is_removed.py` | FAILED | Remove button click handler not wired to DELETE API |
| `TC034_Recover_from_an_invalid_report_month.py` | FAILED | Month input submits invalid value → backend 500 |

### Frontend blocked (7 BLOCKED — test config issues, not app bugs)
| File | Status | Root cause |
|---|---|---|
| `TC003_Verify_the_service_health_check_reports_the_app_is_live.py` | BLOCKED | Hits frontend :3007/health instead of backend :8096/health |
| `TC012_Generate_and_delete_an_invoice_reminder_draft.py` | BLOCKED | Shared fixture deleted by TC001 side effects |
| `TC014_Send_a_financial_question_to_the_chat_assistant_and_view_the_reply.py` | BLOCKED | Navigates to /api/v1/chat instead of frontend /chat |
| `TC018_View_client_profitability_ranking.py` | BLOCKED | /clients/profitability page doesn't exist (missing frontend page) |
| `TC019_Continue_a_chat_with_a_follow_up_question_using_existing_history.py` | BLOCKED | Same as TC014 — wrong URL |
| `TC029_Handle_an_empty_client_profitability_view.py` | BLOCKED | Same as TC018 — missing frontend page |
| `TC033_Keep_chat_history_unchanged_after_submitting_an_invalid_empty_message.py` | BLOCKED | Same as TC014 — wrong URL |

---

## How to get browser recordings

Each test has a `testVisualization` field in the raw JSON (batch 3) or in the report.
These are `.webm` screen recordings hosted on S3. Copy a URL from `terminal_errors.md`
and open it in a browser or `curl` it.

Example (TC034):
```
https://testsprite-videos.s3.us-east-1.amazonaws.com/84783428-c0b1-70c7-bdd4-f4417332967f/1779529568212704//tmp/test_task/result.webm
```

---

## How to re-run a specific test locally

```bash
cd /home/chandraja/AI_white_noise/dclaw/dclaw-finance/testsprite_tests/failed_tests/test_files
pip install playwright && playwright install chromium
python TC025_Delete_a_budget_and_confirm_it_is_removed.py
```

Requires:
- Backend running on :8096 (docker compose up backend)
- Frontend running on :3007 (docker compose up frontend OR npm run start -- -p 3007)
- PostgreSQL on :5434 (docker compose up postgres)
