# Finance — v1.4 Implementation Plan

> **Builds on v1.3 strategic direction.** Integrates six confirmed product defects and four
> systemic engineering gaps found in the 2026-05-23 TestSprite automated testing audit
> (46 tests: 10 backend, 36 frontend across 3 batches).
>
> **For coding agents:** Complete all Bug Sprint items (B1–B6) before touching any v1.3
> infrastructure. They are small, self-contained, and unblock core workflows that otherwise
> fail silently. After the bug sprint, follow the v1.3 implementation order unchanged.
> Do NOT change the locked stack. See `AGENTS.md`.

---

## Strategic Position (unchanged from v1.3)

| | v1.2/v1.3 |
|---|---|
| **Problem** | GST compliance + cash flow for Indian SaaS founders |
| **Target user** | Bootstrapped Indian SaaS founder, ₹1–20Cr ARR |
| **Competition** | Tally (compliance-only) + spreadsheets (flexible, no compliance) |
| **Moat** | Only tool that handles GST end-to-end AND thinks in natural language |
| **Hair-on-fire** | Monthly GST filing: GSTR-1, GSTR-2B reconciliation, ITC mismatch |

---

## Pre-Flight Checklist — Do This Before Any Feature

- [x] All v1.2 features complete (see `PLAN-v1.2.md` for inventory)
- [ ] Bug sprint B1–B6 complete and manually verified
- [ ] Multi-tenancy schema in place (`tenant_id` on all tables, RLS policies)
- [ ] JWT auth endpoints live (`/auth/register`, `/auth/login`, `/auth/refresh`)
- [ ] Redis in `docker-compose.yml`; ARQ worker container added
- [ ] `GSTIN` field on `Company` model
- [ ] Real pilot customer identified — seed data represents their actual data

---

## Bug Sprint — Fix Before Any v1.3 Feature

Six genuine product defects confirmed by automated testing. All are small (1–20 lines),
target existing files, and fix broken or incomplete core workflows.
**Complete all six before starting v1.3 infrastructure work.**

---

### B1 — `api()` silently swallows 204 responses [CRITICAL — systemic] ❌

**Root cause:** `src/lib/api.ts`'s shared `api()` helper always calls `res.json()` even on
204 No Content responses. `res.json()` on an empty body throws `SyntaxError: Unexpected end
of JSON input`. Async event handlers that call `deleteX()` have no try/catch, so the error
is dropped silently by React, leaving stale UI while the backend delete already succeeded.

**Affected flows:** budget delete (TC025), invoice delete, expense delete — all three DELETE
operations share this path.

**Product impact:** Users click "Remove/Delete", nothing appears to happen. On refresh, the
record is gone. The illusion of a broken delete button degrades trust in the entire product.

**Fix — `frontend/src/lib/api.ts`:**
```typescript
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return (await res.json()) as T;
}
```

**Fix — `frontend/src/app/budgets/page.tsx` — add try/catch to `handleDelete`:**
```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteBudget(id);
    setEditingId(null);
    await load();
    await loadStatus();
  } catch (e: unknown) {
    alert(`Failed to remove budget: ${e instanceof Error ? e.message : "error"}`);
  }
};
```

**Audit required:** Check every `async` onClick handler across all pages (`invoices/`,
`expenses/`, `budgets/`). Wrap all delete and mutating handlers in try/catch.

**Priority:** CRITICAL · **Effort:** 1 line in api.ts + ~5 lines per handler

---

### B2 — Invoice form submits with empty line item description → 422 [HIGH] ❌

**Root cause:** `invoices/new/page.tsx` initialises with a blank line item
`{ description: "", quantity: 1, unit_price: 0 }`. The `<Button onClick>` submit pattern
bypasses native HTML `required` validation. Submitting with an empty description hits
the backend, which validates it as required and returns 422. The catch block fires
`alert("Failed to create invoice.")` in a headless-browser-dismissal loop, clearing the DOM.

**Secondary bug:** Line item amounts and totals display `$` instead of `₹` (missed by the
v1.2 INR formatting sweep).

**Affected flows:** Invoice creation — the primary revenue-generating workflow.

**Product impact:** Invoice creation is broken in automated/accessibility contexts and fails
non-obviously in manual use when the user forgets to fill in the item description.

**Fix — `frontend/src/app/invoices/new/page.tsx`:**

Add guard in `handleSubmit`:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (items.some((it) => !it.description.trim())) {
    alert("All line items must have a description.");
    return;
  }
  setSaving(true);
  try {
    await createInvoice({ ... });
    router.push("/invoices");
  } catch {
    alert("Failed to create invoice.");
    setSaving(false);
  }
};
```

Fix currency display (same file):
```typescript
// line item amount column
- ${(item.quantity * item.unit_price).toFixed(2)}
+ {formatINR(item.quantity * item.unit_price)}

// footer totals
- Subtotal: ${subtotal.toFixed(2)}  Tax: ${taxAmount.toFixed(2)}  Total: ${total.toFixed(2)}
+ Subtotal: {formatINR(subtotal)}   Tax: {formatINR(taxAmount)}   Total: {formatINR(total)}
```

Confirm `formatINR` is imported from `@/lib/utils` in this file.

**Priority:** HIGH · **Effort:** 8 lines

---

### B3 — Report month=13 hits backend, returns 500 [MEDIUM] ❌

**Root cause:** `reports/page.tsx` uses `<Button onClick>` for submission — `min=1 max=12`
on the month `<Input>` is never enforced. `month=13` is passed directly to the backend.
The backend `MonthlySummaryRequest` schema has no field constraints; `month=13` reaches
`generate_monthly_summary()`, causes an unhandled Python date exception, and returns 500.

**Affected flows:** Monthly report generation — the AI financial summary feature.

**Product impact:** Invalid input causes a server crash instead of a user-facing validation
message. The browser shows a generic "Failed to generate report" alert with no actionable
guidance.

**Fix — `frontend/src/app/reports/page.tsx`:**
```typescript
const handleGenerate = async () => {
  if (month < 1 || month > 12) { alert("Month must be between 1 and 12."); return; }
  if (year < 2000 || year > 2099) { alert("Year must be between 2000 and 2099."); return; }
  setLoading(true);
  ...
```

**Fix — `backend/app/api/v1/reports.py`:**
```python
from pydantic import BaseModel, Field

class MonthlySummaryRequest(BaseModel):
    year: int = Field(ge=2000, le=2099)
    month: int = Field(ge=1, le=12)
```

**Priority:** MEDIUM · **Effort:** 5 lines frontend + 2 lines backend

---

### B4 — `/clients/profitability` returns Next.js 404 [HIGH] 🚫

**Root cause:** The clients page lives at `frontend/src/app/clients/page.tsx` (route: `/clients`).
No `page.tsx` exists at `clients/profitability/`. Two tests (TC018, TC029) navigate to
`/clients/profitability` — matching the backend API path — and hit a 404.

**Affected flows:** Client profitability ranking (TC018) and empty profitability state (TC029).

**Product impact:** Direct-URL access to `/clients/profitability` (e.g., from a shared link
or bookmark) fails with a 404. Two automated tests permanently blocked.

**Fix — create `frontend/src/app/clients/profitability/page.tsx`:**
```typescript
import { redirect } from "next/navigation";

export default function ClientProfitabilityRedirect() {
  redirect("/clients");
}
```

This future-proofs direct-URL access and makes the route self-documenting without changing
the canonical `/clients` route behaviour.

**Priority:** HIGH · **Effort:** 4 lines (new file)

---

### B5 — Dashboard Net Profit card missing MoM % change indicator [MEDIUM] ❌

**Root cause:** The KPI cards array has no delta/trend fields. The `DashboardData` interface
has no previous-period fields. The trend data is already fetched on the page via
`getDashboardTrends()` — previous-month profit is computable client-side with no new API
needed.

**Affected flows:** Dashboard overview — the first screen users see.

**Product impact:** Net Profit appears as a bare number with no directional signal.
Revenue and Expenses cards likely have trend indicators; the asymmetry makes the dashboard
feel unfinished.

**Fix — `frontend/src/app/page.tsx` (or `dashboard/page.tsx`):**

Derive delta from existing trend state:
```typescript
const profitDelta = (() => {
  if (trends.length < 2) return null;
  const prev = trends[trends.length - 2];
  const curr = trends[trends.length - 1];
  const prevProfit = prev.revenue - prev.expenses;
  const currProfit = curr.revenue - curr.expenses;
  if (prevProfit === 0) return null;
  return ((currProfit - prevProfit) / Math.abs(prevProfit)) * 100;
})();
```

In the Net Profit card render:
```tsx
{key === "net_profit" && profitDelta !== null && (
  <p className={`mt-1 text-xs font-semibold tabular-nums ${profitDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
    {profitDelta >= 0 ? "+" : ""}{profitDelta.toFixed(1)}% vs last month
  </p>
)}
```

**Priority:** MEDIUM · **Effort:** 15 lines

---

### B6 — Expense anomaly rows not interactive — no drill-down [MEDIUM] ❌

**Root cause:** Anomaly `<TableRow>` elements have no `onClick` handler and no
`cursor-pointer` styling. Rows are purely presentational. The AI explanation is in the
response payload but inaccessible in the UI without expansion.

**Affected flows:** Expense anomaly review — AI-powered outlier detection.

**Product impact:** The anomaly detection feature is display-only. Users cannot inspect
the AI explanation or navigate to the flagged expense without leaving the table.

**Fix — `frontend/src/app/expenses/page.tsx`:**

Add expand state: `const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);`

Make rows clickable and add expand row with AI explanation + expense link. Full implementation
in `FAILURE_ANALYSIS.md` § TC016 (20-line diff).

**Priority:** MEDIUM · **Effort:** 20 lines

---

## Systemic Engineering Gaps (Address During Bug Sprint or v1.3 Hardening)

These are patterns — not single-file bugs — discovered across the codebase by the audit.

| Gap | Scope | Action |
|---|---|---|
| `<Button onClick>` bypasses HTML form validation | `reports/page.tsx`, `budgets/page.tsx`, `expenses/new/page.tsx` | Add explicit guards in every handler (`if (value < min) return`). Back with Pydantic `Field(ge=..., le=...)` on backend. |
| Async onClick handlers lack try/catch | All pages with delete/mutate actions | Audit every `async` event handler. Wrap in try/catch; surface errors via toast or alert. |
| React Fragment missing `key` prop | `clients/page.tsx:69` | Replace bare `<>` with `<Fragment key={c.client_name}>`. Import `Fragment` from React. |
| AI endpoints only tested via `dry_run=true` | All AI features | Add at least one integration test per AI endpoint using real API keys, gated behind `@pytest.mark.live`. |

---

## P0 — Infrastructure (from v1.3, unchanged)

Complete in this order after the bug sprint.

### 1. Multi-Tenancy + Auth

**Why:** Zero data isolation. Cannot be sold to any paying customer.

- New `Company` model (`id`, `name`, `gstin`, `plan` enum, `created_at`)
- New `User` model (`id`, `email`, `hashed_password`, `company_id` FK, `role` enum)
- Add `company_id` FK to every existing model (Invoice, Expense, Budget, ChatMessage)
- All repository methods gain `company_id: UUID` parameter — every query filters by it
- Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- Middleware: extract `company_id` from JWT, inject into request state
- Frontend: `/login`, `/register` pages; JWT in `httpOnly` cookie; redirect unauthenticated → `/login`

**Complexity:** High · **Blocks:** everything in P0–P2

---

### 2. Redis Cache + ARQ Task Queue

**Why:** In-memory caches break with >1 backend instance. Long AI tasks block connections.

- `redis:7-alpine` in `docker-compose.yml`; `REDIS_URL` in `.env.example`
- Replace all `dict`-based caches with `redis-py` async. Key: `{tenant_id}:{resource}:{hash}`
- ARQ worker for: `generate_monthly_report`, `reconcile_gstr2b`, `send_reminder_email`
- Long tasks return `{task_id}` (HTTP 202); frontend polls `GET /api/v1/tasks/{task_id}`

**Complexity:** Medium · **Blocks:** GSTR-2B reconciliation, email sending, proactive agent

---

### 3. Audit Log

**Why:** Immutable changelog required for CA sign-off and compliance.

- `AuditLog` model: `id`, `company_id`, `user_id`, `action`, `resource_type`, `resource_id`,
  `before` (JSONB), `after` (JSONB), `created_at`. Append-only.
- `@audit(resource_type)` decorator on repository write methods — fires async, never blocks
- `GET /api/v1/audit` — paginated, filterable by resource type and date

**Complexity:** Medium

---

## P0 — GST Compliance (from v1.3, unchanged)

### 4. GST Data Model

Add to `Company`: `gstin`, `legal_name`, `state_code`, `registration_type`
Add to `Invoice`: `place_of_supply`, `reverse_charge`, `hsn_sac_code`, GST rate + amount fields, `irn` fields
Add to `InvoiceItem`: `hsn_sac_code`, `gst_rate`, `taxable_amount`
Add to `Expense`: `vendor_gstin`, `gst_invoice_number`, `itc_eligible`, GST paid fields
Alembic migration + Pydantic schema updates with GSTIN regex and HSN validation.

**Complexity:** Medium · **Blocks:** features 5, 6, 7

---

### 5. GSTR-1 Auto-Generation

`GET /api/v1/gst/gstr1?year={y}&month={m}` — aggregates invoices into GSTR-1 JSON schema
(b2b, b2c_large, b2c_small, hsn, nil sections). Download endpoint for portal-ready JSON.
Frontend: `/gst` page — period selector, summary table, download button, missing-field warnings.

**Complexity:** High · **Token cost:** None · **Impact:** Extreme

---

### 6. GSTR-2B Reconciliation (AI-Assisted)

`POST /api/v1/gst/gstr2b/upload` — parse GSTR-2B JSON from portal.
`GET /api/v1/gst/gstr2b/reconcile` — match against expenses; return matched / mismatch /
missing-in-books / missing-in-gstr2b buckets. Haiku call for plain-English mismatch explanation.
Runs async via ARQ; CSV export for CA.

**Complexity:** High · **Token cost:** Low (batched, once/month) · **Impact:** Extreme

---

### 7. E-Invoice (IRN) Generation

`POST /api/v1/invoices/{id}/generate-irn` — NIC IRP API integration.
Store `irn`, `irn_ack_no`, `irn_ack_date`, `signed_qr_code` on Invoice.
Return 503 on NIC API failure — never silently fail on compliance.

**Complexity:** High · **Token cost:** None · **Impact:** High (legal requirement)

---

## P1 — Agentic Automation (from v1.3, unchanged)

### 8. Proactive Cash Flow Agent

Daily ARQ cron at 8am IST: queries overdue invoices, budget breaches, anomalies, upcoming
GST deadlines → sonnet generates 3–5 ranked action recommendations with predicted impact.
`GET /api/v1/insights/daily` — cached until next day. Each recommendation has an `action_type`
and optional `execute_url`. Dashboard "Today's Actions" dismissible chips.

**Complexity:** Medium · **Token cost:** Low (once/day/tenant)

---

### 9. Reminder Email Sending (Actually Send)

`POST /api/v1/invoices/{id}/send-reminder` — generate draft via `ai_writer.py`, send via
SendGrid or SES, log to `AuditLog`. Invoice Detail: "Send Now" button replaces "Copy".

**Complexity:** Low · **Token cost:** Same as v1.2 reminder draft

---

### 10. Invoice PDF Generation

`GET /api/v1/invoices/{id}/pdf` — WeasyPrint HTML→PDF with OC tokens. Includes line items,
tax breakdown, GSTIN, IRN + QR if generated. "Download PDF" button on Invoice Detail.

**Complexity:** Medium · **Token cost:** None

---

### 11. NL Chat Streaming (SSE)

`POST /api/v1/chat/stream` — `StreamingResponse` + `text/event-stream`. Tool-use rounds
complete synchronously; only the final LLM response streams. Frontend: `EventSource` reader,
token-by-token append, cursor animation.

**Complexity:** Medium · **Token cost:** Same as current chat

---

## P1 — Data Flywheel (from v1.3, unchanged)

### 12. Expense Categorization Benchmarking

Weekly ARQ cron: anonymised spend-as-%-of-revenue per category, grouped by industry + ARR band.
`IndustryBenchmark` model. `GET /api/v1/benchmarks?category={cat}`.
Budget page: benchmark bar alongside spend bar. Minimum 5 tenants before publishing.

**Complexity:** Medium · **Token cost:** None · **Impact:** Extreme (moat)

---

### 13. Bank Statement Reconciliation (Setu AA)

Setu Account Aggregator integration. `BankTransaction` model.
`POST /api/v1/bank/connect` → consent flow. `GET /api/v1/bank/reconcile` → matched /
unmatched-transactions / unmatched-expenses. Haiku for suggested descriptions.

**Complexity:** High · **Token cost:** Low · **Impact:** Extreme

---

## P2 — Polish (from v1.3, unchanged)

### 14. Onboarding Flow

`GET /api/v1/onboarding/status` — 5-step checklist. `POST /api/v1/onboarding/sample-data`
— tenant-scoped seed data. Frontend: 4-step wizard (company name, GSTIN, industry, ARR),
dashboard checklist card, "Load sample data" button.

**Complexity:** Low · **Token cost:** None

---

### 15. Role-Based Access Control

Wire `User.role` to endpoint guards. Permission matrix: owner / admin / viewer.
`POST /api/v1/team/invite`. `/settings/team` page.

**Complexity:** Medium · **Token cost:** None

---

## Implementation Order for Next Agent

```
B1  api() 204 fix + async error handling audit          ← 1 day, unblocks all DELETEs
B2  Invoice form guard + INR currency fix               ← 0.5 day, fixes core workflow
B3  Report month validation (frontend + backend)        ← 0.5 day, stops 500 crash
B4  /clients/profitability redirect (4-line new file)   ← 0.25 day
B5  Dashboard profit % delta                            ← 0.5 day
B6  Anomaly row drill-down                              ← 0.5 day
1   Multi-tenancy + Auth                               ← unblocks everything
2   Redis + ARQ queue                                  ← unblocks async tasks
4   GST data model                                     ← unblocks 5, 6, 7
5   GSTR-1 generation                                  ← first GST deliverable
9   Email sending                                      ← completes v1.2 reminder flow
10  Invoice PDF                                        ← completes invoice workflow
11  Chat streaming                                     ← high-visibility UX fix
14  Onboarding flow                                    ← required before any demo
6   GSTR-2B reconciliation                             ← needs ARQ from 2
7   IRN generation                                     ← needs GST model from 4
8   Proactive cash flow agent                          ← needs Redis + queue from 2
3   Audit log                                          ← add after write paths stable
15  RBAC                                               ← add after auth stable
12  Benchmarking                                       ← needs multiple tenants
13  Bank reconciliation / Setu AA                      ← highest complexity, last
```

---

## YC Scorecard Targets

| Criterion | v1.3 Target | v1.4 Delta |
|---|---|---|
| Hair-on-fire problem | 9/10 | unchanged |
| Unique insight | 7/10 | unchanged |
| Technical sophistication | 8/10 | +0.5 — audit-driven hardening removes silent failure modes |
| AI-nativeness | 8/10 | unchanged |
| Scalability | 8/10 | unchanged |
| Demo quality | 9/10 | +0.5 — core flows (invoice create, delete, reports) no longer broken |
| **Engineering reliability** | *(not tracked)* | **+++ — zero silent failures in DELETE path, crash eliminated on reports** |

---

## v2.0 Backlog (carried forward from v1.3)

- [ ] Multi-currency support (USD/EUR/INR) with real-time FX
- [ ] Tally / QuickBooks export
- [ ] Investor-grade board pack (auto-generated PDF)
- [ ] WhatsApp / Slack notification channel
- [ ] Mobile-responsive PWA

---

*Based on `PLAN-v1.2.md`, `PLAN-v1.3.md`, and `testsprite_tests/failed_tests/FAILURE_ANALYSIS.md`*
*Updated: 2026-05-28*
