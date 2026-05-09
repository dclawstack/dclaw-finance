# Finance — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [ ] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `backend/app/services/` directory exists with `__init__.py` (required for all AI features)
- [ ] `ANTHROPIC_API_KEY` is in `.env` and wired in `backend/app/core/config.py`

## v1.0 Feature Inventory (Current)

- [x] Invoice CRUD (create, list, detail, update, delete)
- [x] Expense CRUD (create, list, update, delete, category filter)
- [x] Dashboard (total revenue, outstanding invoices, total expenses, net profit, overdue list, expenses by category chart)
- [x] Docker + Helm deployment
- [x] Alembic migrations
- [x] Backend tests (invoices, expenses)

---

## AI Integration Notes (Read Before Building AI Features)

- **LLM client:** `anthropic>=0.25.0` — add to `backend/requirements.txt`
- **Model tiers:** Use `claude-haiku-4-5` for categorization/OCR/short tasks (cheap, fast). Use `claude-sonnet-4-6` for reports and chat (better reasoning).
- **Services layer:** All LLM calls live in `backend/app/services/`. Never call AI from repositories or routers directly.
- **Caching pattern:** Add nullable `ai_*` columns to models where LLM output can be reused (e.g., `Expense.ai_suggested_category`). Return cached value on re-fetch — cuts ongoing costs by 80%+.
- **Dry-run support:** All AI endpoints accept `?dry_run=true` to return a mock response during UI development.

---

## v1.2 Roadmap

### P0 — Must Have (Low complexity · Low token cost · High user impact)

#### 1. AI Expense Auto-Categorization

**Description:** When creating an expense, debounce-call an LLM after the user types description + vendor and auto-suggest the category before saving.

- **Backend:**
  - `backend/app/services/ai_categorizer.py` — single LLM call: `"Given vendor='{vendor}' and description='{description}', return one of: office|travel|software|marketing|salary|other as JSON"`
  - `POST /api/v1/expenses/categorize` → `{description, vendor}` → `{suggested_category, confidence}`
  - Add `ai_suggested_category: Mapped[str | None]` column to `Expense` model + alembic migration
- **Frontend:**
  - Debounce call in `frontend/src/app/expenses/new/page.tsx` after description/vendor fields
  - Pre-fill category `<Select>` with suggestion + "AI suggested" `<Badge>`
- **Files to touch:** `backend/app/services/ai_categorizer.py` (new), `backend/app/api/v1/expenses.py`, `backend/app/models/expense.py`, `backend/app/core/config.py`, `backend/requirements.txt`, `frontend/src/app/expenses/new/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Low · **Token cost:** Low (~50 tokens/call, claude-haiku) · **Impact:** High

---

#### 2. Monthly Spend Trend Chart (12-month Revenue vs. Expenses)

**Description:** Replace the hardcoded stub in `finance.py` with a real DB-backed monthly aggregation and render a 12-month line chart on the dashboard.

- **Backend:**
  - `GET /api/v1/dashboard/trends` — SQLAlchemy `extract('year', ...)` + `extract('month', ...)` to group `Invoice.total` (paid) and `Expense.amount` by month, trailing 12 months
  - No LLM, no migration needed
- **Frontend:**
  - `LineChart` (Recharts already installed) below the existing bar chart in `frontend/src/app/page.tsx`
  - `getDashboardTrends()` in `frontend/src/lib/api.ts`
- **Files to touch:** `backend/app/api/v1/dashboard.py`, `frontend/src/app/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Low · **Token cost:** None · **Impact:** High

---

#### 3. Invoice Payment Reminder Drafts (AI-written)

**Description:** For overdue/sent invoices, generate a polite payment reminder email draft at the click of a button.

- **Backend:**
  - `POST /api/v1/invoices/{id}/reminder-draft` → `{subject: str, body: str}`
  - `backend/app/services/ai_writer.py` — prompt: `"Write a professional payment reminder for invoice #{number} to {client_name}, due {due_date}, amount ${total}. Under 100 words."`
- **Frontend:**
  - "Draft Reminder" button on `frontend/src/app/invoices/[id]/page.tsx` when `status === "overdue" || "sent"`
  - Opens `<Dialog>` with editable subject/body + "Copy to clipboard" button
- **Files to touch:** `backend/app/services/ai_writer.py` (new), `backend/app/api/v1/invoices.py`, `frontend/src/app/invoices/[id]/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Low · **Token cost:** Low (~250 tokens/call, user-triggered) · **Impact:** High

---

#### 4. Receipt OCR — Image to Expense Pre-fill

**Description:** User uploads a receipt image; LLM vision extracts amount, vendor, date, description and pre-fills the expense form.

- **Backend:**
  - `POST /api/v1/expenses/ocr` — `multipart/form-data` image upload
  - `backend/app/services/receipt_ocr.py` — base64 image → claude-haiku vision → `{vendor, amount, date, description, suggested_category}`
  - Save file, return `receipt_url` (field already exists on `Expense` model)
  - Add `python-multipart>=0.0.9` to `backend/requirements.txt`
- **Frontend:**
  - File dropzone at the top of `frontend/src/app/expenses/new/page.tsx`
  - Spinner state "Reading receipt…" → auto-populate all fields on response
- **Files to touch:** `backend/app/services/receipt_ocr.py` (new), `backend/app/api/v1/expenses.py`, `backend/requirements.txt`, `frontend/src/app/expenses/new/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Low-Med · **Token cost:** Med (~1000 image tokens, user-triggered) · **Impact:** High

---

### P1 — Should Have (Med complexity · manageable cost · high impact)

#### 5. Real Cash Flow Forecast (Statistical, No LLM)

**Description:** Replace the hardcoded random stub in `finance.py` with a real statistical 3-month forward projection using trailing 6-month exponential smoothing.

- **Backend:**
  - Rewrite `backend/app/api/v1/finance.py` — real monthly DB queries, exponential smoothing via `statistics` stdlib (no new dependencies), return `{projected_revenue, projected_expenses, projected_profit, confidence_band_low, confidence_band_high}` per month
- **Frontend:**
  - `/forecast` page at `frontend/src/app/forecast/page.tsx`
  - Recharts `AreaChart` with shaded confidence band
  - Add "Forecast" nav link in `frontend/src/app/layout.tsx`
- **Files to touch:** `backend/app/api/v1/finance.py`, `frontend/src/app/forecast/page.tsx` (new), `frontend/src/app/layout.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Med · **Token cost:** None · **Impact:** High

---

#### 6. Expense Anomaly Detection (Stats + LLM Explanation)

**Description:** Automatically flag expenses that are statistical outliers (z-score > 2) within their category. LLM generates a one-sentence explanation per flagged item in a single batched call.

- **Backend:**
  - `backend/app/services/anomaly_detector.py` — `func.avg` + `func.stddev_pop` per category, flag expenses > mean + 2σ
  - `GET /api/v1/expenses/anomalies` → `[{expense, zscore, llm_explanation}]`
  - Single batched LLM call for all flagged items; cache result 1h in-memory
- **Frontend:**
  - "Anomalies" tab on `frontend/src/app/expenses/page.tsx` using existing `<Tabs>` component
  - Amber `<Badge>` + tooltip with LLM explanation per flagged item
- **Files to touch:** `backend/app/services/anomaly_detector.py` (new), `backend/app/api/v1/expenses.py`, `frontend/src/app/expenses/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Med · **Token cost:** Low (~200 tokens batch, cached 1h) · **Impact:** High

---

#### 7. AI Monthly Financial Summary Report

**Description:** Generate a natural language one-page executive summary: revenue vs. expenses, top cost drivers, profit trend, and 3 actionable recommendations.

- **Backend:**
  - `POST /api/v1/reports/monthly-summary` with `{year, month}` body
  - `backend/app/services/report_generator.py` — aggregate month data, pass structured JSON to claude-sonnet with a financial advisor prompt
  - Register router in `backend/app/api/main.py`
- **Frontend:**
  - `frontend/src/app/reports/page.tsx` — "Generate Report" button, month selector, rendered prose output
  - Add "Reports" nav link in `frontend/src/app/layout.tsx`
- **Files to touch:** `backend/app/services/report_generator.py` (new), `backend/app/api/v1/reports.py` (new), `backend/app/api/main.py`, `frontend/src/app/reports/page.tsx` (new), `frontend/src/app/layout.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Med · **Token cost:** Med (~1000 tokens, user-triggered once/month) · **Impact:** High

---

#### 8. Smart Invoice Line-Item Suggestions

**Description:** After typing the first invoice line item, suggest 3 additional typical line items based on service type + client history.

- **Backend:**
  - `POST /api/v1/invoices/suggest-items` — look up `InvoiceItem` history by `client_name`, pass context + first item to LLM, return `[{description, typical_unit_price}]`
  - Extend `backend/app/services/ai_writer.py`
- **Frontend:**
  - Dismissible "Suggested items" dropdown below line items in `frontend/src/app/invoices/new/page.tsx`
  - Clicking suggestion appends to items list
- **Files to touch:** `backend/app/api/v1/invoices.py`, `backend/app/services/ai_writer.py`, `frontend/src/app/invoices/new/page.tsx`, `frontend/src/lib/api.ts`
- **Complexity:** Med · **Token cost:** Low (~200 tokens, user-triggered) · **Impact:** Med-High

---

### P2 — Could Have (Higher complexity or cost · niche but differentiating)

#### 9. Natural Language Financial Q&A (Chat Interface)

**Description:** Chat panel — users ask "What did I spend on software last quarter?" and get answers grounded in real DB data via LLM tool-use/function-calling.

- **Backend:** New `chat_messages` model + migration, `backend/app/services/nl_query.py` with defined query tools (list_expenses_by_period, get_revenue_by_month, etc.), streaming response via SSE, `POST /api/v1/chat`
- **Frontend:** `frontend/src/app/chat/page.tsx` — message bubbles, streaming `ReadableStream`, "Ask AI" nav link
- **Files to touch:** `backend/app/models/chat_message.py` (new), `backend/app/repositories/chat_repo.py` (new), `backend/app/services/nl_query.py` (new), `backend/app/api/v1/chat.py` (new), `backend/app/api/main.py`, migration, `frontend/src/app/chat/page.tsx` (new), layout, api.ts
- **Complexity:** High · **Token cost:** High (grows with conversation history) · **Impact:** High

---

#### 10. Budget Planning with AI Guardrails

**Description:** Set monthly category budgets; AI flags over-budget categories at ≥80% utilization and suggests one cut action per breach.

- **Backend:** New `Budget` model (`{id, category, monthly_limit, year, month}`) + migration + CRUD, `GET /api/v1/budgets/status` computes utilization, calls LLM only on breach
- **Frontend:** `frontend/src/app/budgets/page.tsx` — per-category progress bars, threshold input, AI suggestions panel, nav link
- **Files to touch:** `backend/app/models/budget.py` (new), `backend/app/repositories/budget_repo.py` (new), `backend/app/api/v1/budgets.py` (new), migration, `frontend/src/app/budgets/page.tsx` (new), layout, api.ts
- **Complexity:** Med-High · **Token cost:** Low (conditional, breach-only) · **Impact:** Med

---

#### 11. Client Profitability Scoring

**Description:** Score each client by revenue, payment speed, and outstanding balance. Surface a ranked table with a one-sentence AI insight per top/bottom client.

- **Backend:** `GET /api/v1/clients/profitability` — aggregate `invoices` by `client_name`, compute score, single batched LLM call for insights (24h cache)
- **Frontend:** `frontend/src/app/clients/page.tsx` — ranked table, score column, trend indicator, collapsible AI insight row
- **Files to touch:** `backend/app/api/v1/clients.py` (new), `backend/app/api/main.py`, `frontend/src/app/clients/page.tsx` (new), layout, api.ts
- **Complexity:** Med · **Token cost:** Low-Med (batched, cached 24h) · **Impact:** Med

---

## Implementation Priority

1. **P0-2** Monthly Trend Chart (no LLM, highest immediate value)
2. **P0-1** AI Expense Auto-Categorization (enables P0-4 too, creates services/ layer)
3. **P0-3** Invoice Reminder Drafts (uses services/ layer already created)
4. **P0-4** Receipt OCR (vision API, builds on categorizer)
5. **P1-1** Real Cash Flow Forecast (no LLM, fixes misleading stub)
6. **P1-2** Anomaly Detection (batched LLM, high value)
7. **P1-3** Monthly Report (uses existing services, high WOW factor)
8. **P1-4** Invoice Line-Item Suggestions (nice UX polish)
9. **P2-1** NL Chat (biggest lift, do last)
10. **P2-2** Budget Planning
11. **P2-3** Client Scoring
