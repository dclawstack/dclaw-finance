# DClaw Finance — Presentation Deck Content

> Source content for slide deck regeneration.
> Version: 1.4 · Updated: 2026-05-31
> Design system: One Convergence Vol. 01 · Purple `#7030A0` · Manrope display

---

## Slide 1 — Cover

**Title:** DClaw Finance

**Tagline:** AI-native financial management for Indian SaaS founders

**Visual:** Purple gradient hero, app screenshot at right  
**Sub-copy:** Invoice, track, forecast, and ask your numbers — all in INR

---

## Slide 2 — The Problem

**Headline:** Every Indian SaaS founder hates month-end

**Three pain points (icon + one-liner each):**

- 📊 **GST filing** — manual GSTR-1 export, GSTR-2B mismatches, missed ITC
- 📉 **Cash flow blindspots** — no 13-week forward view; runway surprises
- ⏱️ **Finance ops time tax** — CFOs spend 20+ hours/month on what AI can do in minutes

**Bottom line:** Tally handles compliance. Spreadsheets handle everything else. Nothing handles both — and neither thinks in natural language.

---

## Slide 3 — The Solution

**Headline:** One tool that handles GST end-to-end and talks back in plain English

**Visual:** App screenshot grid (3×3) — Dashboard, Expenses, Ask AI

**Three differentiators:**
1. AI that auto-categorises expenses and reads receipts in < 3 seconds
2. 13-week cash flow projection + scenario planning, no spreadsheet required
3. Ask "what were my top 3 expenses last quarter?" and get an actual answer

---

## Slide 4 — Product Overview (Screen Map)

**Layout:** Hub-and-spoke diagram, app sections radiating from centre

| Section | Key Value |
|---------|-----------|
| Dashboard | Real-time P&L, 12-month trend, overdue alerts |
| Invoices | Create, track, AI reminder drafts |
| Expenses | OCR receipts, auto-categorise, detect anomalies |
| Cash Flow | 13-week rolling projection, top-3 reduction levers |
| Forecast | 3-month, 5-scenario, 3-statement model |
| Reports | One-click AI executive summary |
| Budgets | Per-category limits, breach alerts |
| Clients | Profitability ranking with AI insight |
| Ask AI | Chat with your numbers |

---

## Slide 5 — AI Feature Showcase

**Headline:** 9 AI features. Every one triggered by real work, not a demo button.

| # | Feature | How it triggers | Model |
|---|---------|----------------|-------|
| 01 | Expense Auto-Categorisation | 600ms after typing vendor name | claude-haiku-4-5 |
| 02 | Receipt OCR → Form Pre-fill | Drag-and-drop receipt image | claude-haiku-4-5 vision |
| 03 | Invoice Reminder Draft | Click on overdue invoice | claude-sonnet-4-6 |
| 04 | Line-Item Suggestions | First item typed in invoice | claude-haiku-4-5 |
| 05 | Expense Anomaly Detection | Open Anomalies tab | haiku + z-score stats |
| 06 | Monthly Executive Report | Month/year selector → Generate | claude-sonnet-4-6 |
| 07 | Budget Breach Suggestions | Category reaches 80% utilisation | claude-haiku-4-5 |
| 08 | Client Profitability Insights | Client ranking page load | claude-haiku-4-5 |
| 09 | NL Financial Q&A | Chat input | claude-sonnet-4-6 + tool-use |

**Cost controls:** All endpoints accept `?dry_run=true`. Anomaly and client results are cached (1h / 24h). Categorisation result stored per expense row — never re-billed.

---

## Slide 6 — Cash Flow & Forecast

**Headline:** Know your runway before you need to.

**Left:** 13-week cash flow chart mockup
- Weekly projected inflows and outflows
- Running balance with colour-coded positive/negative zones
- Top-3 cost reduction levers with ₹ savings estimate

**Right:** 3-month forecast summary cards
- Projected Revenue / Expenses / Profit in INR
- Confidence band (±10%)
- 5-scenario toggle: base · bull · bear · high growth · conservative

**Statistics footnote:** Exponential smoothing α=0.3 · 6-month trailing history · growth capped ±20% · No LLM cost

---

## Slide 7 — Technical Architecture

**Headline:** Production-grade stack. Nothing exotic.

```
Browser / Next.js 14 App Router
        ↓
FastAPI backend (port 8096)
├── JWT auth middleware (Logto)
├── API v1 routes (11 modules)
│   └── Services layer (LLM calls)
│       └── llm_client.py  ← unified AI gateway
│           ├── OpenRouter (primary)
│           ├── Anthropic direct (fallback)
│           └── Ollama / local (dev fallback)
└── Repository layer → PostgreSQL 16
```

**Stack badges (two rows):**
Row 1: Next.js · FastAPI · PostgreSQL 16 · SQLAlchemy 2.0  
Row 2: Tailwind CSS · Pydantic v2 · Alembic · Docker · Helm · Vercel

---

## Slide 8 — Deployment Options

**Headline:** Local in 3 commands. Vercel in 1.

**Option A — Docker (local / K8s):**
```bash
cp .env.example .env          # add OPENROUTER_API_KEY
docker compose up --build -d
docker compose exec backend alembic upgrade head
# → http://localhost:3007
```

**Option B — Vercel (cloud frontend):**
```bash
cd web && vercel --prod        # frontend on Vercel CDN
# Set NEXT_PUBLIC_API_URL to deployed backend
```

**Option C — Kubernetes:**
```bash
helm install dclaw-finance ./helm -f helm/values.yaml
# CloudNativePG + K8s Secrets for API keys
```

---

## Slide 9 — INR Currency System

**Headline:** Built for Indian numbers, not converted from dollars.

**Three display tiers:**
| Threshold | Format | Example |
|-----------|--------|---------|
| ≥ ₹1 Cr | ₹X.XX Cr | ₹12.50 Cr |
| ≥ ₹10 L | ₹X.X L | ₹45.3 L |
| ≥ ₹1 L | ₹X.XX L | ₹3.75 L |
| < ₹1 L | ₹X,XX,XXX | ₹85,000 |

`formatINR()` utility in `web/src/lib/utils.ts` — used everywhere in the UI.  
Recharts axis ticks use `inrAxisTick()` for consistent chart formatting.

---

## Slide 10 — Roadmap

**Headline:** Shipped: All v1.2 features. Next: hardening → GST → agentic.

**Three-phase roadmap:**

**Phase 1 — Hardening (Now)**
- Bug sprint: 6 product defects (delete, forms, validation)
- Security: auth rate limiting, observability (Sentry + structlog)
- Test coverage: forecast endpoints, edge cases

**Phase 2 — Foundation (Next 4–6 weeks)**
- Multi-tenancy: per-company data isolation, JWT login
- GST compliance: GSTR-1 generation, GSTR-2B reconciliation, IRN
- Redis + ARQ: async task queue for long AI operations

**Phase 3 — Agentic (Following quarter)**
- Proactive cash flow agent (daily 8am recommendations)
- Bank statement reconciliation (Setu Account Aggregator)
- Streaming NL chat (SSE)
- Benchmarking: anonymised spend data across tenants

---

## Slide 11 — Demo Data

**Company:** Meridian AI Technologies  
(DKube-modeled fictional Indian SaaS company)

**Seeded data (`scripts/seed_data.py`):**
- 50 invoices across 8 clients — mix of paid, overdue, sent, draft
- 207 expenses — 6 categories, 18 months of history
- 6 monthly budgets with varied utilisation levels

**Designed to showcase:**
- Anomaly detection (intentional outlier expenses seeded)
- Trend chart (12 months of real revenue data)
- 13-week cash flow (meaningful projection from trailing history)
- Client profitability ranking (diverse score distribution)

---

## Slide 12 — Call to Action / Links

**Headline:** Try it in 3 minutes.

| Resource | Link |
|----------|------|
| Live demo | https://dclaw-finance.vercel.app |
| GitHub | https://github.com/dclawstack/dclaw-finance |
| API docs | http://localhost:8096/docs |
| Roadmap | `PLAN-v1.4.md` |
| Product spec | `PRODUCT-SPEC.md` |

**Quick start:**
```bash
git clone https://github.com/dclawstack/dclaw-finance
cp .env.example .env   # add your OpenRouter key
docker compose up -d && docker compose exec backend alembic upgrade head
```

---

## Design Notes (for deck builder)

**Colours:**
- Primary: `#7030A0` (purple)
- Background: `#FFFFFF`
- Accent dark: `#1a1a2e`
- Positive: `#10B981` (emerald)
- Negative: `#EF4444` (red)
- Amber: `#F59E0B`

**Fonts:**
- Display headings: Manrope 700
- Body: Inter 400/500
- Code snippets: JetBrains Mono

**Corner radius:** 2px (sharp — One Convergence design system)

**Chart palette:**
- Revenue: `#7030A0`
- Expenses: `#C084FC`
- Profit: `#10B981`
- Confidence band: `rgba(112, 48, 160, 0.15)`
