# DClaw Finance — v1.2 Feature Roadmap

> Source of truth: `dclaw-finance/PLAN-v1.2.md`
> Architecture rules: `dclaw-finance/AGENTS.md`

## Current v1.0 State

- Invoice CRUD (full)
- Expense CRUD + category filter
- Dashboard (revenue, expenses, profit, overdue, category chart)
- Docker + Helm + Alembic

## Build Order (Priority Stack)

| # | Feature | Complexity | Token Cost | Impact |
|---|---|---|---|---|
| 1 | Monthly Trend Chart (12-month line) | Low | None | High |
| 2 | AI Expense Auto-Categorization | Low | Low | High |
| 3 | Invoice Reminder Drafts | Low | Low | High |
| 4 | Receipt OCR → Expense Pre-fill | Low-Med | Med | High |
| 5 | Real Cash Flow Forecast (stats) | Med | None | High |
| 6 | Expense Anomaly Detection | Med | Low | High |
| 7 | Monthly Financial Summary Report | Med | Med | High |
| 8 | Invoice Line-Item Suggestions | Med | Low | Med-High |
| 9 | NL Financial Q&A Chat | High | High | High |
| 10 | Budget Planning + AI Guardrails | Med-High | Low | Med |
| 11 | Client Profitability Scoring | Med | Low | Med |

## AI Integration Setup (Do Once)

1. Add `anthropic>=0.25.0` to `backend/requirements.txt`
2. Create `backend/app/services/__init__.py`
3. Add `ANTHROPIC_API_KEY` to `.env` + `backend/app/core/config.py`
4. Use `claude-haiku-4-5` for short tasks, `claude-sonnet-4-6` for reports/chat
5. Cache LLM output in nullable `ai_*` columns — cuts ongoing costs 80%+

## New Pages Needed (Frontend)

| Page | Route | Feature |
|---|---|---|
| Forecast | `/forecast` | P1-1 |
| Reports | `/reports` | P1-3 |
| Chat | `/chat` | P2-1 |
| Budgets | `/budgets` | P2-2 |
| Clients | `/clients` | P2-3 |

## New Backend Services

| File | Features |
|---|---|
| `services/ai_categorizer.py` | P0-1 |
| `services/receipt_ocr.py` | P0-4 |
| `services/ai_writer.py` | P0-3, P1-4 |
| `services/report_generator.py` | P1-3 |
| `services/anomaly_detector.py` | P1-2 |
| `services/nl_query.py` | P2-1 |
