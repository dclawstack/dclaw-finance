# Finance — v1.3 Roadmap (YC-Ready)

> **Strategic pivot:** DClaw Finance v1.3 reframes from "AI-augmented invoicing" to
> **"GST-compliant AI finance OS for Indian SaaS companies."**
> Every feature below addresses a specific gap identified in the YC gap analysis.
>
> **For coding agents:** Pick features from this list, implement them fully, and update this doc
> with a checkmark. Do NOT change the locked stack. See `AGENTS.md`.

---

## Positioning Reframe (Do This Before Writing Code)

| | v1.2 | v1.3 |
|---|---|---|
| **Problem** | "AI-augmented finance" | GST compliance + cash flow for Indian SaaS founders |
| **Target user** | "Enterprise finance teams, CFOs, founders, accountants" | Bootstrapped Indian SaaS founder, ₹1–20Cr ARR, doing finance solo or with one CA |
| **Competition** | QuickBooks / Zoho | Tally (compliance-only, no AI) + spreadsheets (flexible, no compliance) |
| **Moat claim** | 11 AI features | Only tool that handles GST end-to-end AND thinks in natural language |
| **Hair-on-fire** | None identified | Monthly GST filing: GSTR-1 generation, GSTR-2B reconciliation, ITC mismatch |

---

## Pre-Flight Checklist — Do This Before Any v1.3 Feature

- [ ] Multi-tenancy schema in place (every table has `tenant_id` FK, RLS policies set)
- [ ] JWT auth endpoints live (`/auth/register`, `/auth/login`, `/auth/refresh`)
- [ ] Redis running in `docker-compose.yml` (replaces all in-memory caches)
- [ ] ARQ or Celery worker container added to compose (for async AI tasks)
- [ ] `GSTIN` field added to a new `Company` model (tenant root)
- [ ] Real pilot customer identified — seed data must represent their actual data, not Meridian AI

---

## P0 — Infrastructure (Must Fix Before Any New Features)

These are table-stakes for any paying B2B customer. Nothing else ships until these are done.

### 1. Multi-Tenancy + Auth

**Why:** The product currently has zero data isolation. A single database with no user identity
cannot be sold to any real company.

**Backend:**
- New `Company` model — tenant root. Fields: `id`, `name`, `gstin` (nullable initially),
  `plan` enum [`free`, `starter`, `growth`], `created_at`
- New `User` model — `id`, `email`, `hashed_password`, `company_id` (FK → Company),
  `role` enum [`owner`, `admin`, `viewer`], `created_at`
- Add `company_id: Mapped[UUID]` FK to every existing model (Invoice, Expense, Budget,
  ChatMessage). Index all of them.
- All repository methods gain a `company_id: UUID` parameter — every query filters by it.
  Never return cross-tenant data.
- `POST /auth/register` → creates Company + owner User, returns JWT pair
- `POST /auth/login` → returns `access_token` (15min) + `refresh_token` (30d)
- `POST /auth/refresh` → rotates refresh token
- `GET /auth/me` → current user + company
- Middleware: extract `company_id` from JWT, inject into request state, pass to all
  repository calls via `Depends()`
- Alembic migration: add `companies`, `users` tables; add `company_id` to all existing tables

**Frontend:**
- `/login` and `/register` pages (no design system deviation — use existing OC tokens)
- JWT stored in `httpOnly` cookie (not localStorage)
- `src/lib/api.ts` sends `Authorization: Bearer <token>` on every request
- Redirect unauthenticated users to `/login`

**Complexity:** High · **Blocks:** everything else in v1.3

---

### 2. Redis Cache + ARQ Task Queue

**Why:** In-memory caches (`anomalies` 1h, `client insights` 24h) break silently with >1
backend instance. Long-running AI tasks (report generation, GSTR reconciliation) block
FastAPI connections.

**Backend:**
- Add `redis:7-alpine` to `docker-compose.yml`
- `REDIS_URL` in `.env.example` and `config.py`
- Replace all `dict`-based in-process caches with `redis-py` async calls.
  Key format: `{tenant_id}:{resource}:{params_hash}`
- Add ARQ worker (`backend/worker.py`) for tasks:
  - `generate_monthly_report` (currently blocks ~5s)
  - `reconcile_gstr2b` (new, can take 10–30s)
  - `send_reminder_email` (new)
- AI endpoints that kick off long tasks return `{task_id}` immediately (HTTP 202).
  Frontend polls `GET /api/v1/tasks/{task_id}` for status + result.

**Complexity:** Medium · **Blocks:** GSTR reconciliation, email sending

---

### 3. Audit Log

**Why:** Any tool that touches financial records needs an immutable changelog. Required for
CA sign-off and any future compliance certification.

**Backend:**
- New `AuditLog` model: `id`, `company_id`, `user_id`, `action` (enum: create/update/delete),
  `resource_type` (str), `resource_id` (UUID), `before` (JSONB), `after` (JSONB),
  `created_at`. Append-only — no UPDATE or DELETE endpoints.
- Decorator `@audit(resource_type)` wraps repository write methods, captures before/after,
  writes to `audit_log` table async (fire-and-forget, never blocks the main operation).
- `GET /api/v1/audit` — paginated log for the tenant, filterable by resource type and date.

**Complexity:** Medium · **No external dependencies**

---

## P0 — GST Compliance (The Hair-on-Fire Problem)

These features are the product's reason to exist. They solve a compliance *requirement*,
not a convenience. Indian companies legally must do this every month.

### 4. GST Data Model

**Why:** Every downstream GST feature depends on this being correct. Do this before 5–7.

**Backend:**
- Add to `Company` model: `gstin` (15-char, validated format), `legal_name`, `trade_name`,
  `state_code` (2-digit), `registration_type` enum [`regular`, `composition`, `unregistered`]
- Add to `Invoice` model:
  - `place_of_supply` (state code, str) — determines IGST vs CGST+SGST split
  - `reverse_charge` (bool, default False)
  - `hsn_sac_code` (str, nullable) — at invoice level for service invoices
  - `cgst_rate`, `sgst_rate`, `igst_rate` (float, default 0)
  - `cgst_amount`, `sgst_amount`, `igst_amount` (float, computed)
  - `irn` (str, nullable) — Invoice Reference Number after e-invoice generation
  - `irn_ack_no`, `irn_ack_date` (nullable) — NIC acknowledgement
- Add to `InvoiceItem` model:
  - `hsn_sac_code` (str) — item-level HSN/SAC
  - `gst_rate` (float) — applicable rate (0/5/12/18/28)
  - `taxable_amount` (float, computed: quantity × unit_price)
- Add to `Expense` model:
  - `vendor_gstin` (str, nullable)
  - `gst_invoice_number` (str, nullable)
  - `itc_eligible` (bool, default True) — whether Input Tax Credit can be claimed
  - `cgst_paid`, `sgst_paid`, `igst_paid` (float, nullable)
- Alembic migration for all of the above
- Pydantic schemas updated with GST field validation (GSTIN regex, HSN code length, etc.)

**Complexity:** Medium · **Blocks:** features 5, 6, 7

---

### 5. GSTR-1 Auto-Generation

**Why:** Every GST-registered business must file GSTR-1 monthly (or quarterly). Currently
done manually or via expensive CA. This is the core workflow DClaw replaces.

**Backend:**
- `GET /api/v1/gst/gstr1?year={y}&month={m}` — aggregates invoices for the period into
  GSTR-1 JSON format exactly matching the GST portal schema:
  - `b2b` section: B2B invoices grouped by recipient GSTIN
  - `b2c_large` section: B2C invoices above ₹2.5L (inter-state)
  - `b2c_small` section: remaining B2C
  - `hsn` section: HSN-wise summary
  - `nil` section: nil-rated / exempt / non-GST supplies
- `GET /api/v1/gst/gstr1/download?year={y}&month={m}` — returns the JSON file as
  download attachment, ready to upload directly to GST portal
- `backend/app/services/gstr1_generator.py` — pure computation, no LLM needed
- Validation: flag invoices missing HSN codes, place of supply, or GSTIN before generating

**Frontend:**
- `/gst` page — new nav item
- Period selector (year + month) + "Generate GSTR-1" button
- Summary table: B2B count + taxable value, B2C large, B2C small, HSN breakdown
- "Download JSON" button (ready-to-upload to GST portal)
- Warning list: invoices with missing GST fields that will break the export

**Complexity:** High · **Token cost:** None (pure computation) · **Impact:** Extreme

---

### 6. GSTR-2B Reconciliation (AI-Assisted)

**Why:** Companies must reconcile what vendors declared in their GSTR-1 (visible in the
buyer's GSTR-2B) against what the buyer recorded as expenses. Mismatches mean ITC
(Input Tax Credit) loss — real money. This is done in spreadsheets today and is miserable.

**Backend:**
- `POST /api/v1/gst/gstr2b/upload` — accepts GSTR-2B JSON file (downloaded from GST
  portal) as multipart upload, parses and stores in new `Gstr2bRecord` model:
  `id`, `company_id`, `period`, `vendor_gstin`, `vendor_name`, `invoice_number`,
  `invoice_date`, `taxable_value`, `igst`, `cgst`, `sgst`, `itc_available`
- `GET /api/v1/gst/gstr2b/reconcile?year={y}&month={m}` — matches `Gstr2bRecord`
  entries against `Expense` records by vendor GSTIN + invoice number. Returns three
  buckets:
  - `matched`: expense and GSTR-2B record agree on amounts
  - `mismatch`: amounts differ (flag amount delta)
  - `missing_in_books`: vendor declared invoice; not found in expenses
  - `missing_in_gstr2b`: expense recorded; vendor hasn't filed (ITC at risk)
- `backend/app/services/gstr2b_reconciler.py` — matching logic + one batched LLM call
  (haiku) to generate a plain-English explanation per mismatch ("Vendor X declared ₹18,000
  IGST but you recorded ₹15,000 — difference of ₹3,000 may indicate a billing error")
- Task queue: reconciliation runs async via ARQ, returns `task_id` immediately

**Frontend:**
- `/gst/reconcile` — upload GSTR-2B JSON file
- Four-bucket summary with counts and totals
- Mismatch table: vendor, invoice number, your amount vs GSTR-2B amount, delta, AI explanation
- "Export Reconciliation Report" → CSV download for CA

**Complexity:** High · **Token cost:** Low (batched haiku, once/month) · **Impact:** Extreme

---

### 7. E-Invoice (IRN) Generation

**Why:** Mandatory for companies above ₹5Cr turnover under GST law. Must generate an
Invoice Reference Number (IRN) from NIC portal before sending the invoice.

**Backend:**
- `POST /api/v1/invoices/{id}/generate-irn` — calls NIC IRP (Invoice Registration Portal)
  sandbox/production API with the invoice payload in e-invoice schema format
- Store `irn`, `irn_ack_no`, `irn_ack_date`, `signed_qr_code` on the Invoice record
- `backend/app/services/irn_service.py` — handles NIC API auth (GSTIN + OTP), payload
  construction, response parsing
- If NIC API is unavailable: return 503 with clear message (never silently fail on compliance)
- `.env` keys: `NIC_IRP_BASE_URL`, `NIC_IRP_CLIENT_ID`, `NIC_IRP_CLIENT_SECRET`

**Frontend:**
- "Generate IRN" button on Invoice Detail page — only shown when invoice is in `sent` status
  and `irn` is null
- On success: show IRN + acknowledgement number + QR code in a dialog
- IRN badge on invoice list (green checkmark = compliant, grey = pending)

**Complexity:** High · **Token cost:** None · **Impact:** High (legal requirement)

---

## P1 — Agentic Automation (AI That Acts, Not Just Answers)

Replace read-only AI features with agents that execute workflows.

### 8. Proactive Cash Flow Agent

**Why:** The current chat answers questions. This agent surfaces the next best action
every morning without being asked — and can execute it on approval.

**Backend:**
- Daily scheduled task (ARQ cron): runs at 8am IST per tenant
- Queries overdue invoices, upcoming due dates, budget breach status, anomalies
- Calls sonnet with all context → generates 3–5 ranked action recommendations with
  predicted impact ("Remind Acme Corp today — 87% payment probability within 7 days
  based on their history")
- `GET /api/v1/insights/daily` — returns today's recommendations, cached until next day
- Each recommendation has an `action_type` enum:
  [`send_reminder`, `flag_anomaly`, `budget_alert`, `gst_deadline`, `forecast_warning`]
  and an optional `execute_url` pointing to the endpoint that takes the action

**Frontend:**
- Dashboard top card: "Today's Actions" — dismissible chips per recommendation
- Each chip has a "Do it" button that fires the `execute_url`
- Dismissed recommendations are hidden until next day (persisted in DB, not localStorage)

**Complexity:** Medium · **Token cost:** Low (once/day/tenant, cached) · **Impact:** High

---

### 9. Reminder Email Sending (Actually Send, Not Just Draft)

**Why:** The v1.2 "Draft Reminder" feature generates text that the user must manually
copy-paste into their email client. This is the last mile that kills the workflow.

**Backend:**
- Add `sendgrid>=6.0` or `boto3` (SES) to `backend/requirements.txt`
- `.env` keys: `EMAIL_PROVIDER` (`sendgrid` or `ses`), `EMAIL_API_KEY`, `FROM_EMAIL`
- `backend/app/services/email_service.py` — `send_email(to, subject, body, company_id)`
- `POST /api/v1/invoices/{id}/send-reminder` — calls `ai_writer.py` to generate draft,
  then `email_service.py` to send. Logs send event to `AuditLog`.
- Returns `{sent: true, to: email, subject: str}` — never silently swallows send errors

**Frontend:**
- Invoice Detail: replace "Draft Reminder" dialog's "Copy to clipboard" with a
  "Send Now" button (calls the new endpoint) and keep "Copy" as secondary option
- Show sent confirmation toast with recipient address

**Complexity:** Low · **Token cost:** Same as v1.2 reminder draft · **Impact:** High

---

### 10. Invoice PDF Generation + Download

**Why:** The product generates invoices in the DB but cannot produce an actual PDF
to send to clients. This is a basic expectation of any invoicing tool.

**Backend:**
- Add `weasyprint>=60.0` to `backend/requirements.txt`
- `backend/app/services/pdf_service.py` — renders invoice to PDF via an HTML template
  that uses OC design tokens (purple header, Manrope font, INR formatting)
- `GET /api/v1/invoices/{id}/pdf` — streams PDF as `application/pdf` response
- PDF includes: invoice number, client details, line items table, tax breakdown,
  total in INR, company GSTIN, IRN + QR code if generated

**Frontend:**
- "Download PDF" button on Invoice Detail page
- Triggers `window.open(/api/v1/invoices/{id}/pdf)` — browser handles download

**Complexity:** Medium · **Token cost:** None · **Impact:** High

---

### 11. NL Chat Streaming (SSE)

**Why:** The current synchronous chat holds a connection open for 3–8 seconds while
the LLM completes. Users see a blank screen. Streaming is table-stakes UX for any
chat interface in 2026.

**Backend:**
- `POST /api/v1/chat/stream` — `StreamingResponse` using `text/event-stream`
- `agentic_loop()` in `llm_client.py` gains a `stream=True` path using the provider's
  streaming API
- Tool-use rounds complete synchronously (DB queries are fast); only the final assistant
  response streams token-by-token

**Frontend:**
- Replace `fetch` in the chat page with `EventSource` or `ReadableStream` reader
- Append tokens to the assistant bubble as they arrive
- Show cursor animation while streaming

**Complexity:** Medium · **Token cost:** Same as current chat · **Impact:** High (UX)

---

## P1 — Data Flywheel (Aggregate Intelligence)

These features require multiple tenants to be meaningful. Build the infrastructure now;
the value compounds as customers onboard.

### 12. Expense Categorization Benchmarking

**Why:** The biggest unanswerable question for any SaaS founder is "am I spending the
right amount on X?" Category-level benchmarks across the customer base turn DClaw's
aggregate data into a moat competitors cannot replicate.

**Backend:**
- New `IndustryBenchmark` model: `category`, `industry` (str), `arr_band`
  (enum: `0-1Cr`, `1-5Cr`, `5-20Cr`, `20Cr+`), `median_pct_of_revenue`,
  `p25_pct`, `p75_pct`, `sample_size`, `computed_at`
- Background task (weekly, ARQ cron): aggregates anonymized spend-as-%-of-revenue
  per category across all tenants, grouped by `industry` and `arr_band`.
  Writes results to `IndustryBenchmark`. Minimum sample size: 5 tenants before a
  benchmark is published (never expose data from fewer companies).
- `GET /api/v1/benchmarks?category={cat}` — returns the benchmark band for the
  requesting tenant's industry + ARR, and where the tenant sits within it
- `Company` model gains: `industry` (str), `annual_revenue_inr` (float, nullable,
  self-reported during onboarding)

**Frontend:**
- Budget page: each category card shows a small benchmark bar alongside spend bar
  ("Industry median: 18% · You: 23%")
- `/benchmarks` page: full breakdown across all categories with percentile position

**Complexity:** Medium · **Token cost:** None (pure aggregation) · **Impact:** Extreme (moat)

---

### 13. Bank Statement Reconciliation (Setu / Account Aggregator)

**Why:** Right now, expenses are entered manually or via receipt OCR. The real workflow
for an Indian company is: bank statement arrives, match transactions to recorded expenses,
flag gaps. This is where the bulk of bookkeeping time goes.

**Backend:**
- Integrate with Setu AA (Account Aggregator) sandbox for bank statement fetch
- New `BankTransaction` model: `id`, `company_id`, `date`, `amount`, `description`,
  `transaction_type` (debit/credit), `balance`, `matched_expense_id` (nullable FK)
- `POST /api/v1/bank/connect` — initiates AA consent flow, returns redirect URL
- `POST /api/v1/bank/sync` — fetches last 90 days of transactions from AA, stores in
  `BankTransaction`
- `GET /api/v1/bank/reconcile` — matches `BankTransaction` debits against `Expense`
  records by amount + date proximity (±3 days). Returns:
  - `matched`: transaction ↔ expense pair
  - `unmatched_transactions`: bank debits with no expense record (create draft expense?)
  - `unmatched_expenses`: expenses with no bank transaction (possible duplicate/error)
- One batched haiku call: generate a suggested description + category for each
  unmatched transaction
- `.env` keys: `SETU_CLIENT_ID`, `SETU_CLIENT_SECRET`, `SETU_ENVIRONMENT`

**Frontend:**
- `/bank` page — connect bank account (AA flow), sync, reconciliation table
- "Create Expense" button on unmatched transactions → pre-fills form with AI suggestion

**Complexity:** High · **Token cost:** Low (batched haiku) · **Impact:** Extreme

---

## P2 — Polish and YC Demo Readiness

### 14. Onboarding Flow

**Why:** YC partners will click "Sign Up" and expect to be productive in under 2 minutes.
The current product drops you into an empty dashboard with a fictional company's data.

**Backend:**
- `GET /api/v1/onboarding/status` — returns checklist: company profile complete,
  GSTIN added, first invoice created, first expense added, bank connected
- `POST /api/v1/onboarding/sample-data` — seeds a small, realistic dataset (5 invoices,
  20 expenses, 3 budgets) scoped to the authenticated tenant. Replaces the global
  `seed_data.py` script.

**Frontend:**
- After register → `/onboarding` wizard: company name, GSTIN, industry, ARR band (4 steps)
- Dashboard shows onboarding checklist card until all steps complete
- "Load sample data" button for evaluators who don't want to enter real data

**Complexity:** Low · **Token cost:** None · **Impact:** High (demo quality)

---

### 15. Role-Based Access Control

**Why:** Any B2B sale beyond a solo founder involves multiple users. A CA reviewer
should not be able to delete invoices.

**Backend:**
- `User.role` enum already planned in feature 1. Wire it to endpoint guards.
- Permission matrix:
  | Role | Create/Edit | Delete | AI features | GST export | Audit log |
  |---|---|---|---|---|---|
  | `owner` | ✓ | ✓ | ✓ | ✓ | ✓ |
  | `admin` | ✓ | ✓ | ✓ | ✓ | read-only |
  | `viewer` | — | — | read-only | read-only | — |
- `POST /api/v1/team/invite` — sends email invite to join the company
- `GET /api/v1/team` — list users in the company

**Frontend:**
- `/settings/team` page — invite, list, and remove team members
- UI hides destructive buttons based on `GET /auth/me` role

**Complexity:** Medium · **Token cost:** None · **Impact:** High (B2B requirement)

---

## v2.0 Candidate Backlog (Carry Forward from v1.2)

Features not yet implemented, still valid:

- [ ] Multi-currency support (USD/EUR/INR) with real-time FX via Open Exchange Rates
- [ ] Tally / QuickBooks export — one-click export for accountants using legacy tools
- [ ] Investor-grade board pack — auto-generated monthly PDF with variance analysis
- [ ] WhatsApp / Slack notification channel for daily insights and GST deadline reminders
- [ ] Mobile-responsive PWA (current layout is desktop-only)

---

## YC Scorecard Targets (What v1.3 Should Achieve)

| Criterion | v1.2 Score | v1.3 Target |
|---|---|---|
| Hair-on-fire problem | 3/10 | 9/10 — GST compliance is a legal mandate |
| Unique insight | 2/10 | 7/10 — benchmarking flywheel + GST-native |
| Technical sophistication | 5/10 | 8/10 — IRN, AA reconciliation, agentic actions |
| AI-nativeness | 4/10 | 8/10 — proactive agent, streaming, reconciliation AI |
| Scalability | 3/10 | 8/10 — multi-tenancy, Redis, task queue |
| Demo quality | 4/10 | 9/10 — onboarding flow, real PDF, actual email sending |

---

## Implementation Order for Next Agent

Start here, in this order. Each item unblocks the next.

1. **Feature 1** — Multi-tenancy + Auth (unblocks everything)
2. **Feature 2** — Redis + ARQ queue (unblocks async AI tasks)
3. **Feature 4** — GST data model (unblocks features 5, 6, 7)
4. **Feature 5** — GSTR-1 generation (first GST deliverable, no external API needed)
5. **Feature 9** — Email sending (completes the v1.2 reminder workflow)
6. **Feature 10** — Invoice PDF (completes the invoice workflow)
7. **Feature 11** — Chat streaming (UX fix, high visibility)
8. **Feature 14** — Onboarding flow (required before any demo)
9. **Feature 6** — GSTR-2B reconciliation (needs ARQ from feature 2)
10. **Feature 7** — IRN generation (NIC API integration, needs GST model from feature 4)
11. **Feature 8** — Proactive cash flow agent (needs Redis + queue from feature 2)
12. **Feature 3** — Audit log (add after write paths are stable)
13. **Feature 15** — RBAC (add after auth is stable)
14. **Feature 12** — Benchmarking (needs multiple tenants — ship last)
15. **Feature 13** — Bank reconciliation / Setu AA (highest complexity, ship last)
