# Running dclaw-finance

## Prerequisites

Before starting, ensure `.env` exists in the project root. Copy `.env.example` if needed:

```bash
cp .env.example .env
```

Then set at least one AI API key in `.env`:

```
# Option A — OpenRouter (takes priority if both are set)
OPENROUTER_API_KEY=your-key-here

# Option B — Anthropic direct
ANTHROPIC_API_KEY=your-key-here
```

Get keys at:
- OpenRouter: https://openrouter.ai/keys
- Anthropic: https://console.anthropic.com/

## Start all services

Run from the project root (`dclaw-finance/`):

```bash
docker compose up --build -d
```

## Run database migrations

Once the backend container is healthy:

```bash
docker compose exec backend alembic upgrade head
```

If the backend isn't ready yet, wait a few seconds and retry.

## Verify everything is running

```bash
docker compose ps
```

## Service URLs

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3007  |
| Backend  | http://localhost:8096  |
| Postgres | localhost:5434         |
