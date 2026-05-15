# DClaw Finance — v1.2 Build Summary

## Overview

All 11 features from `PLAN-v1.2.md` implemented and deployed. Full frontend redesign applied to the
One Convergence design system (purple `#7030A0` · white · Manrope/Inter/JetBrains Mono). Realistic
INR demo data seeded. Slide deck (15 slides) and infographic (single tall page) produced as PDFs.

**LLM stack:** `claude-haiku-4-5` for fast/cheap tasks · `claude-sonnet-4-6` for reports and chat.  
**AI provider:** OpenRouter (primary) or Anthropic direct — swapped transparently via `llm_client.py`.  
**All AI endpoints:** support `?dry_run=true` for UI development without token costs.

---

## Deployment Checklist

```bash
# 1. Set AI provider key in .env (ONE of these — OpenRouter takes priority)
OPENROUTER_API_KEY=sk-or-v1-...   # https://openrouter.ai/keys
ANTHROPIC_API_KEY=sk-ant-...       # https://console.anthropic.com/

# 2. Build and start
docker compose up -d --build

# 3. Run migrations (first time only)
docker compose exec backend alembic upgrade head

# 4. Seed demo data
pip install httpx
python scripts/seed_data.py
```

---

## Backend Changes

### Dependencies (`backend/requirements.txt`)
- `anthropic>=0.25.0` — Anthropic Python SDK (used when ANTHROPIC_API_KEY is set)
- `openai>=1.0.0` — OpenAI SDK (used when OPENROUTER_API_KEY is set, pointing to OpenRouter)
- `python-multipart>=0.0.9` — multipart form uploads for receipt OCR

### Config (`backend/app/core/config.py`)
- Added `anthropic_api_key: str = ""` — reads `ANTHROPIC_API_KEY` from `.env`
- Added `openrouter_api_key: str = ""` — reads `OPENROUTER_API_KEY` from `.env`

### `backend/Dockerfile`
- **Fixed:** was referencing `pyproject.toml` (removed from project). Now uses `pip install -r requirements.txt`.

### New LLM Client Factory (`backend/app/services/llm_client.py`)
Unified abstraction over both AI providers. Services never import `anthropic` or `openai` directly.

| Function | Purpose |
|----------|---------|
| `chat(prompt, model, max_tokens, system)` | Simple text completion |
| `chat_vision(prompt, image_bytes, media_type, model)` | Vision/OCR completion |
| `agentic_loop(user_message, tools, tool_executor, model)` | Tool-use loop for NL chat |

Provider selection: `OPENROUTER_API_KEY` → OpenAI SDK → `https://openrouter.ai/api/v1`.
Fallback: `ANTHROPIC_API_KEY` → Anthropic SDK → `https://api.anthropic.com`.
Model names auto-prefixed with `anthropic/` for OpenRouter (e.g. `claude-haiku-4-5` → `anthropic/claude-haiku-4-5`).

### New Models
| File | Table | Columns |
|------|-------|---------|
| `models/budget.py` | `budgets` | `id, category, monthly_limit, year, month, created_at, updated_at` |
| `models/chat_message.py` | `chat_messages` | `id, role, content, created_at` |

### Model Updates
| File | Change |
|------|--------|
| `models/expense.py` | Added `ai_suggested_category: Mapped[str | None]` |

### New Repositories
| File | Purpose |
|------|---------|
| `repositories/budget_repo.py` | Budget CRUD + `get_by_category_month` upsert lookup |
| `repositories/chat_repo.py` | Chat message create + list recent 50 |

### New Services (`backend/app/services/`)
| File | Model | Purpose |
|------|-------|---------|
| `ai_categorizer.py` | claude-haiku-4-5 | vendor + description → `{suggested_category, confidence}` |
| `ai_writer.py` | haiku (suggestions) / sonnet (reminders) | Reminder drafts + invoice line-item suggestions |
| `receipt_ocr.py` | claude-haiku-4-5 vision | Base64 image → `{vendor, amount, date, description, suggested_category}` |
| `anomaly_detector.py` | claude-haiku-4-5 | z-score > 2 per category; batched LLM explanations; 1h in-memory cache |
| `report_generator.py` | claude-sonnet-4-6 | Monthly aggregate data → plain-text executive summary; markdown stripped |
| `nl_query.py` | claude-sonnet-4-6 | Agentic tool-use loop; 4 DB query tools in OpenAI tool format |

### Updated API Endpoints

**`api/v1/expenses.py`**
- `POST /api/v1/expenses/categorize` — `{description, vendor}` → `{suggested_category, confidence}`
- `POST /api/v1/expenses/ocr` — multipart image → extracted fields
- `GET  /api/v1/expenses/anomalies` — outliers with LLM explanations (1h cache)

**`api/v1/invoices.py`**
- `POST /api/v1/invoices/{id}/reminder-draft` — AI email draft (sent/overdue invoices only)
- `POST /api/v1/invoices/suggest-items` — `{client_name, first_item}` → 3 suggestions

**`api/v1/dashboard.py`**
- `GET /api/v1/dashboard/trends` — trailing 12-month `{month, revenue, expenses}` array

**`api/v1/finance.py`** — rewritten:
- `GET /api/v1/forecast` — uses 6 **complete** historical months (excludes current partial month); exponential smoothing α=0.3; growth rate capped ±20%; returns 3-month projection with confidence bands

**`api/v1/budgets.py`** — upsert semantics:
- `POST /api/v1/budgets` — **create-or-update** (no longer returns 409 on duplicate; updates limit if budget exists)
- `GET  /api/v1/budgets/status` — per-category utilization; AI breach suggestions only when ≥80%

**`api/v1/clients.py`** — bug fixes:
- `func.cast(... , func.Integer())` replaced with `case((Invoice.status == "paid", Invoice.total), else_=0)` (SQLAlchemy 2.0 compatibility)
- AI call wrapped in `try/except` — endpoint returns data even when LLM is unavailable

**`api/v1/anomaly_detector.py` / `api/v1/budgets.py`**
- All AI calls wrapped in `try/except` — features degrade gracefully without crashing the endpoint

### New API Routers
| File | Prefix | Key Endpoints |
|------|--------|---------------|
| `api/v1/reports.py` | `/api/v1/reports` | `POST /monthly-summary` |
| `api/v1/clients.py` | `/api/v1/clients` | `GET /profitability` (24h cache) |
| `api/v1/budgets.py` | `/api/v1/budgets` | Full CRUD + `GET /status` |
| `api/v1/chat.py`   | `/api/v1/chat`    | `POST /` · `GET /history` |

### Migration
- `alembic/versions/b2c4d6e8a1f3_v1_2_features.py`
  - `ALTER TABLE expenses ADD COLUMN ai_suggested_category VARCHAR(50)`
  - `CREATE TABLE budgets`
  - `CREATE TABLE chat_messages`

---

## Frontend Changes

### Design System — One Convergence Vol. 01
Full redesign applied across all pages and components:

| Token | Value | Usage |
|-------|-------|-------|
| Primary purple | `#7030A0` | Buttons, accents, borders |
| Light purple | `#B180F8` | Hover states, chart lines |
| Dark purple | `#4A1F6C` | Deep accents |
| Ink | `#141414` | Text, dark backgrounds |
| Paper | `#FFFFFF` | Card backgrounds |
| Cool | `#F6F5F7` | Page background |
| Fonts | Manrope (display) · Inter (body) · JetBrains Mono (labels) | Loaded via CSS `@import` |
| Radius | `rounded-full` buttons · `rounded-[10px]` cards | Pill CTAs, soft cards |

**`globals.css`** — OC design tokens + `types.css` content inlined (removed separate file to fix PostCSS build error).  
**`components/ui/button.tsx`** — pill-shaped (`rounded-full`), purple fill, light-purple hover.  
**`components/ui/card.tsx`** — white background, `box-shadow: 0px 2px 15px rgba(0,0,0,0.08)`, 10px radius.  
**`components/ui/badge.tsx`** — purple default, rounded-full.  
**`components/ui/select.tsx`** — **full rewrite** as custom dropdown using React Context (`Ctx`). Previous native `<select>` approach rendered `SelectItem` divs as invisible options. New version: absolute-positioned `SelectContent`, `useLayoutEffect` label registration, outside-click handler.  
**`components/ui/tabs.tsx`** — **full rewrite** using React Context to support controlled `value` + `onValueChange` props (required by anomalies tab).  
**`app/layout.tsx`** — OC navbar: white background, purple brand wordmark, ink nav links with purple underline on hover, purple pill "Ask AI" CTA. Google Fonts loaded via CSS (avoids Next.js build timeout inside Docker).

### INR Currency Formatting
All amount displays converted from `$X.XX` to Indian Rupees with auto-scaling:

```typescript
// src/lib/utils.ts
formatINR(amount):
  ≥ ₹1,00,00,000  →  "₹X.XX Cr"   (crores)
  ≥ ₹10,00,000    →  "₹X.X L"     (lakhs, 1 decimal)
  ≥ ₹1,00,000     →  "₹X.XX L"    (lakhs, 2 decimal)
  < ₹1,00,000     →  "₹X,XXX"     (Indian grouping)

inrAxisTick(v):   compact form for Recharts Y-axes (₹XCr / ₹XL / ₹XK)
```

### API Client (`src/lib/api.ts`)
- `API_BASE` reads from `NEXT_PUBLIC_API_URL` (baked at build time via Docker ARG)
- New types: `TrendPoint`, `ForecastPoint`, `AnomalyItem`, `ClientScore`, `BudgetStatus`, `Budget`, `ChatMessage`
- All new API functions documented in `api.ts`

### Updated Pages
| File | Changes |
|------|---------|
| `app/page.tsx` | OC KPI cards with colored top stripe; 12-month LineChart; INR formatting throughout |
| `app/layout.tsx` | OC navbar design; 8 nav links including Ask AI |
| `app/expenses/new/page.tsx` | Receipt OCR dropzone; 600ms debounce categorization; "AI suggested" badge |
| `app/expenses/page.tsx` | Anomalies tab (fixed Tabs component); INR amounts |
| `app/invoices/page.tsx` | INR total column |
| `app/invoices/[id]/page.tsx` | Draft Reminder dialog; INR amounts |
| `app/invoices/new/page.tsx` | AI line-item suggestion chips |
| `app/forecast/page.tsx` | All amounts in INR (Cr/L); purple OC colors on chart |
| `app/reports/page.tsx` | INR amounts; plain-text AI summary display |
| `app/budgets/page.tsx` | **Inline edit** on each card; top form pre-fills when category has existing budget; "Add Budget" → "Update Budget" label swap; live INR preview while typing |
| `app/clients/page.tsx` | INR in crores for large revenues; fixed `₹0` zero display |

### New Pages
| File | Route | Feature |
|------|-------|---------|
| `app/forecast/page.tsx` | `/forecast` | AreaChart with purple confidence band; 3-month summary cards |
| `app/reports/page.tsx` | `/reports` | Month selector; KPI cards; AI executive summary |
| `app/budgets/page.tsx` | `/budgets` | Progress bars; inline edit; AI breach suggestions |
| `app/clients/page.tsx` | `/clients` | Ranked table; score badges; expandable AI insight |
| `app/chat/page.tsx` | `/chat` | Chat bubbles; history; suggestion prompts; Enter-to-send |

---

## Docker / Infrastructure Changes

| File | Change |
|------|--------|
| `backend/Dockerfile` | Replaced `uv + pyproject.toml` install with `pip install -r requirements.txt` |
| `docker-compose.yml` | Added `env_file: - .env` to backend service (passes `OPENROUTER_API_KEY` etc.) |
| `docker-compose.yml` | Postgres host port changed `5433 → 5434` (5433 was occupied by another service) |
| `frontend/src/app/globals.css` | `@import "./types.css"` removed; content inlined to fix PostCSS `@layer components` build error |

---

## Demo Data

See `DEMO-DATA.md` for full details. Key figures post-seeding:

| Metric | Value |
|--------|-------|
| Annual paid revenue | ₹39.05 Cr |
| Annual expenses | ₹29.41 Cr |
| Net profit | ₹9.64 Cr |
| Net margin | 24.7% |
| Invoices | 50 (42 paid · 4 sent · 2 overdue · 2 draft) |
| Expense entries | 207 across 13 months |
| Clients | 12 enterprise accounts |
| Budgets (May 2026) | 6 categories · all utilization 70–78% |

Seed script: `python scripts/seed_data.py [--reset] [--dry-run]`

---

## Deliverables (Slides & Infographic)

| File | Description |
|------|-------------|
| `slides/DClaw-Finance-Deck.pdf` | 15-slide presentation · 1280×720px per slide · OC design system |
| `slides/dclaw-finance-deck.html` | Source HTML for the slide deck |
| `infographics/DClaw-Finance-Infographic.pdf` | Single tall infographic · 900×3900pts · 8 sections |
| `infographics/dclaw-finance-infograph.html` | Source HTML for the infographic |

Both rendered via `google-chrome --headless=new --print-to-pdf`.

---

## Architecture Notes

- All LLM calls isolated to `backend/app/services/` — no AI logic in routers or repositories.
- `llm_client.py` is the only file that imports `anthropic` or `openai`. Swap providers by changing the env key, no service code changes needed.
- Caching: anomaly results 1h in-memory · client profitability 24h in-memory · both clear on backend restart.
- NL chat uses synchronous tool-use loop. Upgrade to `StreamingResponse` + SSE if response latency exceeds acceptable threshold.
- `?dry_run=true` supported on all AI endpoints.
- Reports: LLM prompted for plain text; backend also strips markdown with `re.sub(r"\*{1,3}(.+?)\*{1,3}", r"\1", raw)`.
