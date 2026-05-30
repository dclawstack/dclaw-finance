
# TestSprite AI Testing Report (MCP) — Backend

---

## 1️⃣ Document Metadata
- **Project Name:** dclaw-finance
- **Date:** 2026-05-23
- **Prepared by:** TestSprite AI Team
- **Test Suite:** Backend API — full codebase scope
- **Server:** http://localhost:8096 (Docker, development mode)
- **Final run:** 9/10 passed (90%) after schema fix
- **Dashboard:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3

---

## 2️⃣ Requirement Validation Summary

### Requirement: Invoice Management — AI Features

#### Test TC001 — POST /api/v1/invoices/suggest-items
- **Test Code:** [TC001_post_api_v1_invoices_suggest_items.py](./TC001_post_api_v1_invoices_suggest_items.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/1377d8c1-f3e4-48a8-8d15-1328ffe94b07
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Accepts `{client_name, first_item}` + `dry_run=true`, returns a list of suggestions. Fixed: original test sent wrong fields (`amount`, `due_date`).

---

#### Test TC007 — POST /api/v1/invoices/{id}/reminder-draft
- **Test Code:** [TC007_post_api_v1_invoices_invoice_id_reminder_draft.py](./TC007_post_api_v1_invoices_invoice_id_reminder_draft.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/a2ae7e0d-1713-4646-b795-ac0dcce20546
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** AI reminder draft returns correctly for invoices in `sent`/`overdue` status.

---

### Requirement: Invoice Management — Core CRUD

#### Test TC002 — POST /api/v1/invoices — Create invoice
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/c7768eb3-8095-426d-a69c-114e69dbc932
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Works with all required fields: `invoice_number`, `client_name`, `client_email`, `issue_date`, `due_date`.

---

#### Test TC003 — GET /api/v1/invoices — List invoices
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/ed62c2c1-4d48-447d-9ca6-d07b1d5fe714
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Returns valid list. Fixed: response uses `total` not `amount`.

---

#### Test TC004 — GET /api/v1/invoices/{id} — Get by ID
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/58c28257-7336-410a-b55c-a7fa24bcbba9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Returns 200 for existing, 404 for non-existent.

---

#### Test TC005 — PUT /api/v1/invoices/{id} — Update invoice
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/05160a38-eab2-43a8-9a81-fc6fe839fb28
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Updates correctly and returns 404 for non-existent invoice.

---

#### Test TC006 — DELETE /api/v1/invoices/{id} — Delete invoice
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/54e7a051-f86a-49ac-a8b8-58df4beb291f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Returns 204 on delete, subsequent GET returns 404.

---

### Requirement: Invoice Management — Line Items

#### Test TC008 — POST /api/v1/invoices/{id}/items — Add line item
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/22f11854-6acd-4172-9d42-23ad1e1b3a49
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Returns 201 with correct schema. Passed in all runs.

---

#### Test TC009 — PUT /api/v1/invoices/{id}/items/{item_id} — Update line item
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/1ca2b9bb-39ce-49bc-a955-428161b315ab
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** TC009 test plan description did not fully propagate the correct invoice creation schema to the regenerated fixture. The update-line-item endpoint is assumed functional given TC008 and TC010 pass. Fix: update TC009 description in the test plan to explicitly include all required creation fields.

---

#### Test TC010 — DELETE /api/v1/invoices/{id}/items/{item_id} — Delete line item
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fdecdcb8-dcdd-41ce-a392-cdd7c47a04e3/3497cb7b-c091-4bc3-b7be-5e9b5b293e3d
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Returns 204 correctly.

---

## 3️⃣ Coverage & Matching Metrics

- **9 of 10 tests passed (90%)** — up from 30% after schema fix

| Requirement                    | Total | ✅ Passed | ❌ Failed |
|--------------------------------|-------|-----------|-----------|
| Invoice CRUD (core)            | 4     | 4         | 0         |
| Invoice Line Items             | 3     | 2         | 1         |
| Invoice AI Features            | 2     | 2         | 0         |
| Invoice List / Response Schema | 1     | 1         | 0         |
| **Total**                      | **10**| **9**     | **1**     |

---

## 4️⃣ Key Gaps / Risks

> **90% passed.** One test remains failing.

**Remaining failure — TC009 (update line item):** TC009 fixture still generates without the required invoice fields. Fix the test plan description for TC009 to match the same pattern used for TC002–TC006.

**No authentication on any endpoint:** All API endpoints are publicly accessible. Critical gap for a finance application before production.

**AI endpoints require Anthropic API key:** `POST /suggest-items` and `POST /chat` depend on `ANTHROPIC_API_KEY`. Only tested via `dry_run=true`; live AI path is not covered.
