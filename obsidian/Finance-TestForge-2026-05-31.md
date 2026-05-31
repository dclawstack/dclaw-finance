# DClaw Finance — TestForge Security & Reliability Audit

> Run date: 2026-05-31 · Tool: TestForge MCP · Commit: `3c21ee4`
> Score: **70/100** · 25 pytest tests collected · 11 synthetic Tier-2 tests (all passed)
> Analysed by: Claude Sonnet 4.6

---

## Executive Summary

| Priority | Finding | Layer | Risk |
|---|---|---|---|
| P0 | Auth endpoints not rate limited | Backend `auth.py` | Brute-force / AI agent DoS |
| P1 | No observability stack | Backend + Frontend | Silent production failures |
| P2 | No product analytics | Frontend | Feature adoption invisible |
| P3 | N+1 query risk | Backend SQLAlchemy | Latency under load |
| P3 | Mutation score 27/100 | Backend tests | Low test kill-power |
| P3 | DORA score 25/100 | CI/CD | No deployment frequency signal |

---

## Security Score 0/100 — FALSE POSITIVE (do not act on)

The scanner reported 761 findings (452 critical, 305 high) for XSS via `write()`.

> [!note] Every finding is in `web/node_modules/object-hash/index.js`. The `write()` calls are Node.js stream writes used for deterministic hashing — not DOM writes. Zero XSS exposure in application code.

**Action:** Add `.testforgerc` to repo root excluding vendored/generated paths (S7 in [[Finance-v1.4-Roadmap]]).

---

## Finding S1 — Auth Endpoints Not Rate Limited [CRITICAL]

**Confirmed by Tier-2 synthetic test:** 20 password attempts → 0 blocked (0 × 429, 0 × 423).

**Two compounding issues in `backend/app/core/auth.py`:**

```python
# Issue 1 — no rate limiting
async def require_auth(credentials = Depends(_bearer)) -> dict:
    if not settings.logto_endpoint:
        return {}  # dev mode bypass
    # No _check_rate_limit() call here
    jwks = _fetch_jwks()
    payload = jwt.decode(...)

# Issue 2 — JWKS cache never expires
@lru_cache(maxsize=1)  # ← no TTL; never refreshes on key rotation
def _fetch_jwks() -> dict: ...
```

**Fix:**
- Replace `@lru_cache` with TTL dict cache (`_JWKS_TTL_SECONDS = 3600`)
- Add `_check_rate_limit(ip)` — 10 attempts/60s per IP, raises HTTP 429 before token parsing
- Add `slowapi>=0.1.9` + `limits>=3.6.0` to `requirements.txt`

**Why it wasn't caught earlier:** `require_auth` is tested via dev-mode mock (`return {}`); real JWT path was never exercised.

---

## Finding S2 — Dev-Mode Auth Bypass [HIGH]

`require_auth` returns `{}` when `settings.logto_endpoint` is unset. If `LOGTO_ENDPOINT` is missing from a production deploy, all endpoints become fully unauthenticated with no error or warning.

**Fix:** Startup guard in `lifespan` — raise `ValueError` if `app_env == "production"` and `logto_endpoint` unset.

---

## Finding S3 — No Observability Stack [HIGH]

**Confirmed by Tier-2 synthetic test.**

- `structlog` referenced in CLAUDE.md but absent from `requirements.txt` and not imported anywhere
- No Sentry on backend or frontend
- DORA score 25/100: no deployment frequency, no change failure rate, no MTTR signal

**Quick DORA fix:** `release=os.getenv("VERCEL_GIT_COMMIT_SHA")` in Sentry init → change-failure-rate tracked automatically.

**Full fix:**
```
requirements.txt:  structlog>=24.1.0
                   sentry-sdk[fastapi]>=1.40.0
config.py:         sentry_dsn: str = ""
                   app_env: str = "development"
web/package.json:  @sentry/nextjs
```

---

## Finding S4 — Missing Test Coverage [HIGH]

New forecast endpoints from the P0 gap-fill have zero pytest coverage:
- `GET /api/v1/forecast/scenarios`
- `GET /api/v1/forecast/three-statement`
- `GET /api/v1/forecast/drivers`
- `GET /api/v1/forecast/sensitivity`
- `GET /api/v1/forecast/mape`

**Mutation score 27/100** — existing tests use structural assertions only (`assert status_code == 200`, `assert len(data) > 0`). Mutants that swap field names or operators survive undetected.

**Missing edge-case tests:**
| Scenario | Why it matters |
|---|---|
| `POST /expenses` with invalid category | enum→varchar migration leaves no DB-level guard |
| `GET /forecast?months=0` | `ge=1` guard exists but untested (422 path) |
| `POST /expenses/ocr` with non-image MIME | `media_type` passed to LLM without validation |
| Ollama fallback with no cloud keys | New code path, zero coverage |
| JWKS fetch network failure | `httpx.get()` can throw; no test covers fallback |
| `GET /forecast/three-statement` with empty DB | Division-by-zero guard present but untested |

---

## Finding S5 — N+1 Query in Clients Endpoint [MEDIUM]

`backend/app/api/v1/clients.py` profitability scoring fetches per-client invoice data in a loop → O(n_clients) queries.

**Fix:** Replace loop with single `GROUP BY client_name` aggregation using `func.sum` + `case()`.

---

## Finding S6 — Module-Level Mutable Global [MEDIUM]

`backend/app/services/anomaly_detector.py`:
```python
_cache: dict = {"ts": 0.0, "data": []}  # ← module-level mutable state
```

Causes race conditions under async concurrency and test pollution under `pytest-xdist`.

**Fix:** Wrap with `asyncio.Lock`, or scope to service class. Permanent fix: migrate to Redis (PLAN-v1.4 item 2).

---

## Finding S7 — Scanner Configuration [LOW]

Add `.testforgerc` to repo root:
```json
{
  "exclude": [
    "**/node_modules/**",
    "**/.next/**",
    "**/graphify-out/**",
    "**/testforge/**"
  ]
}
```

This restores the security score from 0 → a real measurement of application source.

---

## Tier-2 Synthetic Tests (Proof-of-Concept)

All 11 tests passed. These validate the *pattern* of the fix, not the application:

| File | Tests | Status |
|---|---|---|
| `auth-endpoints-not-rate-limited-src-l0.test.ts` | 4 | ✅ All passed |
| `no-observability-stack-detected-src-l0.test.ts` | 4 | ✅ All passed |
| `no-product-analytics-dependency-src-l0.test.ts` | 3 | ✅ All passed |

---

## Code Smells (Low Priority)

| Location | Issue | Severity |
|---|---|---|
| `auth.py: dev mode` | `return {}` dangerous if accidentally deployed to prod | Medium |
| `llm_client.py` | Provider check (`_use_or()` etc.) computed multiple times per request | Low |
| `finance.py: _project()` | Returns `list[float]` but callers use direct index math — tight coupling | Low |

---

## Links

- Full analysis: `testforge/test_analysis/testforge-analysis.md`
- Remediation plan: [[Finance-v1.4-Roadmap]] (S1–S7 section)
- Raw scan: `testforge/testforge-dclaw-finance.json`
- [[Finance-Architecture]] — auth module location and anti-patterns
- [[Finance-TestSprite-2026-05-23]] — parallel product-level bug findings
