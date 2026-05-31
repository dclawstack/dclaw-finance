# PRODUCT-SPEC: DClaw Finance

## Overview

**App Name:** DClaw Finance  
**Version:** 1.4 (May 2026)  
**Domain:** AI-augmented invoicing, expense management, cash flow, and financial intelligence  
**Target User:** Bootstrapped Indian SaaS founders and SMB finance teams at ₹1–20 Cr ARR  
**Design System:** One Convergence Vol. 01 — Purple `#7030A0` · White `#FFFFFF` · Manrope/Inter/JetBrains Mono  
**Currency:** Indian Rupees (INR) — formatted as ₹X.XX Cr (≥1 Cr) · ₹X.X L (≥10 L) · ₹X.XX L (≥1 L)

---

## Deployment Targets

| Target | Directory | URL |
|--------|-----------|-----|
| **Docker (local / K8s)** | `frontend/` (Next.js) + `backend/` (FastAPI) | http://localhost:3007 |
| **Vercel (cloud)** | `web/` (Next.js, consolidated Vercel app) | https://dclaw-finance.vercel.app |
| **Backend API** | `backend/` | http://localhost:8096 · `/docs` for Swagger |

Both `frontend/` and `web/` share the same backend and have the same route structure.

---

## Core Entities

### Invoice
```
Invoice
├── id: UUID (PK)
├── invoice_number: str (unique, required)
├── client_name: str (required)
├── client_email: str (required)
├── issue_date: date (required)
├── due_date: date (required)
├── status: enum ["draft", "sent", "paid", "overdue", "cancelled"] (default: "draft")
├── subtotal: float (default 0)
├── tax_rate: float (default 0)
├── tax_amount: float (default 0)
├── total: float (default 0)
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### InvoiceItem
```
InvoiceItem
├── id: UUID (PK)
├── invoice_id: UUID (FK → Invoice, ondelete=CASCADE)
├── description: str (required, non-empty)
├── quantity: float (default 1)
├── unit_price: float (default 0)
├── amount: float  ← quantity × unit_price, computed on create/update
├── created_at: datetime
└── updated_at: datetime
```

### Expense
```
Expense
├── id: UUID (PK)
├── category: enum ["office", "travel", "software", "marketing", "salary", "other"]
├── description: str (required, max 500)
├── amount: float (required)
├── date: date (required)
├── vendor: str (optional, max 255)
├── receipt_url: str (optional, max 500)
├── ai_suggested_category: str (optional)  ← cached LLM result; cuts re-categorisation cost
├── created_at: datetime
└── updated_at: datetime
```

### Budget
```
Budget
├── id: UUID (PK)
├── category: str (matches Expense.category enum)
├── monthly_limit: float (required)
├── year: int (required)
├── month: int (required, 1–12)
├── created_at: datetime
└── updated_at: datetime

Unique constraint: (category, year, month)
POST /budgets is UPSERT — updates limit if budget already exists for that category/month.
```

### ChatMessage
```
ChatMessage
├── id: UUID (PK)
├── role: str ["user", "assistant"]
├── content: str
└── created_at: datetime
```

---

## Screens

### Screen 1: Landing (`/`)
- Marketing page with hero, 9 AI feature cards, architecture overview, demo CTA
- Links to all app sections in footer nav
- Links to GitHub repo

### Screen 2: Dashboard (`/dashboard`)
- KPI cards: Total Revenue, Outstanding Invoices, Total Expenses, Net Profit — all INR with crore/lakh formatting
- Net Profit card shows MoM % change derived from 12-month trend data (no extra API call)
- 12-month Revenue vs Expenses `LineChart` (Recharts) — data from `/dashboard/trends`
- Expenses by category `BarChart`
- Overdue invoices list with amount and due date badge

### Screen 3: Invoices (`/invoices`)
- Table: invoice number (link), client, due date, status badge, total in INR
- Status filter dropdown
- Search by invoice number / client name
- "New Invoice" button

### Screen 4: New Invoice (`/invoices/new`)
- Invoice header: number, client name, client email, dates, tax rate, notes
- Line items editor: description (required, non-empty), quantity × unit price = amount in INR
- **AI:** After first line item description + client name → dismissible suggestion chips for 3 additional items; click to append
- Running subtotal / tax / total footer in INR
- Client-side guard: all line items must have non-empty description before submission

### Screen 5: Invoice Detail (`/invoices/[id]`)
- Invoice header with client info, issue/due dates, status badge
- Line items table with INR amounts
- Status action buttons: Mark Sent, Mark Paid
- **AI:** "Draft Reminder" button (visible when `status == "sent"` or `"overdue"`) → opens `<Dialog>` with AI-written email; editable subject + body; Copy to clipboard

### Screen 6: Expenses (`/expenses`)
- **Tab 1 — All Expenses:** searchable, filterable table with category badge, vendor, amount in INR
- **Tab 2 — Anomalies:** statistical outliers (z-score > 2) with z-score badge and one-sentence LLM explanation; rows are clickable to expand full explanation

### Screen 7: New Expense (`/expenses/new`)
- **Receipt OCR dropzone** — drag-and-drop or browse; "Reading receipt…" spinner; auto-fills all fields from vision model
- 600ms debounced AI categorisation after typing vendor + description
- Category `<Select>` pre-filled with AI suggestion + "AI suggested (XX%)" badge
- Amount, date, vendor, description fields

### Screen 8: Forecast (`/forecast`)
- 3-month summary cards (projected revenue, expenses, profit in INR; confidence range)
- `AreaChart` — projected revenue (green), expenses (red), profit (purple), shaded confidence band
- Footnote: 6-month trailing actuals, exponential smoothing α=0.3, growth capped ±20%

### Screen 9: Cash Flow (`/cash-flow`)
- **13-week rolling cash flow** `AreaChart` — weekly cumulative position projected from trailing 3-month actuals
- Running balance line with colour-coded positive/negative zones
- **Top 3 Optimization Levers** — cards showing highest expense categories with 10% reduction potential and INR savings estimate
- All amounts in INR

### Screen 10: Reports (`/reports`)
- Year + month number inputs (validated: month 1–12, year 2000–2099)
- "Generate Report" button
- On success: revenue/expenses/profit KPI cards + top cost drivers list + full prose executive summary (plain text, `claude-sonnet-4-6`)

### Screen 11: Budgets (`/budgets`)
- Top form: category selector (✓ marks existing budgets) + INR limit input with live crore/lakh preview → "Add Budget" / "Update Budget"
- Per-category cards: spend vs limit in INR, progress bar, % utilisation, ⚠ badge at ≥80%
- Inline edit per card; Remove button
- **AI:** suggestion box appears at ≥80% utilisation with one actionable recommendation

### Screen 12: Clients (`/clients`)
- Ranked table: client, revenue in INR, outstanding in INR, invoice count, composite score badge
- Score = revenue 70% + outstanding balance 30%; badge: green ≥70, amber 40–69, red <40
- Click row → expands AI insight sentence (24h cached)
- Direct-URL `/clients/profitability` redirects to `/clients`

### Screen 13: Ask AI (`/chat`)
- Persistent message history (last 50 messages from DB)
- User messages (purple), assistant messages (light grey)
- 4 suggestion chips on first load
- Enter-to-send; LLM uses tool-use against real DB: `get_expense_summary`, `get_revenue_summary`, `get_dashboard_summary`, `list_recent_expenses`

---

## AI Feature Summary

| # | Feature | Trigger | Model | Approx tokens | Cache |
|---|---------|---------|-------|---------------|-------|
| 1 | Expense auto-categorisation | 600ms debounce | haiku-4-5 | ~50 | `ai_suggested_category` DB column |
| 2 | Receipt OCR | File upload | haiku-4-5 (vision) | ~1k image | None |
| 3 | Invoice reminder draft | Button click | sonnet-4-6 | ~250 | None |
| 4 | Invoice line-item suggestions | First item typed | haiku-4-5 | ~200 | None |
| 5 | Anomaly explanation | Anomaly tab load | haiku-4-5 | ~200 batch | 1h in-memory |
| 6 | Monthly executive report | Button click | sonnet-4-6 | ~1k | None |
| 7 | Budget breach suggestion | ≥80% utilisation | haiku-4-5 | ~150 | None |
| 8 | Client profitability insight | Page load | haiku-4-5 | ~300 batch | 24h in-memory |
| 9 | NL financial Q&A | Chat send | sonnet-4-6 | ~500–2k | Chat history in DB |

**Statistical only (no LLM):** Forecast (exponential smoothing), 13-week cash flow, optimization levers, trend chart, anomaly z-score detection.

All AI endpoints accept `?dry_run=true` to return mock data without spending tokens.

---

## API Endpoints (v1.4 — Complete)

```
# Health
GET    /health                             → {"status": "ok"}

# Dashboard
GET    /api/v1/dashboard                   → KPI summary (revenue, expenses, profit, outstanding)
GET    /api/v1/dashboard/trends            → 12-month [{month, revenue, expenses}]

# Invoices
GET    /api/v1/invoices                    → List (optional ?status= filter)
POST   /api/v1/invoices                    → Create
GET    /api/v1/invoices/{id}              → Detail with line items
PUT    /api/v1/invoices/{id}              → Update header fields
DELETE /api/v1/invoices/{id}              → Delete (204 No Content)
POST   /api/v1/invoices/{id}/items        → Add line item
PUT    /api/v1/invoices/{id}/items/{iid} → Update line item
DELETE /api/v1/invoices/{id}/items/{iid} → Delete line item (204)
POST   /api/v1/invoices/{id}/reminder-draft → AI email draft (sent/overdue only)
POST   /api/v1/invoices/suggest-items     → AI line-item suggestions by client history

# Expenses
GET    /api/v1/expenses                    → List (optional ?category= filter)
POST   /api/v1/expenses                    → Create
GET    /api/v1/expenses/{id}              → Detail
PUT    /api/v1/expenses/{id}              → Update
DELETE /api/v1/expenses/{id}              → Delete (204 No Content)
POST   /api/v1/expenses/categorize        → AI category suggestion {description, vendor}
POST   /api/v1/expenses/ocr              → Receipt vision extraction (multipart/form-data)
GET    /api/v1/expenses/anomalies         → Statistical outliers + LLM explanations (1h cache)

# Forecast  (all statistical — no LLM)
GET    /api/v1/forecast                   → 3-month projection with confidence bands
GET    /api/v1/forecast/mape              → Forecast accuracy (MAPE %) vs actuals
GET    /api/v1/forecast/scenarios         → 5 scenarios: base, bull, bear, high_growth, conservative
GET    /api/v1/forecast/drivers           → Active clients, win rate, avg deal size, churn rate
GET    /api/v1/forecast/sensitivity       → 4-point revenue/expense sensitivity table
GET    /api/v1/forecast/three-statement   → Projected income statement + cash flow + balance sheet

# Cash Flow  (all statistical — no LLM)
GET    /api/v1/cash-flow/13-week          → 13-week weekly rolling cash projection
GET    /api/v1/cash-flow/optimization     → Top 3 expense categories + 10% reduction lever

# Reports
POST   /api/v1/reports/monthly-summary    → AI executive summary {year, month} (month: 1–12)

# Clients
GET    /api/v1/clients/profitability      → Ranked table + AI insight per client (24h cache)

# Budgets
GET    /api/v1/budgets                    → List for ?year=&month=
POST   /api/v1/budgets                   → Create or update (upsert on category+year+month)
PUT    /api/v1/budgets/{id}              → Update limit
DELETE /api/v1/budgets/{id}              → Delete (204 No Content)
GET    /api/v1/budgets/status            → Utilisation % + AI breach suggestions

# Chat (NL Q&A)
POST   /api/v1/chat                       → Send message — agentic tool-use loop
GET    /api/v1/chat/history               → Recent 50 messages

# Demo / testing
POST   /api/v1/demo/load                  → Seed demo data for current DB
```

---

## LLM Provider Architecture

```
OPENROUTER_API_KEY set?
  Yes → OpenAI SDK → https://openrouter.ai/api/v1
        Models: anthropic/claude-haiku-4-5, anthropic/claude-sonnet-4-6
  No  → ANTHROPIC_API_KEY set?
          Yes → Anthropic SDK → https://api.anthropic.com
          No  → OLLAMA_URL set?
                  Yes → Ollama (local) → OLLAMA_MODEL (default: llama3.1)
                  No  → raise RuntimeError at call time
```

All calls go through `backend/app/services/llm_client.py`. Services never import `anthropic` or `openai` directly.

---

## Non-Functional Requirements

| Requirement | Spec |
|-------------|------|
| **Currency** | INR only. Format: ≥₹1Cr → "₹X.XX Cr"; ≥₹10L → "₹X.X L"; ≥₹1L → "₹X.XX L". `formatINR()` in `web/src/lib/utils.ts` |
| **Design system** | One Convergence Vol. 01 — `#7030A0` purple, Manrope display, Inter body, JetBrains Mono labels |
| **AI resilience** | All AI calls in `try/except`; endpoints return data without AI insight if LLM unavailable |
| **AI cost controls** | `?dry_run=true` on all AI endpoints; 1h cache on anomalies; 24h cache on client insights; `ai_suggested_category` DB column avoids re-categorising same expense |
| **Backend tests** | `pytest-asyncio` + `httpx.AsyncClient` + `ASGITransport`; test DB override via `get_db` DI |
| **Frontend** | Responsive; Tailwind CSS; shadcn/ui-style custom components; strict TypeScript |
| **Docker** | All services: `docker compose up -d`. Postgres port 5434. Non-root containers |
| **Migrations** | All schema changes via Alembic. Run `alembic upgrade head` before first start |
| **Data** | Everything in PostgreSQL — no in-memory mock dicts |
| **Demo data** | `scripts/seed_data.py` — 50 invoices + 207 expenses + 6 budgets for "Meridian AI Technologies" |
| **Auth** | JWT validation via Logto (`LOGTO_ENDPOINT`). Omit in dev → all endpoints open. JWKS cached 1h with TTL |
| **Rate limiting** | Auth endpoint: 10 attempts / 60s per IP (in-process; swap to slowapi+Redis for multi-worker) |

---

## Known Open Defects (v1.4 — Target Fix)

| ID | Severity | Description | File |
|----|----------|-------------|------|
| B1 | Critical | `api()` calls `res.json()` on 204 — all DELETE buttons silently broken | `web/src/lib/api.ts` |
| B2 | High | Invoice form allows empty line item description → 422; amounts show `$` not `₹` | `web/src/app/invoices/new/page.tsx` |
| B3 | Medium | Report month input not validated → month=13 causes backend 500 | `web/src/app/reports/page.tsx`, `backend/.../reports.py` |
| B4 | High | `/clients/profitability` returns Next.js 404; no redirect in `web/` | `web/src/app/clients/profitability/page.tsx` (missing) |
| B5 | Medium | Dashboard Net Profit card has no MoM % change indicator | `web/src/app/dashboard/page.tsx` |
| B6 | Medium | Anomaly rows not clickable; AI explanation unreachable | `web/src/app/expenses/page.tsx` |
| S1 | Critical | Auth endpoints not rate limited; JWKS cache has no TTL | `backend/app/core/auth.py` |
| S2 | High | Dev-mode auth bypass (`return {}`) if LOGTO_ENDPOINT missing in prod | `backend/app/core/auth.py` |
| S3 | High | `structlog` absent from `requirements.txt`; no Sentry on backend or frontend | `requirements.txt`, `main.py` |
| S4 | High | Forecast sub-endpoints have zero pytest coverage; mutation score 27/100 | `backend/tests/` |

See `PLAN-v1.4.md` for full remediation steps and implementation order.
