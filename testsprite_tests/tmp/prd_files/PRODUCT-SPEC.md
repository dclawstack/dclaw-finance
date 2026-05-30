# PRODUCT-SPEC: DClaw Finance

## Overview

**App Name:** DClaw Finance
**Version:** 1.2 (May 2026)
**Domain:** AI-augmented invoicing, expense management, and financial intelligence
**Target User:** Enterprise finance teams, CFOs, founders, accountants at B2B SaaS and services companies
**Design System:** One Convergence Vol. 01 — Purple `#7030A0` · White `#FFFFFF` · Manrope/Inter/JetBrains Mono
**Currency:** Indian Rupees (INR) — displayed in lakhs (L) and crores (Cr)

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
├── description: str (required)
├── quantity: float (required, default 1)
├── unit_price: float (required, default 0)
├── amount: float (required, default 0)  ← quantity × unit_price
├── created_at: datetime
└── updated_at: datetime
```

### Expense
```
Expense
├── id: UUID (PK)
├── category: enum ["office", "travel", "software", "marketing", "salary", "other"] (required)
├── description: str (required, max 500)
├── amount: float (required, default 0)
├── date: date (required)
├── vendor: str (optional, max 255)
├── receipt_url: str (optional, max 500)
├── ai_suggested_category: str (optional)  ← cached LLM categorisation result
├── created_at: datetime
└── updated_at: datetime
```

### Budget (v1.2)
```
Budget
├── id: UUID (PK)
├── category: str (matches Expense.category enum)
├── monthly_limit: float (required)
├── year: int (required)
├── month: int (required, 1–12)
├── created_at: datetime
└── updated_at: datetime
```
Unique constraint: one budget per `(category, year, month)`. `POST /budgets` is upsert — updates limit if one already exists.

### ChatMessage (v1.2)
```
ChatMessage
├── id: UUID (PK)
├── role: str ["user", "assistant"]
├── content: str (full message text)
└── created_at: datetime
```

---

## Screens

### Screen 1: Dashboard (`/`)
- KPI cards: total revenue (paid invoices), outstanding invoices, total expenses, net profit — all in INR with crore/lakh formatting
- 12-month Revenue vs Expenses `LineChart` (Recharts)
- Expenses by category `BarChart`
- Overdue invoices list with amount and due date badge

### Screen 2: Invoices (`/invoices`)
- Table with invoice number (link), client, due date, status badge, total in INR
- Status filter dropdown
- Search by number / client name
- "New Invoice" button

### Screen 3: New Invoice (`/invoices/new`)
- Invoice header fields (number, client, dates, tax rate, notes)
- Line items with quantity × unit price = amount
- **AI:** After typing first line item description + client name → dismissible suggestion chips for 3 additional items (click to append)
- Running subtotal/tax/total footer

### Screen 4: Invoice Detail (`/invoices/[id]`)
- Invoice header with client info, issue/due dates, status badge
- Line items table with INR amounts
- Status action buttons (Mark Sent, Mark Paid)
- **AI:** "Draft Reminder" button (visible when status is `sent` or `overdue`) → opens `<Dialog>` with AI-written email draft; editable subject + body; Copy to clipboard

### Screen 5: Expenses (`/expenses`)
- **Tab 1 — All Expenses:** searchable, filterable table with category badge, vendor, amount in INR
- **Tab 2 — Anomalies:** statistical outliers (z-score > 2) with z-score badge and one-sentence AI explanation per flagged item
- "Add Expense" button

### Screen 6: New Expense (`/expenses/new`)
- **Receipt OCR dropzone** at top — drag-and-drop or browse; shows "Reading receipt…" spinner; auto-fills all fields from vision AI response
- Vendor and description fields trigger 600ms debounced AI categorisation
- Category `<Select>` pre-filled with AI suggestion + "AI suggested (XX%)" badge
- Amount, date, vendor fields

### Screen 7: Forecast (`/forecast`)
- 3-month summary cards (June, July, August) showing projected revenue, expenses, profit in INR; confidence range
- `AreaChart` with projected revenue (green), expenses (red), profit (purple), shaded confidence band
- Footnote: 6-month trailing data, exponential smoothing α=0.3, growth capped ±20%

### Screen 8: Reports (`/reports`)
- Year + month number inputs
- "Generate Report" button (calls `claude-sonnet-4-6` via OpenRouter)
- On success: revenue/expenses/profit KPI cards in INR + top cost drivers list + full prose executive summary (plain text)

### Screen 9: Budgets (`/budgets`)
- Top form: category selector (✓ marks existing budgets) + INR limit input with live crore/lakh preview → "Add Budget" or "Update Budget"
- Per-category cards with:
  - Coloured top stripe (purple when healthy, red when ≥80%)
  - Spend vs limit in INR, progress bar
  - % utilization; ⚠ badge when ≥80%
  - **Edit button** → inline input with live INR preview; Save / Cancel
  - Remove button
  - AI suggestion box when ≥80% utilization

### Screen 10: Clients (`/clients`)
- Ranked table: client name, industry, total revenue in INR, outstanding in INR, invoice count, score badge
- Profitability score = revenue 70% + outstanding balance 30%
- Score badge: green ≥70, amber 40–69, red <40
- Click row → expands AI insight sentence

### Screen 11: Ask AI (`/chat`)
- Message bubbles (user = purple, assistant = light grey)
- Persisted history loaded on mount
- 4 quick-start suggestion chips (hide once first message sent)
- Input + Send button; Enter-to-send
- LLM uses tool-use to query real DB: `get_expense_summary`, `get_revenue_summary`, `get_dashboard_summary`, `list_recent_expenses`

---

## AI Feature Summary

| # | Feature | Trigger | Model | Cost tier | Caching |
|---|---------|---------|-------|-----------|---------|
| 1 | Expense auto-categorisation | 600ms debounce after typing | haiku | ~50 tok | `ai_suggested_category` column |
| 2 | Receipt OCR | File upload | haiku (vision) | ~1k tok | None |
| 3 | Reminder draft | Button click | sonnet | ~250 tok | None |
| 4 | Line-item suggestions | First item typed | haiku | ~200 tok | None |
| 5 | Anomaly explanation | On tab load | haiku | ~200 tok batch | 1h in-memory |
| 6 | Monthly report | Button click | sonnet | ~1k tok | None |
| 7 | Budget breach suggestion | ≥80% threshold | haiku | ~150 tok | None |
| 8 | Client profitability insight | On page load | haiku | ~300 tok batch | 24h in-memory |
| 9 | NL financial Q&A | Chat send | sonnet | ~500–2k tok | Chat history in DB |

Features 5 (forecast), 6 (trend chart) are **statistical only — no LLM**.

All AI endpoints support `?dry_run=true` to return mock data without spending tokens.

---

## API Endpoints (v1.2 — Complete)

```
# Dashboard
GET    /api/v1/dashboard              → KPI summary
GET    /api/v1/dashboard/trends       → 12-month {month, revenue, expenses}[]

# Invoices
GET    /api/v1/invoices               → List (status filter)
POST   /api/v1/invoices               → Create
GET    /api/v1/invoices/{id}          → Detail
PUT    /api/v1/invoices/{id}          → Update
DELETE /api/v1/invoices/{id}          → Delete
POST   /api/v1/invoices/{id}/items    → Add line item
PUT    /api/v1/invoices/{id}/items/{item_id} → Update line item
DELETE /api/v1/invoices/{id}/items/{item_id} → Delete line item
POST   /api/v1/invoices/{id}/reminder-draft  → AI email draft (sent/overdue only)
POST   /api/v1/invoices/suggest-items        → AI line-item suggestions

# Expenses
GET    /api/v1/expenses               → List (category filter)
POST   /api/v1/expenses               → Create
GET    /api/v1/expenses/{id}          → Detail
PUT    /api/v1/expenses/{id}          → Update
DELETE /api/v1/expenses/{id}          → Delete
POST   /api/v1/expenses/categorize   → AI category suggestion
POST   /api/v1/expenses/ocr          → Receipt vision extraction
GET    /api/v1/expenses/anomalies    → Statistical outliers + LLM explanations

# Forecast (statistical, no LLM)
GET    /api/v1/forecast               → 3-month projection with confidence bands

# Reports
POST   /api/v1/reports/monthly-summary → AI executive summary for year+month

# Clients
GET    /api/v1/clients/profitability  → Ranked by composite score + AI insights

# Budgets
GET    /api/v1/budgets                → List for year/month
POST   /api/v1/budgets               → Create or update (upsert)
PUT    /api/v1/budgets/{id}          → Update limit
DELETE /api/v1/budgets/{id}          → Delete
GET    /api/v1/budgets/status        → Utilization + AI breach suggestions

# Chat
POST   /api/v1/chat                  → Send message (agentic tool-use)
GET    /api/v1/chat/history          → Recent 50 messages
```

---

## Non-Functional Requirements

| Requirement | Spec |
|-------------|------|
| **Currency** | Indian Rupees (INR). Display: ≥₹1Cr → "₹X.XX Cr"; ≥₹10L → "₹X.X L"; ≥₹1L → "₹X.XX L" |
| **Design system** | One Convergence Vol. 01 — `#7030A0` purple, Manrope display, Inter body, JetBrains Mono labels, 2px sharp corners |
| **AI provider** | OpenRouter (primary) or Anthropic direct — swappable via `.env` key, no code changes |
| **AI resilience** | All AI endpoints wrapped in `try/except`; return data without insights if LLM unavailable |
| **Backend tests** | 70%+ coverage via `pytest-asyncio` + `httpx.AsyncClient` + `ASGITransport` |
| **Frontend** | Responsive; Tailwind CSS; shadcn/ui-style custom components |
| **Docker** | All services start with `docker compose up -d`; postgres on port 5434; non-root containers |
| **Migrations** | All schema changes via Alembic; `alembic upgrade head` required before first run |
| **No mock data** | Everything persisted to PostgreSQL; no in-memory dicts |
| **Demo data** | `scripts/seed_data.py` seeds 50 invoices + 207 expenses + 6 budgets from `Meridian AI Technologies` (DKube-modeled fictional company) |
