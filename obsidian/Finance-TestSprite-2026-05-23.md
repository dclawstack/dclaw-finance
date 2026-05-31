# DClaw Finance — TestSprite AI Testing Results

> Run date: 2026-05-23 · Tool: TestSprite MCP
> Backend: 9/10 passed (90%) · Frontend: 20/36 passed (56%)
> Analysis completed: 2026-05-28 · Findings incorporated into [[Finance-v1.4-Roadmap]] (B1–B6)

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

**TC009 failure:** Test fixture bug — sends rogue `amount` field not in `InvoiceCreate` schema. API endpoint is functional; fix the test description in `testsprite_backend_test_plan.json` only.

**Key API contract findings:**
- `InvoiceCreate` requires: `invoice_number`, `client_name`, `client_email`, `issue_date` (YYYY-MM-DD), `due_date`
- `InvoiceResponse` uses `total`/`subtotal`/`tax_amount` — not `amount`
- `SuggestItemsRequest` takes `client_name` + `first_item`; supports `?dry_run=true`
- AI endpoints only tested via `dry_run=true`; live path uncovered

> [!warning] No authentication on any endpoint — critical gap. Tracked as S1–S2 in [[Finance-v1.4-Roadmap]].

---

## Frontend Results (36 tests)

| Batch | Tests | Passed | Dashboard |
|---|---|---|---|
| Batch 1 (TC001–TC015) | 15 | 9 | https://www.testsprite.com/dashboard/mcp/tests/0d7ab182-f401-4f80-8f06-4c7814455fa9 |
| Batch 2 (TC016–TC030) | 15 | 7 | https://www.testsprite.com/dashboard/mcp/tests/b687a168-55ab-45d8-b81f-a2e38b10c9fb |
| Batch 3 (TC031–TC036) | 6 | 4 | https://www.testsprite.com/dashboard/mcp/tests/863a705d-d9b7-4505-a95b-c6b7cb152271 |

---

## Confirmed Bugs (genuine app issues → B1–B6 in PLAN-v1.4)

| ID | Area | Bug | Priority |
|---|---|---|---|
| B1 | All DELETEs | `api()` always calls `res.json()` on 204 — silent error, stale UI | CRITICAL |
| B2 | Invoice creation | Empty line item description bypasses HTML validation → 422; `$` instead of `₹` | HIGH |
| B3 | Reports | month=13 hits backend → 500 (no client-side guard, no Pydantic constraint) | MEDIUM |
| B4 | Clients | `/clients/profitability` page missing in `web/` — Next.js 404 | HIGH |
| B5 | Dashboard | Net Profit card missing MoM % change indicator | MEDIUM |
| B6 | Expenses | Anomaly rows not clickable — AI explanation inaccessible | MEDIUM |

---

## Test Config Issues (not app bugs — update test descriptions only)

| TC | Issue | Fix |
|---|---|---|
| TC003 | Health check hits frontend URL instead of backend | Change to `http://localhost:8096/health` |
| TC012 | Fixture invoice not found (cascade from TC001 failure) | Each test must create + tear down its own fixture |
| TC014, TC019, TC033 | Navigate to `/api/v1/chat` via GET | Change to `http://localhost:3007/chat` |
| TC018, TC029 | Navigate to `/clients/profitability` → 404 | App fix (B4) or update test plan URL to `/clients` |
| TC009 | Rogue `amount` field in fixture | Remove `amount` from InvoiceCreate payload in test |

---

## Systemic Patterns Identified

1. **`<Button onClick>` bypasses HTML form validation everywhere** — `reports/`, `budgets/`, `expenses/new/`. Add explicit guards in every handler + Pydantic `Field(ge=..., le=...)` on backend.
2. **Async onClick handlers lack try/catch** — any async failure leaves UI stale. Audit every `async` event handler.
3. **React Fragment missing `key` prop** — `clients/page.tsx:69`. Replace `<>` with `<Fragment key={...}>`.
4. **Test isolation** — shared fixtures cause cascade failures. Every test must own its setup/teardown.

---

## Full Analysis

See `testsprite_tests/failed_tests/FAILURE_ANALYSIS.md` for complete root-cause analysis, blast-radius tables, and code-level fix instructions.

---

## Links

- [[Finance-Architecture]] — ports, stack, anti-patterns
- [[Finance-v1.4-Roadmap]] — B1–B6 implementation plan
- [[Finance-TestForge-2026-05-31]] — follow-up security audit (S1–S7)
- Backend report: `testsprite_tests/testsprite-mcp-backend-report.md`
- Frontend report: `testsprite_tests/testsprite-mcp-frontend-report.md`
- Failure analysis: `testsprite_tests/failed_tests/FAILURE_ANALYSIS.md`
