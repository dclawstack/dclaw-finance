# DClaw Scaffold

> **The single source of truth for new DClaw app development.**
> Clone this repo, rename it, fill in your `PRODUCT-SPEC.md`, and hand it to your coding agents.

## What This Is

This scaffold contains the **complete boilerplate** for any DClaw vertical SaaS app:
- ✅ FastAPI backend with correct SQLAlchemy 2.0 setup
- ✅ Next.js 14 frontend with Tailwind + API client
- ✅ Docker + docker-compose with working healthchecks
- ✅ Helm chart for Kubernetes deployment
- ✅ Alembic migrations setup
- ✅ pytest test harness
- ✅ GitHub Actions CI
- ✅ `AGENTS.md` + `PLAN-v1.2.md` templates

## How to Use

```bash
# 1. Clone the scaffold
git clone https://github.com/dclawstack/dclaw-scaffold.git dclaw-YOURAPP
cd dclaw-YOURAPP

# 2. Find/replace placeholders
# Finance    -> Your app name (e.g., CRM)
# {BACKEND_PORT}-> Next free port (see port registry below)
# {FRONTEND_PORT}-> Next free port
# {DB_NAME}     -> dclaw_yourapp

# 3. Write your PRODUCT-SPEC.md
# See PRODUCT-SPEC.md.template for the format

# 4. Hand to your coding agents
# See SCALING-PLAYBOOK.md for the parallel agent workflow
```

## Port Registry

| App | Backend Port | Frontend Port | Database |
|-----|-------------|---------------|----------|
| dclaw-chat | 8090 | 3000 | dclaw_chat |
| dclaw-med | 8092 | 3004 | dclaw_med |
| dclaw-learn | 8093 | 3003 | dclaw_learn |
| dclaw-code | 8094 | 3005 | dclaw_code |
| dclaw-legal | 8099 | 3013 | dclaw_legal |
| **dclaw-crm** | **8095** | **3006** | **dclaw_crm** |
| **dclaw-finance** | **8096** | **3007** | **dclaw_finance** |
| **dclaw-hr** | **8097** | **3008** | **dclaw_hr** |
| **dclaw-inventory** | **8098** | **3009** | **dclaw_inventory** |
| **dclaw-project** | **8100** | **3010** | **dclaw_project** |

> **Rule:** New apps take the next available port. Update this table when assigning.

## Files You Must Customize

| File | What to Change |
|------|---------------|
| `backend/app/core/config.py` | `app_name`, default database name |
| `backend/app/api/main.py` | Wire v1 routers |
| `frontend/package.json` | Package name |
| `frontend/src/app/layout.tsx` | Title, description |
| `frontend/src/app/page.tsx` | Dashboard content |
| `docker-compose.yml` | Port mappings |
| `helm/Chart.yaml` | Chart name |
| `helm/values.yaml` | Image repository names |
| `AGENTS.md` | App identity, port numbers |
| `PLAN-v1.2.md` | Feature backlog |
| `PRODUCT-SPEC.md` | (Create this) Domain models, business logic |

## What You Should NOT Change

- `app/models/base.py` — `DeclarativeBase` pattern
- `app/core/database.py` — Engine/session factory
- `docker-compose.yml` healthcheck commands
- `frontend/Dockerfile` `ARG NEXT_PUBLIC_API_URL` pattern
- `tests/conftest.py` — Test DB override pattern
