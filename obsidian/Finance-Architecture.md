# DClaw Finance — Architecture Reference

> Do not modify the stack. See `AGENTS.md` for the full anti-pattern table.

## Ports & Identity

| Item | Value |
|---|---|
| Backend | FastAPI on port **8096** |
| Frontend | Next.js on port **3007** |
| Database | PostgreSQL `dclaw_finance` |
| Base API path | `/api/v1` |

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
- Tailwind CSS + shadcn/ui
- API client in `src/lib/api.ts`
- `NEXT_PUBLIC_API_URL` baked at build time

**Docker**
- Backend: `python:3.11-slim`, non-root `appuser`
- Frontend: `node:20-alpine`, port 3007
- Healthcheck: `python urllib.request.urlopen()` (never curl)

## Key Anti-Patterns (Never Do)

| Bad | Good |
|---|---|
| `declarative_base()` in database.py | `from app.models.base import Base` |
| curl in healthcheck | `python urllib.request.urlopen(...)` |
| In-memory `MOCK_*` dicts | Real repository + DB |
| Missing `ARG NEXT_PUBLIC_API_URL` | Add before `RUN npm run build` |
| Hardcoded `localhost:PORT` | `process.env.NEXT_PUBLIC_API_URL` |
| `default_factory=` in `mapped_column()` | Use `default=` instead |
| No alembic migration for new model | Run `alembic revision --autogenerate` |

## Model Rules

- Inherit from `Base` in `app.models.base`
- Use `Mapped[...]` and `mapped_column()`
- Relationships: `lazy="selectin"`
- Child FK: `ondelete="CASCADE"`
- Optional FK: `ondelete="SET NULL"`
- Every new table → new alembic migration

## Testing Requirements

- Every repository → tests
- Every endpoint → covered
- `pytest-asyncio` with async functions
- `httpx.AsyncClient` + `ASGITransport`
- Override `get_db` with test session
