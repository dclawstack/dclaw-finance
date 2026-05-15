# Finance — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [x] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [x] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [x] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [x] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [x] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [x] `backend/app/services/` directory exists with `__init__.py` (required for all AI features)
- [x] AI key is in `.env` and wired in `backend/app/core/config.py` (`OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY`)

## v1.0 Feature Inventory (Current)

- [x] Invoice CRUD (create, list, detail, update, delete)
- [x] Expense CRUD (create, list, update, delete, category filter)
- [x] Dashboard (total revenue, outstanding invoices, total expenses, net profit, overdue list, expenses by category chart)
- [x] Docker + Helm deployment
- [x] Alembic migrations
- [x] Backend tests (invoices, expenses)

---

## AI Integration Notes (Read Before Building AI Features)

- **LLM dependencies:** `anthropic>=0.25.0` + `openai>=1.0.0` — both in `backend/requirements.txt`
- **Provider selection:** `OPENROUTER_API_KEY` takes priority → OpenAI SDK → `https://openrouter.ai/api/v1`. Fallback: `ANTHROPIC_API_KEY` → Anthropic SDK. Model names auto-prefixed `anthropic/` for OpenRouter.
- **Unified client:** All LLM calls go through `backend/app/services/llm_client.py` — never import `anthropic` or `openai` directly in services. Use `chat()`, `chat_vision()`, or `agentic_loop()`.
- **Model tiers:** Use `claude-haiku-4-5` for categorization/OCR/short tasks. Use `claude-sonnet-4-6` for reports and chat.
- **Services layer:** All LLM calls live in `backend/app/services/`. Never call AI from repositories or routers directly.
- **Caching pattern:** Add nullable `ai_*` columns to models where LLM output can be reused. Return cached value on re-fetch — cuts ongoing costs by 80%+.
- **Dry-run support:** All AI endpoints accept `?dry_run=true` to return a mock response during UI development.
- **Graceful degradation:** Wrap all AI calls in `try/except` so endpoints return data even when LLM is unavailable.
- **Plain text output:** Prompt all LLM calls for plain text output (no markdown). Backend also strips markdown via regex.

---

## v1.2 Roadmap

### P0 — Must Have (Low complexity · Low token cost · High user impact)

#### 1. AI Expense Auto-Categorization ✅

**Description:** When creating an expense, debounce-call an LLM after the user types description + vendor and auto-suggest the category before saving.

- **Backend:**
  - `backend/app/services/ai_categorizer.py` — `chat()` call: classify into one of 6 categories, return JSON
  - `POST /api/v1/expenses/categorize` → `{description, vendor}` → `{suggested_category, confidence}`
  - Add `ai_suggested_category: Mapped[str | None]` column to `Expense` model + alembic migration
- **Frontend:**
  - 600ms debounce in `frontend/src/app/expenses/new/page.tsx` after description/vendor fields
  - Pre-fill category `<Select>` with suggestion + "AI suggested" `<Badge>` showing confidence %
- **Complexity:** Low · **Token cost:** Low (~50 tokens/call, claude-haiku) · **Impact:** High

---

#### 2. Monthly Spend Trend Chart (12-month Revenue vs. Expenses) ✅

**Description:** Real DB-backed monthly aggregation rendered as a 12-month line chart on the dashboard.

- **Backend:**
  - `GET /api/v1/dashboard/trends` — `extract('year')` + `extract('month')` grouping, trailing 12 months
  - No LLM, no migration needed
- **Frontend:**
  - `LineChart` (Recharts) on `frontend/src/app/page.tsx` — revenue (purple) vs expenses (light purple)
  - `getDashboardTrends()` in `frontend/src/lib/api.ts`
- **Complexity:** Low · **Token cost:** None · **Impact:** High

---

#### 3. Invoice Payment Reminder Drafts (AI-written) ✅

**Description:** For overdue/sent invoices, generate a polite payment reminder email draft at the click of a button.

- **Backend:**
  - `POST /api/v1/invoices/{id}/reminder-draft` → `{subject: str, body: str}`
  - `backend/app/services/ai_writer.py` — `chat()` call with sonnet, plain-text output enforced
- **Frontend:**
  - "Draft Reminder" button on invoice detail page when `status === "overdue" || "sent"`
  - Opens `<Dialog>` with editable subject/body + "Copy to clipboard" button
- **Complexity:** Low · **Token cost:** Low (~250 tokens/call, user-triggered) · **Impact:** High

---

#### 4. Receipt OCR — Image to Expense Pre-fill ✅

**Description:** User uploads a receipt image; LLM vision extracts amount, vendor, date, description and pre-fills the expense form.

- **Backend:**
  - `POST /api/v1/expenses/ocr` — `multipart/form-data` image upload
  - `backend/app/services/receipt_ocr.py` — `chat_vision()` → `{vendor, amount, date, description, suggested_category}`
  - `python-multipart>=0.0.9` required in `backend/requirements.txt`
- **Frontend:**
  - Drag-and-drop dropzone at the top of the new expense form
  - Spinner "Reading receipt…" → auto-populate all fields on response
- **Complexity:** Low-Med · **Token cost:** Med (~1000 image tokens, user-triggered) · **Impact:** High

---

### P1 — Should Have (Med complexity · manageable cost · high impact)

#### 5. Real Cash Flow Forecast (Statistical, No LLM) ✅

**Description:** 3-month forward projection using trailing 6-month exponential smoothing.

- **Backend:**
  - `GET /api/v1/forecast` — uses **6 complete historical months** (excludes current partial month to avoid 0-revenue distortion); exponential smoothing α=0.3; growth rate capped ±20%; returns `{projected_revenue, projected_expenses, projected_profit, confidence_band_low, confidence_band_high}` per month
- **Frontend:**
  - `/forecast` page — Recharts `AreaChart` with shaded purple confidence band; 3-month summary cards in INR
- **Complexity:** Med · **Token cost:** None · **Impact:** High
- **Known fix applied:** Original used `range(5,-1,-1)` which included the current partial month (0 paid revenue), causing -100% growth calculation. Fixed to `range(6,0,-1)`.

---

#### 6. Expense Anomaly Detection (Stats + LLM Explanation) ✅

**Description:** Automatically flag expenses that are statistical outliers (z-score > 2) within their category.

- **Backend:**
  - `backend/app/services/anomaly_detector.py` — `func.avg` + `func.stddev_pop` per category, flag > 2σ
  - `GET /api/v1/expenses/anomalies` → `[{expense, zscore, llm_explanation}]`
  - Single batched `chat()` call; cache result 1h in-memory; LLM failure returns anomalies without explanations
- **Frontend:**
  - "Anomalies" tab on expenses page using the rewritten `<Tabs>` component (React Context-based)
  - Amber `<Badge>` showing z-score; LLM explanation column
- **Complexity:** Med · **Token cost:** Low (~200 tokens batch, cached 1h) · **Impact:** High

---

#### 7. AI Monthly Financial Summary Report ✅

**Description:** Generate a plain-text executive summary: revenue vs. expenses, top cost drivers, profit trend, and 3 actionable recommendations.

- **Backend:**
  - `POST /api/v1/reports/monthly-summary` with `{year, month}` body
  - `backend/app/services/report_generator.py` — aggregate month data, `chat()` with sonnet; LLM prompted for plain text; backend strips markdown via regex
- **Frontend:**
  - `/reports` page — year/month selector; KPI cards; prose summary in `<pre-wrap>` div
- **Complexity:** Med · **Token cost:** Med (~1000 tokens, user-triggered once/month) · **Impact:** High

---

#### 8. Smart Invoice Line-Item Suggestions ✅

**Description:** After typing the first invoice line item, suggest 3 additional typical line items based on client history.

- **Backend:**
  - `POST /api/v1/invoices/suggest-items` — look up `InvoiceItem` history by `client_name`, `chat()` with haiku
  - Part of `backend/app/services/ai_writer.py`
- **Frontend:**
  - Suggestion chips below line items in the new invoice form — click to append
- **Complexity:** Med · **Token cost:** Low (~200 tokens, user-triggered) · **Impact:** Med-High

---

### P2 — Could Have (Higher complexity or cost · niche but differentiating)

#### 9. Natural Language Financial Q&A (Chat Interface) ✅

**Description:** Chat panel — users ask questions in plain English and get answers grounded in real DB data via LLM tool-use.

- **Backend:** `chat_messages` model + migration; `backend/app/services/nl_query.py` — `agentic_loop()` with 4 DB query tools in OpenAI tool format; `POST /api/v1/chat`; `GET /api/v1/chat/history`
- **Frontend:** `/chat` page — message bubbles, persisted history, suggestion prompts, Enter-to-send
- **Complexity:** High · **Token cost:** Med-High (tool-use rounds) · **Impact:** High
- **Implementation note:** Uses synchronous tool-use loop (not SSE streaming). Upgrade to `StreamingResponse` if latency becomes an issue.

---

#### 10. Budget Planning with AI Guardrails ✅

**Description:** Set monthly category budgets; AI flags over-budget categories at ≥80% utilization and suggests one cut action per breach.

- **Backend:** `Budget` model + migration + CRUD; `POST /api/v1/budgets` is **upsert** (create-or-update, no 409); `GET /api/v1/budgets/status` computes utilization; `chat()` only triggered on breach
- **Frontend:** `/budgets` page — progress bars per category; **inline edit** on each card; top form pre-fills existing limit when selecting a category that already has a budget
- **Complexity:** Med-High · **Token cost:** Low (conditional, breach-only) · **Impact:** Med

---

#### 11. Client Profitability Scoring ✅

**Description:** Score each client by revenue and outstanding balance. Surface a ranked table with an AI insight per top/bottom client.

- **Backend:** `GET /api/v1/clients/profitability` — aggregates invoices using `case()` expression (SQLAlchemy 2.0 compatible); composite score = revenue 70% + outstanding 30%; batched `chat()` for insights; 24h in-memory cache; `try/except` wraps AI call so endpoint never fails
- **Frontend:** `/clients` page — ranked table with score badge (green/amber/red); expandable AI insight row on click
- **Complexity:** Med · **Token cost:** Low-Med (batched, cached 24h) · **Impact:** Med

---

## Post-v1.2 Fixes & Improvements Applied

These issues were discovered and fixed after the initial v1.2 implementation:

| Issue | Fix |
|-------|-----|
| OpenRouter API key returns HTML instead of JSON | Rewrote `llm_client.py` to use OpenAI SDK for OpenRouter (which uses OpenAI-format API), Anthropic SDK for direct Anthropic. Old code sent `x-api-key` header; OpenRouter requires `Authorization: Bearer`. |
| Forecast shows 0 revenue for future months | `finance.py` included current partial month (0 paid invoices) in trailing history. Fixed to use 6 complete past months (`range(6,0,-1)`). Growth rate capped at ±20%. |
| Reports output shows `***text***` markdown | Prompted LLM for plain text; backend strips markdown with `re.sub`. |
| Clients endpoint crashes (500) | `func.cast(..., func.Integer())` invalid in SQLAlchemy 2.0. Replaced with `case((Invoice.status == "paid", Invoice.total), else_=0)`. AI call now wrapped in `try/except`. |
| Budget category Select shows no options | `select.tsx` was a native `<select>` that ignored `<div>`-based `SelectItem` children. Rewritten as custom dropdown using React Context with label registration and absolute-positioned `SelectContent`. |
| Budget POST returns 409 on update | Changed `POST /budgets` to upsert semantics — updates limit if budget already exists for category/month. |
| Tabs component doesn't support controlled `value` prop | Rewritten using React Context to support both controlled and uncontrolled modes. |
| `globals.css` `@import "./types.css"` causes PostCSS build error | `types.css` processed in isolation by webpack without `@tailwind components` context. Fixed by inlining content directly into `globals.css` and deleting the separate file. |
| `backend/Dockerfile` references missing `pyproject.toml` | Fixed to use `pip install -r requirements.txt`. |
| All amounts displayed in dollars | Added `formatINR()` and `inrAxisTick()` to `src/lib/utils.ts`; updated all pages. Threshold: ≥₹1Cr → "₹X.XX Cr", ≥₹10L → "₹X.X L", ≥₹1L → "₹X.XX L". |

---

## v2.0 Candidate Backlog

Features not yet implemented but validated as high-value:

- [ ] **Streaming SSE chat** — replace synchronous tool-use loop with `StreamingResponse` for real-time NL responses
- [ ] **Multi-currency support** — USD/EUR/INR with real-time FX rates; currency-aware P&L
- [ ] **Tally / QuickBooks export** — one-click export to Indian and global accounting software
- [ ] **Investor-grade board pack** — auto-generated monthly PDF with variance analysis
- [ ] **Invoice PDF download** — generate actual PDF invoice using WeasyPrint or Puppeteer
- [ ] **Email sending** — integrate SendGrid/SES to actually send reminder drafts
- [ ] **Role-based access control** — multi-user with viewer/editor/admin roles
- [ ] **Audit log** — append-only log of all financial record changes

---

## Implementation Priority (for next agent)

Start from the top of the v2.0 backlog; all v1.2 items are complete.
