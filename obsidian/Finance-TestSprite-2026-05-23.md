# DClaw Finance — TestSprite AI Testing Results

> Run date: 2026-05-23 · Tool: TestSprite MCP
> Backend: 9/10 passed (90%) · Frontend: 20/36 passed (56%)

---

## Backend Results (10 tests)

Dashboard: https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3

| Test | Endpoint | Status |
|---|---|---|
| TC001 | POST /api/v1/invoices/suggest-items | ✅ Passed |
| TC002 | POST /api/v1/invoices | ✅ Passed |
| TC003 | GET /api/v1/invoices | ✅ Passed |
| TC004 | GET /api/v1/invoices/{id} | ✅ Passed |
| TC005 | PUT /api/v1/invoices/{id} | ✅ Passed |
| TC006 | DELETE /api/v1/invoices/{id} | ✅ Passed |
| TC007 | POST /api/v1/invoices/{id}/reminder-draft | ✅ Passed |
| TC008 | POST /api/v1/invoices/{id}/items | ✅ Passed |
| TC009 | PUT /api/v1/invoices/{id}/items/{item_id} | ❌ Failed |
| TC010 | DELETE /api/v1/invoices/{id}/items/{item_id} | ✅ Passed |

**TC009 failure:** Test fixture omits required invoice creation fields — not an API bug. Fix: update TC009 description in `testsprite_backend_test_plan.json` to include `invoice_number`, `client_email`, `issue_date`, `due_date`.

**Key findings:**
- `InvoiceCreate` requires: `invoice_number`, `client_name`, `client_email`, `issue_date` (YYYY-MM-DD), `due_date` (YYYY-MM-DD)
- `InvoiceResponse` uses `total`/`subtotal`/`tax_amount` — not `amount`
- `SuggestItemsRequest` takes `client_name` + `first_item` — supports `dry_run=true`
- AI endpoints (suggest-items, reminder-draft) only tested via dry_run; live path untested

> [!warning] No authentication on any endpoint — critical gap before production.

---

## Frontend Results (36 tests across 3 batches)

| Batch | Tests | Passed | Dashboard |
|---|---|---|---|
| Batch 1 (TC001–TC015) | 15 | 9 | https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9 |
| Batch 2 (TC016–TC030) | 15 | 7 | https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb |
| Batch 3 (TC031–TC036) | 6 | 4 | https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271 |

---

## Confirmed Bugs (genuine app issues)

| # | Area | Bug |
|---|---|---|
| 1 | Budgets | DELETE budget returns error — budget deletion broken |
| 2 | Invoice creation | Form missing required `invoice_number` field — POST fails with 422 |
| 3 | Clients | `/clients/profitability` page does not exist — returns 404 |
| 4 | Analytics | Anomaly detection rows not clickable — no drill-down navigation |
| 5 | Dashboard | Profit percentage metric missing from KPI cards |
| 6 | Reports | Month input has `min=1 max=12` HTML constraint but invalid month triggers 500 instead of client-side validation message |
| 7 | Forecast | Forecast page does not show comparison between current vs projected |
| 8 | Dashboard | No empty state shown when there is no data |
| 9 | Forecast | Forecast chart reactivity unverifiable without live data seeded |

---

## Test Config Issues (not app bugs)

1. Chat tests (TC014, TC019, TC033) navigated to `/api/v1/chat` via GET — should target `http://localhost:3007/chat`
2. Health-check test used wrong host (frontend URL instead of backend)
3. TC009 fixture lacks required invoice fields (see backend section)

---

## Recommendations

1. **Fix invoice creation form** — add `invoice_number` field (`frontend/src/app/invoices/new/page.tsx`)
2. **Fix budget DELETE** — investigate `BudgetRepository.delete` or route handler
3. **Add client-side month validation** — show error before hitting API for out-of-range month
4. **Create `/clients/profitability` page** or remove profitability links from nav
5. **Add authentication** — all `/api/v1/*` endpoints are open; add bearer token or session auth before production
6. **Fix chat test plan descriptions** — specify `http://localhost:3007/chat` as target URL
7. **Fix TC009 test plan** — add full invoice fixture fields to description

---

## Links

- [[Finance-Architecture]] — ports, stack, anti-patterns
- [[Finance-v1.2-Roadmap]] — feature roadmap
- Backend report: `testsprite_tests/testsprite-mcp-backend-report.md`
- Frontend report: `testsprite_tests/testsprite-mcp-frontend-report.md`
