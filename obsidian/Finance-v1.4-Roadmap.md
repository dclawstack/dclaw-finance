# DClaw Finance — v1.4 Roadmap

> Source of truth: `dclaw-finance/PLAN-v1.4.md`
> Architecture rules: `dclaw-finance/AGENTS.md`
> Last updated: May 2026 · **v1.4 — hardening + GST + agentic**

---

## Status Summary

| Phase | Items | Status |
|---|---|---|
| v1.0 | Invoice CRUD, Expense CRUD, Dashboard, Docker, Alembic, Tests | ✅ Done |
| v1.2 | All 11 AI features (categorisation, OCR, reminders, forecast, anomaly, report, suggestions, chat, budgets, clients) | ✅ Done |
| v1.4 additions | 13-week cash flow, optimization levers, 5-scenario forecast, 3-statement model, forecast drivers/sensitivity/mape, floating copilot, Vercel deployment, landing page | ✅ Done |
| Bug Sprint | 6 product defects from TestSprite (B1–B6) | 🔲 Pending |
| Security track | 7 reliability issues from TestForge (S1–S7) | 🔲 Pending |
| P0 Infrastructure | Multi-tenancy, Redis/ARQ, audit log | 🔲 Next |
| P0 GST | GSTR-1, GSTR-2B, IRN | 🔲 Next |
| P1 Agentic | Proactive agent, email sending, PDF, streaming chat | 🔲 Backlog |

---

## Failure Analysis Sources

| Source | Date | Score | Findings |
|---|---|---|---|
| TestSprite AI testing | 2026-05-23 | Backend 90% · Frontend 56% | 6 genuine bugs (B1–B6) |
| TestForge security audit | 2026-05-31 | 70/100 | 7 real issues (S1–S7) |

See [[Finance-TestSprite-2026-05-23]] and [[Finance-TestForge-2026-05-31]] for full findings.

---

## Bug Sprint (Fix First — B1–B6)

All are small (1–20 lines), target existing files, unblock core workflows.

### B1 — `api()` silently swallows 204 responses [CRITICAL]

**File:** `web/src/lib/api.ts`
**Root cause:** `api()` always calls `res.json()` even on 204 No Content. Throws `SyntaxError` silently in async handlers, leaving stale UI while the DB delete already succeeded.
**Affects:** All three DELETE operations — budget, invoice, expense.
**Fix:** Add `if (res.status === 204) return undefined as T` before `res.json()`. Wrap all async delete handlers in try/catch.

---

### B2 — Invoice form submits empty line item → 422 [HIGH]

**File:** `web/src/app/invoices/new/page.tsx`
**Root cause:** Default blank `{ description: "" }` line item bypasses HTML `required` via `<Button onClick>` pattern. Backend returns 422.
**Secondary:** Line item amounts show `$` not `₹`.
**Fix:** Guard in `handleSubmit` — `if items.some(it => !it.description.trim()) return`. Replace `$` with `formatINR()`.

---

### B3 — Report month=13 crashes backend (500) [MEDIUM]

**Files:** `web/src/app/reports/page.tsx` + `backend/app/api/v1/reports.py`
**Root cause:** `<Button onClick>` bypasses `min/max` HTML validation. `MonthlySummaryRequest` has no Pydantic range constraints.
**Fix:** Frontend guard (`month < 1 || month > 12`). Backend: `month: int = Field(ge=1, le=12)`.

---

### B4 — `/clients/profitability` returns Next.js 404 [HIGH]

**File:** `web/src/app/clients/profitability/page.tsx` (missing in `web/`, exists in `frontend/`)
**Root cause:** No page exists at that route in the `web/` Vercel app.
**Fix:** Create redirect page: `redirect("/clients")`.

---

### B5 — Dashboard Net Profit missing MoM % change [MEDIUM]

**File:** `web/src/app/dashboard/page.tsx`
**Root cause:** KPI card config has no delta field. Trend data already on page — previous-month profit is computable without new API.
**Fix:** Derive `profitDelta` from last two trend entries; render `+X.X% vs last month` on Net Profit card.

---

### B6 — Anomaly rows not interactive [MEDIUM]

**File:** `web/src/app/expenses/page.tsx`
**Root cause:** `<TableRow>` has no onClick. AI explanation is in payload but inaccessible.
**Fix:** Add expand state, clickable rows, expand `<TableRow>` with `llm_explanation` + expense link.

---

## Security & Reliability Track (S1–S7)

### S1 — Auth endpoints not rate limited [CRITICAL]

**File:** `backend/app/core/auth.py`
**Root cause:**
1. No per-IP rate limiting on failed JWT validation.
2. `_fetch_jwks()` uses `@lru_cache(maxsize=1)` — no TTL. JWKS key rotation causes silent full auth outage until process restart.
**Fix:** Replace `@lru_cache` with TTL dict cache (1h). Add `_check_rate_limit(ip)` before token parsing (10 req/60s). Add `slowapi>=0.1.9` + `limits>=3.6.0`.

---

### S2 — Dev-mode auth bypass accidentally deployed [HIGH]

**File:** `backend/app/core/auth.py`
**Root cause:** `return {}` when `LOGTO_ENDPOINT` unset. If missing from prod env, all endpoints open.
**Fix:** Boot guard in `lifespan` — raise `ValueError` if `app_env == "production"` and `logto_endpoint` is unset.

---

### S3 — No observability stack [HIGH]

**Files:** `requirements.txt`, `backend/app/api/main.py`, `web/package.json`
**Root cause:** `structlog` in CLAUDE.md but absent from requirements. No Sentry anywhere.
**Fix:**
- Add `structlog>=24.1.0`; create `backend/app/core/logging.py` with JSON renderer.
- Add `sentry-sdk[fastapi]>=1.40.0`; init in `lifespan` behind `settings.sentry_dsn` guard.
- Set `release=os.getenv("VERCEL_GIT_COMMIT_SHA")` → fixes DORA score.
- Frontend: `npm install @sentry/nextjs` + wizard.

---

### S4 — Missing forecast endpoint test coverage [HIGH]

**File:** `backend/tests/test_forecast.py` (missing)
**Root cause:** `/forecast/scenarios`, `/forecast/three-statement`, `/forecast/drivers`, `/forecast/sensitivity`, `/forecast/mape` have zero pytest coverage. Mutation score 27/100.
**Fix:** Create `test_forecast.py` with value-asserting tests. Add edge-case tests: `months=0` (422), non-image OCR (422), JWKS failure, Ollama fallback.

---

### S5 — N+1 query in client profitability endpoint [MEDIUM]

**File:** `backend/app/api/v1/clients.py`
**Root cause:** Per-client invoice loop — O(n_clients) queries.
**Fix:** Replace loop with single `GROUP BY client_name` aggregation.

---

### S6 — Module-level mutable global in `anomaly_detector.py` [MEDIUM]

**File:** `backend/app/services/anomaly_detector.py`
**Root cause:** `_cache: dict = {"ts": 0.0, "data": []}` is module-level. Race conditions under async + pytest-xdist.
**Fix:** Wrap with `asyncio.Lock`, or scope to service class instance. Full fix: migrate to Redis (P0 Infrastructure item 2).

---

### S7 — Scanner false positives (tooling) [LOW]

**Root cause:** TestForge scanned `node_modules/` — 761 XSS findings in `object-hash` lib are false positives.
**Fix:** Add `.testforgerc` to repo root excluding `**/node_modules/**`, `**/.next/**`, `**/graphify-out/**`.

---

## P0 — Infrastructure

### 1. Multi-Tenancy + Auth

- `Company` model (`id`, `name`, `gstin`, `plan` enum)
- `User` model (`id`, `email`, `hashed_password`, `company_id` FK, `role` enum)
- `company_id` FK on all models + Alembic migration
- Auth endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`
- Frontend: `/login`, `/register`; JWT in `httpOnly` cookie

**Blocks:** everything below.

---

### 2. Redis + ARQ Task Queue

- `redis:7-alpine` in docker-compose; `REDIS_URL` in `.env.example`
- Replace all module-level dict caches with `redis-py` async (also fixes S6)
- ARQ worker for: `generate_monthly_report`, `reconcile_gstr2b`, `send_reminder_email`
- Long tasks → HTTP 202 + `{task_id}`; poll `GET /api/v1/tasks/{task_id}`

---

### 3. Audit Log

- `AuditLog` model: `id`, `company_id`, `user_id`, `action`, `resource_type`, `resource_id`, `before`/`after` (JSONB). Append-only.
- `@audit(resource_type)` decorator on repository write methods (async, non-blocking)

---

## P0 — GST Compliance

### 4. GST Data Model

Adds `gstin`, `legal_name`, `state_code` to `Company`; `place_of_supply`, `hsn_sac_code`, GST amounts, `irn` fields to `Invoice`/`InvoiceItem`/`Expense`. GSTIN regex + HSN validation in Pydantic.

### 5. GSTR-1 Auto-Generation

`GET /api/v1/gst/gstr1?year={y}&month={m}` → portal-ready JSON (b2b, b2c, hsn, nil). Download endpoint. Frontend: `/gst` page.

### 6. GSTR-2B Reconciliation (AI-Assisted)

`POST /api/v1/gst/gstr2b/upload` + `GET /api/v1/gst/gstr2b/reconcile`. Runs via ARQ. Haiku explanation for mismatches. CSV export.

### 7. IRN / E-Invoice

`POST /api/v1/invoices/{id}/generate-irn` → NIC IRP API. Store `irn`, `irn_ack_no`, `signed_qr_code`. Return 503 on NIC failure — never silently fail.

---

## P1 — Agentic Automation

| # | Feature | Notes |
|---|---|---|
| 8 | Proactive Cash Flow Agent | Daily ARQ cron at 8am IST; 3–5 ranked recommendations; dashboard chips |
| 9 | Reminder Email Sending | Actually send via SendGrid/SES; log to AuditLog |
| 10 | Invoice PDF Generation | WeasyPrint HTML→PDF; includes line items, GSTIN, IRN + QR |
| 11 | NL Chat Streaming (SSE) | `StreamingResponse` + `text/event-stream`; `EventSource` on frontend |

---

## P1 — Data Flywheel

| # | Feature | Notes |
|---|---|---|
| 12 | Expense Benchmarking | Anonymised spend-as-%-of-revenue vs industry peers. Minimum 5 tenants |
| 13 | Bank Reconciliation (Setu AA) | Account Aggregator consent flow; match transactions to expenses |

---

## P2 — Polish

| # | Feature |
|---|---|
| 14 | Onboarding flow (5-step wizard + sample data) |
| 15 | Role-based access control (owner/admin/viewer) |

---

## v2.0 Backlog

- [ ] Multi-currency (USD/EUR/INR) with real-time FX
- [ ] Tally / QuickBooks export
- [ ] Investor-grade board pack PDF
- [ ] WhatsApp / Slack notification channel
- [ ] Mobile-responsive PWA

---

## Implementation Order

```
B1–B6  Bug Sprint                           ← 3.5 days
S1–S7  Security & Reliability              ← 2.5 days (parallel tracks)
1      Multi-tenancy + Auth
2      Redis + ARQ
4      GST data model
5      GSTR-1 generation
9      Email sending
10     Invoice PDF
11     Chat streaming
14     Onboarding
6      GSTR-2B reconciliation              ← needs ARQ
7      IRN generation                      ← needs GST model
8      Proactive agent                     ← needs Redis + queue
3      Audit log                           ← after write paths stable
15     RBAC                                ← after auth stable
12     Benchmarking                        ← needs multiple tenants
13     Bank reconciliation (Setu AA)       ← last, highest complexity
```

---

## Related Notes

- [[Finance-Architecture]] — stack, ports, anti-patterns, API surface
- [[Finance-Design-System]] — OC design tokens, INR formatting, components
- [[Finance-TestSprite-2026-05-23]] — TestSprite run that produced B1–B6
- [[Finance-TestForge-2026-05-31]] — TestForge audit that produced S1–S7
