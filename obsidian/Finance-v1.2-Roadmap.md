# DClaw Finance — v1.2 Roadmap

> ⚠️ **Superseded by [[Finance-v1.4-Roadmap]]** — this note is a historical record of what shipped in v1.2.
> Current planning: `dclaw-finance/PLAN-v1.4.md` · Current features: [[Finance-v1.4-Roadmap]]
> Source of truth: `dclaw-finance/PLAN-v1.2.md`  
> Architecture rules: `dclaw-finance/AGENTS.md`  
> Last updated: May 2026 · **All 11 features shipped ✅ · v1.4 continues from here**

---

## Status Summary

| Phase | Features | Status |
|---|---|---|
| v1.0 | Invoice CRUD, Expense CRUD, Dashboard, Docker, Alembic, Tests | ✅ Done |
| v1.2 P0 | Trend chart, AI categorisation, Reminder drafts, Receipt OCR | ✅ Done |
| v1.2 P1 | Cash flow forecast, Anomaly detection, Monthly report, Line-item suggestions | ✅ Done |
| v1.2 P2 | NL Chat, Budget planning, Client profitability | ✅ Done |
| Post-v1.2 fixes | LLM provider switch, INR currency, Select/Tabs rewrites, forecast fix, upsert budget | ✅ Done |
| v2.0 | Streaming chat, multi-currency, board pack PDF, email sending | 🔲 Backlog |

---

## v1.2 Feature Inventory

### P0 — Must Have

| # | Feature | Model | Endpoint | Status |
|---|---|---|---|---|
| 1 | AI expense auto-categorisation | haiku | `POST /expenses/categorize` | ✅ |
| 2 | 12-month trend chart | — (DB query) | `GET /dashboard/trends` | ✅ |
| 3 | Invoice reminder drafts | sonnet | `POST /invoices/{id}/reminder-draft` | ✅ |
| 4 | Receipt OCR → expense pre-fill | haiku (vision) | `POST /expenses/ocr` | ✅ |

### P1 — Should Have

| # | Feature | Model | Endpoint | Status |
|---|---|---|---|---|
| 5 | Cash flow forecast (stats) | — (statistics stdlib) | `GET /forecast` | ✅ |
| 6 | Expense anomaly detection | haiku (batched) | `GET /expenses/anomalies` | ✅ |
| 7 | Monthly financial summary report | sonnet | `POST /reports/monthly-summary` | ✅ |
| 8 | Invoice line-item suggestions | haiku | `POST /invoices/suggest-items` | ✅ |

### P2 — Could Have

| # | Feature | Model | Endpoint | Status |
|---|---|---|---|---|
| 9 | NL financial Q&A chat | sonnet (tool-use) | `POST /chat` | ✅ |
| 10 | Budget planning + AI guardrails | haiku (conditional) | `GET /budgets/status` | ✅ |
| 11 | Client profitability scoring | haiku (batched) | `GET /clients/profitability` | ✅ |

---

## AI Integration (As Built)

```
backend/requirements.txt:
  anthropic>=0.25.0    ← used when ANTHROPIC_API_KEY is set
  openai>=1.0.0        ← used when OPENROUTER_API_KEY is set (OpenRouter API)

.env:
  OPENROUTER_API_KEY=sk-or-v1-...   ← takes priority
  ANTHROPIC_API_KEY=sk-ant-...       ← fallback

backend/app/services/llm_client.py:
  chat()          → simple text completion
  chat_vision()   → vision/OCR
  agentic_loop()  → tool-use for NL chat
```

> [!important] Never call `anthropic` or `openai` SDKs directly in services. Always use `llm_client`.

---

## New Pages Shipped

| Page | Route | Feature(s) |
|---|---|---|
| Forecast | `/forecast` | P1 cash flow forecast |
| Reports | `/reports` | P1 monthly summary report |
| Budgets | `/budgets` | P2 budget planning |
| Clients | `/clients` | P2 client profitability |
| Chat | `/chat` | P2 NL Q&A |

---

## New Backend Services Shipped

| File | Features |
|---|---|
| `services/llm_client.py` | Unified factory: OpenRouter ↔ Anthropic |
| `services/ai_categorizer.py` | P0-1 expense categorisation |
| `services/receipt_ocr.py` | P0-4 receipt vision extraction |
| `services/ai_writer.py` | P0-3 reminders + P1-4 line-item suggestions |
| `services/report_generator.py` | P1-3 monthly executive report |
| `services/anomaly_detector.py` | P1-2 z-score detection + batch explanations |
| `services/nl_query.py` | P2-1 agentic tool-use loop |

---

## Post-v1.2 Bugs Fixed

| Bug | Root Cause | Fix |
|---|---|---|
| OpenRouter returns HTML | Anthropic SDK sends `x-api-key`; OpenRouter needs `Authorization: Bearer` | Switched to OpenAI SDK for OpenRouter path |
| Forecast shows 0 future revenue | `range(5,-1,-1)` included current partial month (0 paid revenue) → -100% growth | Changed to `range(6,0,-1)` (6 complete past months); growth capped ±20% |
| Reports show `***markdown***` | LLM returned markdown despite intent | Prompt now says "plain text only"; backend strips with `re.sub` |
| Clients 500 error | `func.cast(expr, func.Integer())` invalid in SA2 | Changed to `case((Invoice.status == "paid", Invoice.total), else_=0)` |
| Budget category shows no options | `SelectItem` was a `<div>` inside native `<select>` → invisible to browser | Rewrote `select.tsx` as custom dropdown with React Context |
| Budget POST returns 409 | Endpoint raised 409 if budget already existed | Changed to upsert: updates limit if (category, year, month) exists |
| Tabs doesn't support controlled `value` | Original `Tabs` only accepted `defaultValue` | Rewrote `tabs.tsx` with React Context; supports `value` + `onValueChange` |
| `globals.css` build error | `@import "./types.css"` after `@tailwind` — webpack processes imported CSS in isolation | Inlined `types.css` into `globals.css`; deleted the separate file |
| Dockerfile broken | Referenced deleted `pyproject.toml` | Changed to `pip install -r requirements.txt` |
| All amounts shown in dollars | Dollar sign hardcoded throughout frontend | Added `formatINR()` + `inrAxisTick()` to `utils.ts`; updated all pages |

---

## Demo Data (Seed Script)

**Company:** Meridian AI Technologies (fictional, modeled on DKube)

```bash
pip install httpx
python scripts/seed_data.py            # seed
python scripts/seed_data.py --reset    # wipe and re-seed
python scripts/seed_data.py --dry-run  # preview
```

| Metric | Value |
|---|---|
| Annual paid revenue | ₹39.05 Cr |
| Annual expenses | ₹29.41 Cr |
| Net profit | ₹9.64 Cr |
| Net margin | 24.7% |
| Invoices | 50 (42 paid · 4 sent · 2 overdue · 2 draft) |
| Expense entries | 207 |
| Enterprise clients | 12 |
| Monthly salary burn | ₹1.43 Cr (40 staff · SJ + Hyderabad) |

**Invoice pricing (INR enterprise market):**
- DKubeX annual: ₹2.5 Cr · MLOps annual: ₹1.5 Cr
- Professional services: ₹25 L/month · Blueprints: ₹50–80 L

---

## Deliverables

| File | Description |
|---|---|
| `slides/DClaw-Finance-Deck.pdf` | 15-slide presentation (OC design system) |
| `infographics/DClaw-Finance-Infographic.pdf` | Single tall infographic (8 sections) |
| `CHANGES-v1.2.md` | Full build & change log |
| `DEMO-DATA.md` | Seed data reference — pricing, clients, financial story |
| `DEPLOY.md` | Deployment guide — Docker, Kubernetes, troubleshooting |

---

## v2.0 Candidate Backlog

- [ ] Streaming SSE chat (replace synchronous tool-use loop)
- [ ] Multi-currency (USD/EUR/INR with real-time FX)
- [ ] Invoice PDF download (WeasyPrint or Puppeteer)
- [ ] Email sending (SendGrid/SES integration for reminder drafts)
- [ ] Tally / QuickBooks export
- [ ] Investor-grade board pack PDF (auto-generated monthly)
- [ ] Role-based access control (viewer/editor/admin)
- [ ] Audit log (append-only financial record changes)

---

## Related Notes

- [[Finance-Architecture]] — stack, anti-patterns, AI layer rules
- [[Finance-Design-System]] — OC tokens, components, INR formatting
