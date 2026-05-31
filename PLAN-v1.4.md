# Finance — v1.4 Feature Roadmap

> 📘 **REVISED PRD v2.3:** See `REVISED-PRD.md` for full gap analysis and feature roadmap.
> 📋 **Failure analysis sources:**
> - TestSprite audit (2026-05-23): `testsprite_tests/failed_tests/FAILURE_ANALYSIS.md` — 6 product bugs (B1–B6)
> - TestForge audit (2026-05-31): `testforge/test_analysis/testforge-analysis.md` — 7 security/reliability issues (S1–S7)
>
> **For coding agents:** Complete the Bug Sprint (B1–B6) and Security & Reliability track (S1–S7) before
> any new P0–P2 feature work. They are small, self-contained, and unblock core workflows.
> **Do NOT change the locked stack.** See `AGENTS.md`.

---

## Strategic Position

| | Value |
|---|---|
| **Problem** | GST compliance + cash flow for Indian SaaS founders |
| **Target user** | Bootstrapped Indian SaaS founder, ₹1–20 Cr ARR |
| **Competition** | Tally (compliance-only) + spreadsheets (flexible, no compliance) |
| **Moat** | Only tool that handles GST end-to-end AND thinks in natural language |
| **Hair-on-fire** | Monthly GST filing: GSTR-1, GSTR-2B reconciliation, ITC mismatch |

---

## Pre-Flight Checklist — Do This Before Any Feature

- [x] All v1.2 features complete
- [ ] Bug Sprint B1–B6 complete and manually verified
- [ ] Security & Reliability track S1–S7 complete
- [ ] Multi-tenancy schema in place (`company_id` on all tables)
- [ ] JWT auth endpoints live with per-IP rate limiting
- [ ] Redis in `docker-compose.yml`; ARQ worker container added
- [ ] `GSTIN` field on `Company` model
- [ ] `structlog>=24.1.0` in `requirements.txt`, wired via `backend/app/core/logging.py`
- [ ] `SENTRY_DSN` in `.env.example`, wired in `config.py`, Sentry initialised in lifespan
- [ ] `.testforgerc` present excluding `node_modules/`, `.next/`, `graphify-out/`

---

## v1.0 Feature Inventory (Shipped)

- [x] Invoice CRUD
- [x] Expense CRUD
- [x] Dashboard (revenue, expenses, net profit, overdue, category chart)
- [x] Docker + Helm deployment
- [x] Alembic migrations
- [x] Backend tests (invoices, expenses)

---

## v1.2 Features (All Shipped ✅)

| # | Feature |
|---|---------|
| 1 | AI Expense Auto-Categorization |
| 2 | Monthly Spend Trend Chart (12-month) |
| 3 | Invoice Payment Reminder Drafts (AI) |
| 4 | Receipt OCR → Expense Pre-fill |
| 5 | Real Cash Flow Forecast (statistical, INR) |
| 6 | Expense Anomaly Detection (stats + LLM explanation) |
| 7 | AI Monthly Financial Summary Report |
| 8 | Smart Invoice Line-Item Suggestions |
| 9 | Natural Language Financial Q&A |
| 10 | Budget Planning with AI Guardrails |
| 11 | Client Profitability Scoring |

---

## AI Integration Notes (Preserved)

- **Provider selection:** `OPENROUTER_API_KEY` → OpenAI SDK → `https://openrouter.ai/api/v1`. Fallback: `ANTHROPIC_API_KEY` → Anthropic SDK. Model names auto-prefixed `anthropic/` for OpenRouter.
- **Unified client:** All LLM calls via `backend/app/services/llm_client.py` — never import `anthropic`/`openai` directly in services.
- **Model tiers:** `claude-haiku-4-5` for categorization/OCR/short tasks; `claude-sonnet-4-6` for reports and chat.
- **Caching pattern:** Nullable `ai_*` columns on models to reuse LLM output. All AI endpoints accept `?dry_run=true`.
- **Graceful degradation:** All AI calls wrapped in `try/except` — endpoints return data even when LLM unavailable.
- **Plain text output:** Prompt LLM for plain text; backend strips markdown via regex.

---

## Bug Sprint — Fix Before Any P0 Feature

Six genuine product defects confirmed by TestSprite automated testing (2026-05-23).
All are small and self-contained. Complete all six before starting P0 infrastructure.

> **Excluded (test config issues, not app bugs):** TC009 (rogue `amount` field in fixture), TC003 (wrong health URL), TC012 (fixture cascade), TC014/TC019/TC033 (frontend URL used for backend route). Those need test plan description updates only.

---

### B1 — `api()` silently swallows 204 responses [CRITICAL — systemic]

**Root cause:** `frontend/src/lib/api.ts` always calls `res.json()` even on 204 No Content. `res.json()` on an empty body throws `SyntaxError: Unexpected end of JSON input`. Async `handleDelete` handlers have no try/catch, so React silently drops the error — the DELETE succeeds on the backend but the stale card stays in the DOM.

**Affected flows:** Budget delete (TC025), invoice delete, expense delete — all three share this path.

**Product impact:** "Delete" appears broken. User refreshes, record is gone. Erodes trust in core CRUD.

**Fix — `frontend/src/lib/api.ts`:**
```typescript
if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
return (await res.json()) as T;
```

**Fix — wrap every async `onClick` delete handler** in try/catch across `invoices/`, `expenses/`, `budgets/`:
```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteBudget(id);
    setEditingId(null);
    await load();
    await loadStatus();
  } catch (e: unknown) {
    alert(`Failed to remove: ${e instanceof Error ? e.message : "error"}`);
  }
};
```

**Priority:** CRITICAL · **Effort:** 1 line in api.ts + ~5 lines per handler

---

### B2 — Invoice form submits empty line item → 422 [HIGH]

**Root cause:** `invoices/new/page.tsx` initialises with `{ description: "", quantity: 1, unit_price: 0 }`. `<Button onClick>` bypasses native HTML `required` validation. Backend validates `description` as non-empty, returns 422, triggering `alert()` in a headless-dismissal loop that empties the DOM.

**Secondary bug:** Line item amounts and totals display `$` instead of `₹` (missed by v1.2 INR sweep).

**Affected flows:** Invoice creation — the primary revenue-generating workflow.

**Fix — `frontend/src/app/invoices/new/page.tsx`:**
```typescript
// in handleSubmit, before setSaving(true):
if (items.some((it) => !it.description.trim())) {
  alert("All line items must have a description.");
  return;
}
```
Replace `$X.XX` with `{formatINR(x)}` in the line item amount column and footer totals. Confirm `formatINR` is imported from `@/lib/utils`.

**Priority:** HIGH · **Effort:** 8 lines

---

### B3 — Report month=13 crashes backend (500) [MEDIUM]

**Root cause:** `reports/page.tsx` uses `<Button onClick>` — `min=1 max=12` on the `<Input>` is never enforced programmatically. `month=13` is passed to the backend. `MonthlySummaryRequest` has no Pydantic field constraints; `month=13` causes an unhandled Python date exception → 500.

**Fix — `frontend/src/app/reports/page.tsx`:**
```typescript
const handleGenerate = async () => {
  if (month < 1 || month > 12) { alert("Month must be between 1 and 12."); return; }
  if (year < 2000 || year > 2099) { alert("Year must be between 2000 and 2099."); return; }
  ...
```

**Fix — `backend/app/api/v1/reports.py`:**
```python
class MonthlySummaryRequest(BaseModel):
    year: int = Field(ge=2000, le=2099)
    month: int = Field(ge=1, le=12)
```

**Priority:** MEDIUM · **Effort:** 5 lines frontend + 2 lines backend

---

### B4 — `/clients/profitability` returns Next.js 404 [HIGH]

**Root cause:** The clients page lives at `frontend/src/app/clients/page.tsx` (route: `/clients`). Tests TC018 and TC029 navigate to `/clients/profitability` — matching the backend API path — and hit a Next.js 404. No `page.tsx` exists at that route.

**Fix — create `frontend/src/app/clients/profitability/page.tsx`:**
```typescript
import { redirect } from "next/navigation";
export default function ClientProfitabilityRedirect() {
  redirect("/clients");
}
```

**Priority:** HIGH · **Effort:** 4 lines (new file)

---

### B5 — Dashboard Net Profit card missing MoM % change [MEDIUM]

**Root cause:** KPI card config has no delta fields. `DashboardData` interface has no previous-period fields. Trend data is already fetched on the page via `getDashboardTrends()` — previous-month profit is computable client-side without a new API call.

**Fix — `frontend/src/app/dashboard/page.tsx`:**
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

### B6 — Anomaly rows not interactive — AI explanation inaccessible [MEDIUM]

**Root cause:** `<TableRow>` elements in the anomaly tab have no `onClick` handler and no cursor styling. The AI explanation is in the payload but has no expand mechanism.

**Fix — `frontend/src/app/expenses/page.tsx`:**
Add `const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null)`.
Make rows clickable (toggle `expandedAnomaly`); add an expand `<TableRow>` beneath each flagged row that renders the full `item.llm_explanation` and a link to `href={/expenses/${item.expense.id}}`.

**Priority:** MEDIUM · **Effort:** 20 lines

---

## Security & Reliability Track (TestForge)

Seven findings from the TestForge scan (2026-05-31, score 70/100).

> **Excluded (scanner false positive):** 761 XSS findings in `web/node_modules/object-hash/index.js`. The `write()` calls flagged are Node.js stream writes used for deterministic hashing — not DOM writes or HTTP response sinks. No application code implicated. Addressed by S7.

---

### S1 — Auth Endpoints Not Rate Limited [CRITICAL]

**Root cause:** `backend/app/core/auth.py` has no per-IP rate limiting. `_fetch_jwks()` uses bare `@lru_cache(maxsize=1)` with no TTL — on Logto JWKS key rotation the backend rejects all valid tokens until process restart.

**Product impact:** Credential brute-force and AI-agent token-refresh DoS. Key rotation causes silent full auth outage.

**Fix:**
1. Replace `@lru_cache` with a TTL dict cache (`_JWKS_TTL_SECONDS = 3600`; re-fetch on expiry).
2. Add `_check_rate_limit(ip: str)` that runs before any token parsing — raises HTTP 429 after 10 failed attempts per IP per 60 s.
3. Add `slowapi>=0.1.9` + `limits>=3.6.0` to `requirements.txt` (swap to Redis-backed slowapi for multi-worker).
4. Add `RATE_LIMIT_PER_WINDOW: int = 10` and `RATE_WINDOW_SECONDS: int = 60` to `config.py`.

---

### S2 — Dev-Mode Auth Bypass Accidentally Deployed [HIGH]

**Root cause:** `require_auth` returns `{}` when `settings.logto_endpoint` is unset. If `LOGTO_ENDPOINT` is missing from a production deploy, all endpoints become unauthenticated with no warning.

**Product impact:** Full data exposure on misconfigured production deploy.

**Fix:** In FastAPI `lifespan`, add startup check: if `app_env == "production"` and `logto_endpoint` is unset → raise `ValueError` to abort boot.

---

### S3 — No Observability Stack [HIGH]

**Root cause:** `structlog` is mandated in `CLAUDE.md` but absent from `requirements.txt` and not imported anywhere. No Sentry on backend or frontend. Silent 500 errors have zero external capture. DORA score 25/100 partly due to no change-failure-rate signal.

**Fix:**
1. Add `structlog>=24.1.0` to `requirements.txt`; create `backend/app/core/logging.py` with JSON renderer; replace all `print()` in backend source.
2. Add `sentry-sdk[fastapi]>=1.40.0`; add `sentry_dsn: str = ""` and `app_env: str = "development"` to `config.py`; initialise Sentry in `lifespan` behind `settings.sentry_dsn` guard with `FastApiIntegration()` + `SqlalchemyIntegration()`.
3. Set `release=os.getenv("VERCEL_GIT_COMMIT_SHA")` in Sentry init → change-failure-rate tracked automatically, improving DORA score.
4. Frontend: `npm install @sentry/nextjs`; run `npx @sentry/wizard@latest -i nextjs`; add `SENTRY_DSN` to Vercel env vars.

---

### S4 — Missing Test Coverage for Forecast Endpoints [HIGH]

**Root cause:** `/forecast/scenarios`, `/forecast/three-statement`, `/forecast/drivers`, `/forecast/sensitivity`, `/forecast/mape` — all added in the P0 gap-fill — have zero pytest coverage. Mutation score 27/100 reflects weak assertion diversity (structural-only assertions) across the existing suite.

**Fix:**
1. Create `backend/tests/test_forecast.py` with value-asserting tests for all five endpoints (see detailed stubs in `testforge-analysis.md` §4). Assert invariants: `gross_profit == revenue - cogs`, sensitivity monotonicity, scenario key set `{"base","bull","bear","high_growth","conservative"}`.
2. Add edge-case tests:
   - `POST /expenses` with invalid category string → assert 422
   - `GET /forecast?months=0` → assert 422
   - `POST /expenses/ocr` with non-image MIME type → assert 422 or graceful error
   - `GET /forecast/three-statement` with empty DB → assert no division-by-zero
   - JWKS fetch network failure → assert appropriate fallback
   - Ollama path when both `OPENROUTER_API_KEY` and `ANTHROPIC_API_KEY` absent
3. Upgrade structural-only assertions in `test_expenses.py` / `test_invoices.py` to field-value checks.

---

### S5 — N+1 Query in Client Profitability Endpoint [MEDIUM]

**Root cause:** `backend/app/api/v1/clients.py` fetches per-client invoice data in a loop — O(n_clients) queries.

**Product impact:** Latency degrades linearly with client count; unacceptable past ~500 clients.

**Fix:** Replace the per-client loop with a single `GROUP BY client_name` aggregation query using SQLAlchemy 2.0 `func.sum` + `case()`.

---

### S6 — Module-Level Mutable Global in `anomaly_detector.py` [MEDIUM]

**Root cause:** `_cache: dict = {"ts": 0.0, "data": []}` is module-level mutable state. Causes race conditions under async concurrency and test pollution under `pytest-xdist`.

**Fix:** Wrap with `asyncio.Lock`, or scope cache to service class instance. When Redis is added (P0 Infrastructure item 2), migrate to Redis cache — this resolves the issue completely.

---

### S7 — Scanner False Positives Polluting Security Score [LOW]

**Root cause:** TestForge scanner ran without an exclude list, ingesting `node_modules/` and `.next/`.

**Fix:** Add `.testforgerc` to repo root:
```json
{
  "exclude": [
    "**/node_modules/**",
    "**/.next/**",
    "**/graphify-out/**",
    "**/testforge/**"
  ]
}
```

---

## Systemic Engineering Gaps

Patterns identified across both audits — address during Bug Sprint or alongside S3/S4.

| Gap | Scope | Action |
|---|---|---|
| `<Button onClick>` bypasses HTML validation | `reports/`, `budgets/`, `expenses/new/` | Explicit guards in every handler; Pydantic `Field(ge=..., le=...)` on backend |
| Async onClick handlers lack try/catch | All pages with delete/mutate | Wrap every async event handler in try/catch; surface errors via toast or alert |
| React Fragment missing `key` prop | `clients/page.tsx:69` | Replace bare `<>` with `<Fragment key={c.client_name}>` |
| AI endpoints only tested via `dry_run=true` | All AI features | Add one integration test per AI endpoint with real keys, gated `@pytest.mark.live` |
| Test fixtures not isolated | `test_invoices.py`, backend suite | Each test creates and tears down its own fixture — no shared state between tests |

---

## P0 — Infrastructure

Complete after Bug Sprint + Security track.

### 1. Multi-Tenancy + Auth

**Why:** Zero data isolation. Cannot be sold to any paying customer.

- `Company` model: `id`, `name`, `gstin`, `plan` enum, `created_at`
- `User` model: `id`, `email`, `hashed_password`, `company_id` FK, `role` enum
- Add `company_id` FK to every model (Invoice, Expense, Budget, ChatMessage) + Alembic migration
- All repository methods gain `company_id: UUID` — every query filters by it
- Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- Middleware: extract `company_id` from JWT, inject into request state
- Frontend: `/login`, `/register` pages; JWT in `httpOnly` cookie; redirect unauthenticated → `/login`

**Complexity:** High · **Blocks:** everything P0–P2

---

### 2. Redis Cache + ARQ Task Queue

**Why:** In-memory caches (and the `anomaly_detector` global — see S6) break with >1 backend instance. Long AI tasks block connections.

- `redis:7-alpine` in `docker-compose.yml`; `REDIS_URL` in `.env.example`
- Replace all module-level dict caches with `redis-py` async. Key format: `{tenant_id}:{resource}:{hash}`
- ARQ worker for: `generate_monthly_report`, `reconcile_gstr2b`, `send_reminder_email`
- Long tasks return `{task_id}` HTTP 202; frontend polls `GET /api/v1/tasks/{task_id}`

**Complexity:** Medium · **Blocks:** GSTR-2B, email sending, proactive agent

---

### 3. Audit Log

**Why:** Immutable changelog required for CA sign-off and compliance.

- `AuditLog` model: `id`, `company_id`, `user_id`, `action`, `resource_type`, `resource_id`, `before` (JSONB), `after` (JSONB), `created_at`. Append-only.
- `@audit(resource_type)` decorator on repository write methods — fires async, never blocks
- `GET /api/v1/audit` — paginated, filterable by resource type and date

**Complexity:** Medium

---

## P0 — GST Compliance

### 4. GST Data Model

Add to `Company`: `gstin`, `legal_name`, `state_code`, `registration_type`
Add to `Invoice`: `place_of_supply`, `reverse_charge`, `hsn_sac_code`, GST rate + amount fields, `irn` fields
Add to `InvoiceItem`: `hsn_sac_code`, `gst_rate`, `taxable_amount`
Add to `Expense`: `vendor_gstin`, `gst_invoice_number`, `itc_eligible`, GST paid fields
Alembic migration + Pydantic schema updates with GSTIN regex and HSN validation.

**Complexity:** Medium · **Blocks:** 5, 6, 7

---

### 5. GSTR-1 Auto-Generation

`GET /api/v1/gst/gstr1?year={y}&month={m}` — aggregates invoices into GSTR-1 JSON schema (b2b, b2c_large, b2c_small, hsn, nil). Download endpoint for portal-ready JSON.
Frontend: `/gst` page — period selector, summary table, download button, missing-field warnings.

**Complexity:** High · **Token cost:** None · **Impact:** Extreme

---

### 6. GSTR-2B Reconciliation (AI-Assisted)

`POST /api/v1/gst/gstr2b/upload` — parse GSTR-2B JSON from portal.
`GET /api/v1/gst/gstr2b/reconcile` — matched / mismatch / missing-in-books / missing-in-gstr2b buckets. Haiku for plain-English mismatch explanation. Runs async via ARQ; CSV export for CA.

**Complexity:** High · **Token cost:** Low (batched, once/month) · **Impact:** Extreme

---

### 7. E-Invoice (IRN) Generation

`POST /api/v1/invoices/{id}/generate-irn` — NIC IRP API integration.
Store `irn`, `irn_ack_no`, `irn_ack_date`, `signed_qr_code` on Invoice.
Return 503 on NIC API failure — never silently fail on compliance.

**Complexity:** High · **Token cost:** None · **Impact:** High (legal requirement)

---

## P1 — Agentic Automation

### 8. Proactive Cash Flow Agent

Daily ARQ cron at 8am IST: queries overdue invoices, budget breaches, anomalies, upcoming GST deadlines → sonnet generates 3–5 ranked action recommendations. `GET /api/v1/insights/daily` — cached until next day. Dashboard "Today's Actions" dismissible chips.

**Complexity:** Medium · **Token cost:** Low (once/day/tenant)

---

### 9. Reminder Email Sending (Actually Send)

`POST /api/v1/invoices/{id}/send-reminder` — generate draft via `ai_writer.py`, send via SendGrid/SES, log to `AuditLog`. Invoice Detail: "Send Now" button replaces "Copy to clipboard".

**Complexity:** Low · **Token cost:** Same as v1.2 reminder draft

---

### 10. Invoice PDF Generation

`GET /api/v1/invoices/{id}/pdf` — WeasyPrint HTML→PDF with line items, tax breakdown, GSTIN, IRN + QR if generated. "Download PDF" on Invoice Detail.

**Complexity:** Medium · **Token cost:** None

---

### 11. NL Chat Streaming (SSE)

`POST /api/v1/chat/stream` — `StreamingResponse` + `text/event-stream`. Tool-use rounds complete synchronously; only the final LLM response streams. Frontend: `EventSource` reader, token-by-token append, cursor animation.

**Complexity:** Medium · **Token cost:** Same as current chat

---

## P1 — Data Flywheel

### 12. Expense Categorization Benchmarking

Weekly ARQ cron: anonymised spend-as-%-of-revenue per category, grouped by industry + ARR band. `IndustryBenchmark` model. Budget page: benchmark bar alongside spend bar. Minimum 5 tenants before publishing.

**Complexity:** Medium · **Token cost:** None · **Impact:** Extreme (moat)

---

### 13. Bank Statement Reconciliation (Setu AA)

Setu Account Aggregator integration. `BankTransaction` model. `POST /api/v1/bank/connect` → consent flow. `GET /api/v1/bank/reconcile` → matched / unmatched. Haiku for suggested descriptions.

**Complexity:** High · **Token cost:** Low · **Impact:** Extreme

---

## P2 — Polish

### 14. Onboarding Flow

`GET /api/v1/onboarding/status` — 5-step checklist. `POST /api/v1/onboarding/sample-data` — tenant-scoped seed data. Frontend: 4-step wizard (company name, GSTIN, industry, ARR), dashboard checklist card.

**Complexity:** Low · **Token cost:** None

---

### 15. Role-Based Access Control

Wire `User.role` to endpoint guards. Permission matrix: owner / admin / viewer. `POST /api/v1/team/invite`. `/settings/team` page.

**Complexity:** Medium · **Token cost:** None

---

## Implementation Order for Next Agent

```
[Bug Sprint — ~3.5 days]
B1  api() 204 fix + async error handler audit         ← 1 day, unblocks all DELETEs
B2  Invoice form guard + INR currency fix             ← 0.5 day, fixes core workflow
B3  Report month validation (frontend + backend)      ← 0.5 day, stops 500 crash
B4  /clients/profitability redirect (4-line file)     ← 0.25 day
B5  Dashboard profit % delta                          ← 0.5 day
B6  Anomaly row drill-down                            ← 0.5 day

[Security & Reliability — parallel tracks, ~2.5 days]
S1  Auth rate limiting + JWKS TTL fix                 ← unblocks production auth safety
S2  Production boot guard (logto_endpoint check)      ← 1h, prevents silent exposure
S3  structlog + Sentry (backend + frontend)           ← 1 day, observability + DORA
S4  Forecast tests + edge-case tests                  ← 1 day, raises mutation score
S5  Clients N+1 → GROUP BY aggregation               ← 2h
S6  anomaly_detector global → asyncio.Lock            ← 1h (full fix when Redis added)
S7  .testforgerc scanner exclude config               ← 15 min

[P0 Infrastructure]
1   Multi-tenancy + Auth                              ← unblocks everything below
2   Redis + ARQ queue                                 ← unblocks async tasks
4   GST data model                                    ← unblocks 5, 6, 7
5   GSTR-1 generation                                 ← first GST deliverable
9   Email sending                                     ← completes v1.2 reminder flow
10  Invoice PDF                                       ← completes invoice workflow
11  Chat streaming                                    ← high-visibility UX fix
14  Onboarding flow                                   ← required before any demo

[P0 GST Compliance]
6   GSTR-2B reconciliation                            ← needs ARQ from step 2
7   IRN generation                                    ← needs GST model from step 4

[P1 / P2]
8   Proactive cash flow agent                         ← needs Redis + queue
3   Audit log                                         ← add after write paths stable
15  RBAC                                              ← add after auth stable
12  Benchmarking                                      ← needs multiple tenants
13  Bank reconciliation / Setu AA                     ← highest complexity, last
```

---

## v2.0 Backlog

- [ ] Multi-currency support (USD/EUR/INR) with real-time FX
- [ ] Tally / QuickBooks export
- [ ] Investor-grade board pack (auto-generated monthly PDF)
- [ ] WhatsApp / Slack notification channel
- [ ] Mobile-responsive PWA

---

*Based on `PLAN-v1.2.md`, `REVISED-PRD.md`, `testsprite_tests/failed_tests/FAILURE_ANALYSIS.md`, and `testforge/test_analysis/testforge-analysis.md`*
*Updated: 2026-05-31*
