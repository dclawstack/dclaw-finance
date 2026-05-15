# DClaw Finance — Deployment Guide

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Docker | 24+ | `docker --version` |
| Docker Compose | v2 (plugin) | `docker compose version` |
| Python | 3.11+ | `python3 --version` (for seed script only) |
| Node.js | 20+ | `node --version` (local dev only) |
| kubectl + Helm | 3.x | `helm version` (K8s deploy only) |

---

## 1. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database (used by local dev; Docker Compose overrides DATABASE_URL internally)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_finance

# App
APP_ENV=production
SECRET_KEY=<generate: python3 -c "import secrets; print(secrets.token_hex(32))">

# AI — set ONE key (OPENROUTER_API_KEY takes priority if both are present)
# Option A: OpenRouter  →  https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-...
# Option B: Anthropic direct  →  https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Frontend (baked at Docker build time via ARG)
NEXT_PUBLIC_API_URL=http://localhost:8096
```

> At least one AI key is required for: expense categorisation, receipt OCR, reminder drafts,
> line-item suggestions, anomaly explanations, monthly reports, budget breach suggestions,
> client profitability insights, and NL chat. The app starts without a key but AI endpoints
> return 500 errors.

### How provider selection works

`backend/app/services/llm_client.py` checks keys in this order:

1. `OPENROUTER_API_KEY` set → **OpenAI SDK** pointing at `https://openrouter.ai/api/v1`; model names prefixed with `anthropic/` (e.g. `anthropic/claude-haiku-4-5`)
2. Otherwise → **Anthropic SDK** pointing at `https://api.anthropic.com`; bare model names

Both paths use the same service interfaces — no code changes required when switching providers.

---

## 2. Docker Compose (recommended)

### First-time setup

```bash
# Build and start all three containers (postgres, backend, frontend)
docker compose up -d --build

# Watch logs until all services are healthy
docker compose logs -f
```

Services start in order: `postgres` (healthy check) → `backend` → `frontend`.

### Run the v1.2 migration

The migration must run once after first deploy:

```bash
docker compose exec backend alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> ea63ff03f4e3, add invoice invoice_item expense models
INFO  [alembic.runtime.migration] Running upgrade ea63ff03f4e3 -> b2c4d6e8a1f3, v1.2 features
```

### Seed demo data

```bash
pip install httpx          # one-time host setup
python scripts/seed_data.py          # seed 50 invoices + 207 expenses + 6 budgets
python scripts/seed_data.py --reset  # wipe and re-seed (use after pricing changes)
python scripts/seed_data.py --dry-run  # preview without writing
```

### Verify health

```bash
docker compose ps                    # all three services should show status Up
curl http://localhost:8096/health    # → {"status":"ok","service":"dclaw-finance"}
curl http://localhost:3007/          # → HTML (Next.js frontend)
```

### Stop / restart

```bash
docker compose down            # stop containers (data persists in named volume)
docker compose down -v         # also delete the postgres volume (wipes all data)
docker compose restart         # restart without rebuild
docker compose up -d --build   # rebuild images after code changes
```

### Ports

| Service | Host Port | Container Port | Notes |
|---------|-----------|----------------|-------|
| PostgreSQL | **5434** | 5432 | Port 5433 was occupied; bumped to 5434 |
| Backend (FastAPI) | 8096 | 8096 | API docs at `/docs` |
| Frontend (Next.js) | 3007 | 3007 | The main application |

> **Important:** The app is at **http://localhost:3007**. Opening `http://localhost:8096` shows 404 because there is no root `/` route — use `/docs` or `/health`.

---

## 3. Local Development (without Docker)

### Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Point at a local postgres instance
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_finance

alembic upgrade head

# Auto-reload dev server
uvicorn app.api.main:app --host 0.0.0.0 --port 8096 --reload
```

API docs: http://localhost:8096/docs

### Frontend

```bash
cd frontend

npm install

NEXT_PUBLIC_API_URL=http://localhost:8096 npm run dev
```

App: http://localhost:3000 (Next.js dev default)

---

## 4. Database Migrations

All schema changes are managed with Alembic.

```bash
# Apply all pending migrations
docker compose exec backend alembic upgrade head

# Check current revision
docker compose exec backend alembic current

# Show full migration history
docker compose exec backend alembic history

# Rollback one step
docker compose exec backend alembic downgrade -1

# Rollback to v1.0 baseline (removes all v1.2 tables/columns)
docker compose exec backend alembic downgrade ea63ff03f4e3
```

### v1.2 migration (`b2c4d6e8a1f3`) adds:
- `expenses.ai_suggested_category` — nullable VARCHAR(50)
- `budgets` table — category spend limits per year/month
- `chat_messages` table — persisted NL chat history

---

## 5. Kubernetes / Helm

The chart lives at `helm/dclaw-finance/`.

```bash
kubectl create namespace dclaw-finance

# Store secrets
kubectl create secret generic dclaw-finance-secrets \
  --from-literal=openrouter-api-key=sk-or-v1-... \
  --from-literal=secret-key=$(python3 -c "import secrets; print(secrets.token_hex(32))") \
  -n dclaw-finance

# Dry-run
helm template dclaw-finance ./helm/dclaw-finance \
  --namespace dclaw-finance \
  --set backend.env.DATABASE_URL="postgresql+asyncpg://..." \
  --set backend.env.OPENROUTER_API_KEY="sk-or-v1-..."

# Install / upgrade
helm upgrade --install dclaw-finance ./helm/dclaw-finance \
  --namespace dclaw-finance \
  --set backend.env.DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/dclaw_finance" \
  --set backend.env.OPENROUTER_API_KEY="sk-or-v1-..." \
  --set frontend.buildArgs.NEXT_PUBLIC_API_URL="https://api.your-domain.com"

# Run migration after deploy
kubectl exec -it deploy/dclaw-finance-backend -n dclaw-finance -- alembic upgrade head

# Verify rollout
kubectl rollout status deploy/dclaw-finance-backend -n dclaw-finance
kubectl rollout status deploy/dclaw-finance-frontend -n dclaw-finance
```

---

## 6. Rotating the AI Key

### Docker Compose
Update `.env`, then restart the backend only:
```bash
docker compose restart backend
```

### Kubernetes
```bash
kubectl patch secret dclaw-finance-secrets -n dclaw-finance \
  --type='json' \
  -p='[{"op":"replace","path":"/data/openrouter-api-key","value":"'$(echo -n sk-or-v1-NEW | base64)'"}]'

kubectl rollout restart deploy/dclaw-finance-backend -n dclaw-finance
```

---

## 7. Troubleshooting

### Backend won't start — `relation does not exist`
Migrations have not been applied:
```bash
docker compose exec backend alembic upgrade head
```

### AI endpoints return 500 / `AuthenticationError`
Check which key is loaded and whether it's valid:
```bash
docker compose exec backend python3 -c "
from app.core.config import settings
key = settings.openrouter_api_key or settings.anthropic_api_key
print('Provider:', 'OpenRouter' if settings.openrouter_api_key else 'Anthropic')
print('Key set:', bool(key))
print('Key prefix:', (key[:14] + '...') if key else 'EMPTY')
"
```
If valid but still 500, test connectivity:
```bash
docker compose exec backend python3 -c "
import asyncio
from app.services.llm_client import chat
async def t(): print(await chat('Say OK', max_tokens=5))
asyncio.run(t())
"
```

### Receipt OCR returns 422
`python-multipart` must be installed. Verify and rebuild if missing:
```bash
docker compose exec backend pip show python-multipart
docker compose up -d --build backend
```

### Clients page / Anomalies show no AI insights
The 24h / 1h in-memory caches may hold stale data (e.g. from before a `--reset` re-seed). Restart the backend to clear:
```bash
docker compose restart backend
```

### Frontend shows wrong API URL or currency
`NEXT_PUBLIC_API_URL` is baked at **build time**. After changing it, or after re-seeding with new amounts, rebuild:
```bash
docker compose up -d --build frontend
```

### Postgres connection refused
The Docker Compose postgres binds to host port **5434** (not 5432 or 5433, which may be occupied).
Use `postgresql+asyncpg://postgres:postgres@localhost:5434/dclaw_finance` for local tools (pgAdmin, psql).
Backend containers connect on internal port 5432 via the `postgres` hostname.

### Budget shows over-threshold on first load
If you ran `--reset` without recreating budgets, run the budget-fix snippet:
```bash
python3 - << 'EOF'
import urllib.request, json
API = "http://localhost:8096/api/v1"
# Delete existing budgets
r = urllib.request.urlopen(f"{API}/budgets?year=2026&month=5")
for b in json.loads(r.read()):
    urllib.request.urlopen(urllib.request.Request(f"{API}/budgets/{b['id']}", method="DELETE"))
# Recreate with correct limits
for bud in [
    {"category":"salary","monthly_limit":20000000,"year":2026,"month":5},
    {"category":"software","monthly_limit":2200000,"year":2026,"month":5},
    {"category":"marketing","monthly_limit":2500000,"year":2026,"month":5},
    {"category":"travel","monthly_limit":2000000,"year":2026,"month":5},
    {"category":"office","monthly_limit":2200000,"year":2026,"month":5},
    {"category":"other","monthly_limit":1000000,"year":2026,"month":5},
]:
    data = json.dumps(bud).encode()
    req = urllib.request.Request(f"{API}/budgets", data=data, headers={"Content-Type":"application/json"})
    urllib.request.urlopen(req)
print("Budgets recreated")
EOF
```

### Chat / AI responses are slow
The NL chat uses a synchronous tool-use loop. Typical latency: 3–10 s. This is expected — not a bug.

---

## 8. Quick Reference

```
App (frontend):     http://localhost:3007
API (backend):      http://localhost:8096
API docs:           http://localhost:8096/docs
Health check:       http://localhost:8096/health
Postgres (host):    localhost:5434

Pages:
  /              Dashboard — KPIs, 12-month trend, overdue invoices
  /invoices      Invoice list + new invoice
  /expenses      Expense list + anomalies tab
  /forecast      3-month cash flow forecast with confidence band
  /reports       AI monthly executive summary
  /budgets       Category budget tracking with inline edit
  /clients       Client profitability ranking
  /chat          Natural language financial Q&A

Slide deck:    slides/DClaw-Finance-Deck.pdf          (15 slides)
Infographic:   infographics/DClaw-Finance-Infographic.pdf  (1 tall page)
```
