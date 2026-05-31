# DClaw Finance

AI-augmented financial management for Indian SaaS founders. Invoice, track expenses, forecast cash flow, and ask your numbers questions in plain English — all in INR.

**Live demo:** https://dclaw-finance.vercel.app  
**API docs:** http://localhost:8096/docs (after `docker compose up`)

---

## What's Inside

| Area | Features |
|------|---------|
| **Invoicing** | CRUD, line items, status lifecycle, AI payment reminder drafts |
| **Expenses** | CRUD, receipt OCR (drag-and-drop), AI auto-categorisation, anomaly detection |
| **Cash Flow** | 13-week rolling projection, top-3 optimization levers |
| **Forecast** | 3-month projection, 5-scenario model, 3-statement, sensitivity analysis |
| **Reports** | AI-generated monthly executive summary (sonnet-4-6) |
| **Budgets** | Per-category monthly budgets, utilisation progress bars, AI breach suggestions |
| **Clients** | Profitability scoring, AI insight per client |
| **Ask AI** | Natural language Q&A grounded in real DB data via tool-use |

All amounts are displayed in Indian Rupees (₹) — crores and lakhs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ · App Router · Tailwind CSS · shadcn/ui components |
| Backend | FastAPI · Pydantic v2 · SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 |
| AI | Claude claude-haiku-4-5 (categorisation, OCR) · claude-sonnet-4-6 (reports, chat) |
| AI provider | OpenRouter (primary) · Anthropic direct (fallback) · Ollama (local fallback) |
| Deployment | Docker + docker-compose (local/K8s) · Vercel (cloud frontend) |
| K8s | Helm chart in `helm/` |

---

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone https://github.com/dclawstack/dclaw-finance.git
cd dclaw-finance
cp .env.example .env
```

Edit `.env` — set at least one AI key:

```bash
# Option A: OpenRouter (priority)
OPENROUTER_API_KEY=your-key-here

# Option B: Anthropic direct
ANTHROPIC_API_KEY=your-key-here
```

Get keys: [openrouter.ai/keys](https://openrouter.ai/keys) · [console.anthropic.com](https://console.anthropic.com/)

### 2. Start services

```bash
docker compose up --build -d
```

### 3. Run migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. (Optional) Seed demo data

```bash
docker compose exec backend python scripts/seed_data.py
```

Seeds 50 invoices + 207 expenses + 6 budgets for "Meridian AI Technologies".

### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3007 |
| Backend API | http://localhost:8096 |
| Swagger docs | http://localhost:8096/docs |
| PostgreSQL | `localhost:5434` (user: `postgres`, pw: `postgres`, db: `dclaw_finance`) |

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start local Postgres first, then:
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_finance \
  uvicorn app.api.main:app --reload --port 8096
```

Run migrations:
```bash
alembic upgrade head
```

Run tests:
```bash
pytest backend/tests/ -v
```

### Frontend (Docker deployment — `frontend/`)

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8096 npm run dev
# → http://localhost:3007
```

### Frontend (Vercel deployment — `web/`)

```bash
cd web
npm install
NEXT_PUBLIC_API_URL=http://localhost:8096 npm run dev
# → http://localhost:3000 (or next free port)
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL asyncpg URL |
| `OPENROUTER_API_KEY` | One of | OpenRouter key — takes priority over Anthropic |
| `ANTHROPIC_API_KEY` | One of | Anthropic direct key |
| `OLLAMA_URL` | No | Local Ollama URL (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | No | Ollama model name (default: `llama3.1`) |
| `OPENROUTER_MODEL` | No | Override OpenRouter model |
| `LOGTO_ENDPOINT` | No | Logto tenant URL — leave empty to skip JWT auth in dev |
| `LOGTO_RESOURCE` | No | Logto API resource identifier |
| `NEXT_PUBLIC_API_URL` | Yes (frontend) | Backend URL baked at build time |
| `APP_ENV` | No | `development` or `production` (default: `development`) |

---

## API Reference

All endpoints prefixed with `/api/v1`. Full interactive docs at `/docs`.

```
GET  /health                         → {"status": "ok"}

# Dashboard
GET  /api/v1/dashboard               → KPI summary
GET  /api/v1/dashboard/trends        → 12-month revenue vs expenses

# Invoices
GET|POST /api/v1/invoices
GET|PUT|DELETE /api/v1/invoices/{id}
POST /api/v1/invoices/{id}/items
PUT|DELETE /api/v1/invoices/{id}/items/{item_id}
POST /api/v1/invoices/{id}/reminder-draft   → AI email draft
POST /api/v1/invoices/suggest-items         → AI line-item suggestions

# Expenses
GET|POST /api/v1/expenses
GET|PUT|DELETE /api/v1/expenses/{id}
POST /api/v1/expenses/categorize     → AI category suggestion
POST /api/v1/expenses/ocr            → Receipt → pre-filled form fields
GET  /api/v1/expenses/anomalies      → Z-score outliers + LLM explanations

# Forecast  (statistical, no LLM)
GET  /api/v1/forecast                → 3-month projection + confidence band
GET  /api/v1/forecast/mape           → Forecast accuracy vs actuals
GET  /api/v1/forecast/scenarios      → 5 scenarios (base/bull/bear/high_growth/conservative)
GET  /api/v1/forecast/drivers        → Business drivers (clients, win rate, deal size)
GET  /api/v1/forecast/sensitivity    → 4-point revenue/expense sensitivity
GET  /api/v1/forecast/three-statement → Income + cash flow + balance sheet

# Cash Flow  (statistical, no LLM)
GET  /api/v1/cash-flow/13-week       → 13-week weekly cash projection
GET  /api/v1/cash-flow/optimization  → Top-3 spend reduction levers

# Reports
POST /api/v1/reports/monthly-summary → AI executive summary {year, month}

# Clients
GET  /api/v1/clients/profitability   → Ranked table + AI insights (24h cache)

# Budgets
GET|POST /api/v1/budgets             → POST is upsert
PUT|DELETE /api/v1/budgets/{id}
GET  /api/v1/budgets/status          → Utilisation + AI suggestions

# Chat
POST /api/v1/chat                    → NL message (tool-use agent)
GET  /api/v1/chat/history            → Last 50 messages
```

---

## AI Architecture

All LLM calls go through `backend/app/services/llm_client.py`. Services never import `anthropic` or `openai` directly.

**Provider selection order:**
1. `OPENROUTER_API_KEY` → OpenAI SDK → `https://openrouter.ai/api/v1`
2. `ANTHROPIC_API_KEY` → Anthropic SDK → `https://api.anthropic.com`
3. `OLLAMA_URL` → Ollama (local, for dev)

**Cost controls:**
- `?dry_run=true` on any AI endpoint returns mock data (zero token spend)
- `ai_suggested_category` DB column caches categorisation results per expense
- Anomaly explanations cached 1h in-memory; client insights cached 24h
- All AI calls wrapped in `try/except` — endpoints always return data even if LLM is down

---

## Project Structure

```
dclaw-finance/
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py       App factory, middleware, router wiring
│   │   │   ├── routes/       health.py
│   │   │   └── v1/           invoices, expenses, finance (forecast),
│   │   │                     cash_flow, dashboard, reports, clients,
│   │   │                     budgets, chat, demo
│   │   ├── core/             config.py, database.py, auth.py
│   │   ├── models/           SQLAlchemy models (Invoice, Expense, Budget, ChatMessage)
│   │   ├── repositories/     DB access layer
│   │   ├── schemas/          Pydantic request/response schemas
│   │   └── services/         llm_client, ai_categorizer, ai_writer,
│   │                         receipt_ocr, anomaly_detector,
│   │                         report_generator, nl_query
│   ├── alembic/              Database migrations
│   ├── tests/                pytest-asyncio test suite
│   └── requirements.txt
│
├── frontend/                 Next.js app (Docker / local dev)
├── web/                      Next.js app (Vercel-deployed)
│   └── src/app/
│       ├── page.tsx          Landing page
│       ├── dashboard/        KPI cards, charts
│       ├── invoices/         List, new, [id] detail
│       ├── expenses/         List+anomalies, new (with OCR)
│       ├── forecast/         3-month projection
│       ├── cash-flow/        13-week + optimization levers
│       ├── reports/          AI monthly summary
│       ├── budgets/          Per-category budgets
│       ├── clients/          Profitability ranking
│       └── chat/             NL Q&A interface
│
├── helm/                     Kubernetes Helm chart
├── docs/                     Getting started, reference, guides, changelog
├── scripts/                  seed_data.py
├── infographics/             Architecture and workflow diagrams
├── slides/                   Presentation deck content
├── PLAN-v1.4.md              Current roadmap and implementation plan
├── PRODUCT-SPEC.md           Domain models, API spec, screen specs
├── REVISED-PRD.md            Product requirements document
└── docker-compose.yml        Local development stack
```

---

## Ports

| Service | Port |
|---------|------|
| Frontend (Docker) | 3007 |
| Backend (API) | 8096 |
| PostgreSQL (Docker) | 5434 (host) → 5432 (container) |

---

## Deployment

### Vercel (frontend / `web/`)

```bash
cd web
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` in Vercel project environment variables to your deployed backend URL.

### Kubernetes (full stack)

```bash
helm install dclaw-finance ./helm -f helm/values.yaml
```

Requires: CloudNativePG operator, a PostgreSQL cluster, and K8s Secrets for `OPENROUTER_API_KEY`.

---

## What's Next

See `PLAN-v1.4.md` for the full roadmap. Current priorities:

1. **Bug Sprint** — 6 product bugs to fix before new features (B1–B6)
2. **Security hardening** — auth rate limiting, observability (S1–S7)
3. **Multi-tenancy + auth** — per-company data isolation, JWT login
4. **GST compliance** — GSTR-1 generation, GSTR-2B reconciliation, IRN

---

## Contributing

Stack is locked. See `AGENTS.md` for architecture constraints and anti-patterns before writing code.
