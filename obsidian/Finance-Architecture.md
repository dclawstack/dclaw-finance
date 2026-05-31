# DClaw Finance — Architecture Reference

> Stack is locked. See `AGENTS.md` for the full anti-pattern table.
> Last updated: May 2026 · **v1.4**

---

## Ports & Identity

| Item | Value |
|---|---|
| Backend | FastAPI on port **8096** |
| Frontend (Docker) | Next.js `frontend/` on port **3007** |
| Frontend (Vercel) | Next.js `web/` — production Vercel app |
| Database | PostgreSQL `dclaw_finance` · host port **5434** |
| Base API path | `/api/v1` |
| Local app URL | http://localhost:3007 |
| API docs | http://localhost:8096/docs |
| Vercel prod URL | https://dclaw-finance-q5sakx56m-chandraja-s-projects.vercel.app |

> [!warning] Port 5433 is occupied on this machine — postgres binds to **5434** in docker-compose.yml.

---

## Dual Frontend Deployment

| Directory | Purpose | Deploy target |
|---|---|---|
| `frontend/` | Docker-deployed Next.js (local / K8s) | `docker compose up` |
| `web/` | Vercel-native Next.js (consolidated cloud app) | `vercel --prod` from repo root |

Both share the same backend and route structure. `web/` is the canonical production app as of v1.4.

---

## Stack (Locked)

**Backend**
- FastAPI with `lifespan` handler
- SQLAlchemy 2.0 — `DeclarativeBase` from `app.models.base`
- Pydantic v2 with `ConfigDict(from_attributes=True)`
- Async: `create_async_engine` + `AsyncSession`
- Repository pattern — all DB access in `app/repositories/`
- DI: `Depends(get_db)` — never manual `AsyncSession`

**Frontend**
- Next.js 14+ App Router
- Tailwind CSS + shadcn/ui-style custom components
- API client in `src/lib/api.ts` — typed fetch wrapper
- `NEXT_PUBLIC_API_URL` baked at Docker build time via `ARG`
- Google Fonts loaded via CSS `@import` (not `next/font` — causes build timeout in Docker)

**Docker**
- Backend: `python:3.11-slim`, non-root `appuser`, `pip install -r requirements.txt`
- Frontend: `node:20-alpine`, port 3007, multi-stage build
- Postgres: `postgres:16-alpine`
- Healthcheck backend: `python urllib.request.urlopen()` (never curl — not installed)
- Healthcheck frontend: `wget -q --spider`
- `env_file: - .env` on backend service — passes `OPENROUTER_API_KEY` etc.

---

## AI Layer

All LLM calls go through the unified factory at `backend/app/services/llm_client.py`.

| Function | Use case |
|---|---|
| `chat(prompt, model, max_tokens, system)` | Simple text completion |
| `chat_vision(prompt, image_bytes, media_type, model)` | Receipt OCR / vision |
| `agentic_loop(user_message, tools, tool_executor, model)` | NL chat tool-use |

**Provider selection** (checked in order):
1. `OPENROUTER_API_KEY` set → OpenAI SDK → `https://openrouter.ai/api/v1` · models prefixed `anthropic/`
2. `ANTHROPIC_API_KEY` set → Anthropic SDK → `https://api.anthropic.com`
3. `OLLAMA_URL` set → Ollama (local) → `OLLAMA_MODEL` (default: `llama3.1`)
4. None set → `RuntimeError` at call time

**Model tiers:**
- `claude-haiku-4-5` → categorisation, OCR, suggestions, anomaly explanations (cheap/fast)
- `claude-sonnet-4-6` → reports, NL chat, reminder drafts (better reasoning)

**Rules:**
- Services never import `anthropic` or `openai` directly — always use `llm_client`
- All AI calls wrapped in `try/except` — endpoints return data without AI if LLM fails
- Prompt for plain text output; backend strips markdown with `re.sub(r"\*{1,3}(.+?)\*{1,3}", ...)`
- All AI endpoints accept `?dry_run=true` for mock response without token spend

---

## Data Models (v1.4)

| Model | Table | Key columns |
|---|---|---|
| `Invoice` | `invoices` | status enum, subtotal/tax/total, items relationship |
| `InvoiceItem` | `invoice_items` | FK → Invoice (CASCADE), quantity × unit_price = amount |
| `Expense` | `expenses` | category enum, **`ai_suggested_category`** (nullable, cached LLM result) |
| `Budget` | `budgets` | category, monthly_limit, year, month — unique per (category, year, month); POST = upsert |
| `ChatMessage` | `chat_messages` | role ["user","assistant"], content |

**Migrations:**
- `ea63ff03f4e3` — baseline (Invoice, InvoiceItem, Expense)
- `b2c4d6e8a1f3` — v1.2 (adds `ai_suggested_category`, `budgets`, `chat_messages`)

---

## Model Rules

- Inherit from `Base` in `app.models.base`
- Use `Mapped[...]` and `mapped_column()` — never `Column()`
- Use `default=` not `default_factory=` in `mapped_column()`
- Relationships: `lazy="selectin"`
- Child FK: `ondelete="CASCADE"`
- Optional FK: `ondelete="SET NULL"`
- Every new table → new alembic migration

---

## Key Anti-Patterns (Never Do)

| Bad | Good | Why |
|---|---|---|
| `declarative_base()` in database.py | `from app.models.base import Base` | Separate metadata → zero tables created |
| `curl` in healthcheck | `python urllib.request.urlopen(...)` | curl not installed in slim image |
| In-memory `MOCK_*` dicts | Real repository + DB | Data lost on restart |
| Missing `ARG NEXT_PUBLIC_API_URL` | Add before `RUN npm run build` | Wrong URL baked into bundle |
| Hardcoded `localhost:PORT` | `process.env.NEXT_PUBLIC_API_URL` | Breaks in Docker/K8s |
| `default_factory=` in `mapped_column()` | `default=` | SA2 incompatibility |
| No alembic migration | `alembic revision --autogenerate` | Schema drift |
| `pyproject.toml` in Dockerfile | `pip install -r requirements.txt` | pyproject.toml was deleted |
| `@import "./types.css"` after `@tailwind` | Inline content into globals.css | Webpack processes imported CSS files in isolation |
| `func.cast(expr, func.Integer())` | `case((condition, value), else_=0)` | `func.Integer()` is invalid SA2 type argument |
| Direct `anthropic`/`openai` SDK in services | Use `llm_client.chat()` etc. | Provider-locked; can't swap to OpenRouter |
| `@lru_cache` on `_fetch_jwks()` | TTL-based dict cache | lru_cache never expires — breaks on JWKS key rotation |
| Module-level mutable dict for cache | `asyncio.Lock` or Redis | Race conditions under async + pytest-xdist |

---

## API Surface (v1.4 — Complete)

```
Health:     GET  /health

Dashboard:  GET  /api/v1/dashboard
            GET  /api/v1/dashboard/trends

Invoices:   CRUD (5 routes) + items CRUD (3 routes)
            POST /api/v1/invoices/{id}/reminder-draft   ← AI
            POST /api/v1/invoices/suggest-items          ← AI

Expenses:   CRUD (5 routes)
            POST /api/v1/expenses/categorize             ← AI
            POST /api/v1/expenses/ocr                    ← AI (vision)
            GET  /api/v1/expenses/anomalies              ← AI (batched, 1h cache)

Forecast:   GET  /api/v1/forecast                       ← 3-month projection
            GET  /api/v1/forecast/mape                   ← accuracy vs actuals
            GET  /api/v1/forecast/scenarios              ← 5 variants
            GET  /api/v1/forecast/drivers                ← business drivers
            GET  /api/v1/forecast/sensitivity            ← 4-point sensitivity
            GET  /api/v1/forecast/three-statement        ← IS + CF + BS

Cash Flow:  GET  /api/v1/cash-flow/13-week              ← 13-week weekly projection
            GET  /api/v1/cash-flow/optimization          ← top-3 reduction levers

Reports:    POST /api/v1/reports/monthly-summary         ← AI (sonnet)

Clients:    GET  /api/v1/clients/profitability           ← AI (batched, 24h cache)

Budgets:    GET|POST /api/v1/budgets  (POST = upsert)
            PUT|DELETE /api/v1/budgets/{id}
            GET  /api/v1/budgets/status                  ← AI breach suggestions

Chat:       POST /api/v1/chat                            ← AI (tool-use)
            GET  /api/v1/chat/history
```

---

## Frontend Routes (v1.4)

| Route | Page | Key feature |
|---|---|---|
| `/` | Landing | Marketing page, AI feature grid, Roadmap section |
| `/dashboard` | Dashboard | KPI cards, 12-month trend, overdue list |
| `/invoices` | Invoice list | Status filter, search |
| `/invoices/new` | New invoice | AI line-item suggestions |
| `/invoices/[id]` | Invoice detail | AI reminder draft button |
| `/expenses` | Expense list + Anomalies tab | Clickable anomaly rows |
| `/expenses/new` | New expense | OCR dropzone + AI categorisation |
| `/cash-flow` | Cash Flow | 13-week chart + 3 optimisation levers |
| `/forecast` | Forecast | 3-month projection + confidence band |
| `/reports` | Reports | AI monthly executive summary |
| `/budgets` | Budgets | Per-category cards + AI breach suggestions |
| `/clients` | Clients | Profitability ranking + AI insight |
| `/clients/profitability` | → redirects to `/clients` | Redirect page |
| `/chat` | Ask AI | NL Q&A with tool-use |

---

## Testing Requirements

- Every repository → tests in `backend/tests/`
- Every endpoint → covered (NB: forecast sub-endpoints `/mape`, `/scenarios`, `/drivers`, `/sensitivity`, `/three-statement` currently have zero coverage — see S4 in [[Finance-v1.4-Roadmap]])
- `pytest-asyncio` with async functions
- `httpx.AsyncClient` + `ASGITransport`
- Override `get_db` with test session
- AI endpoints: use `?dry_run=true` or mock `llm_client` in tests

---

## Auth (Current State)

> [!warning] Auth is currently dev-only. In production with `LOGTO_ENDPOINT` set, JWT validation runs on all `/api/v1/*` routes via `require_auth` dependency. Without it, all endpoints are open.

Known issues (see [[Finance-v1.4-Roadmap]] S1–S2):
- `_fetch_jwks()` uses `@lru_cache` with no TTL — breaks on JWKS key rotation
- No per-IP rate limiting on failed auth attempts
- Dev-mode bypass (`return {}`) risks accidental production exposure

---

## Related Notes

- [[Finance-Design-System]] — OC design tokens, components, INR formatting
- [[Finance-v1.4-Roadmap]] — current feature status, open bugs, implementation plan
- [[Finance-TestSprite-2026-05-23]] — TestSprite AI testing results
- [[Finance-TestForge-2026-05-31]] — TestForge security/reliability audit
