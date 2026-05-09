# DClaw Finance — v1.2 Feature Roadmap

> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (firefly-iii, actual-budget), AI product research (Pilot, Brex, Ramp, Mercury)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Chart of accounts
- [ ] Transaction recording & categorization
- [ ] Invoice & billing
- [ ] Dashboard with P&L, cash flow
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Finance Copilot (Bookkeeping Agent)
**Description:** AI assistant that categorizes transactions, reconciles accounts, and answers finance questions. "What's my burn rate?" or "Which vendors increased prices?"
- **AI Angle:** Transaction categorization (LLM + rules). Natural language queries over financial data.
- **Backend:** `/api/v1/ai/finance-chat` endpoint. RAG over chart of accounts + transactions.
- **Frontend:** Finance dashboard with AI chat panel.
- **Files:** `backend/app/services/finance_ai.py`, `frontend/src/components/finance-copilot.tsx`

#### 2. Automated Bank Reconciliation
**Description:** Match bank transactions to internal records. Auto-categorize with learning.
- **Backend:** Bank feed integration (Plaid/Finicity). Matching algorithm.
- **Frontend:** Reconciliation view with match suggestions.
- **Files:** `backend/app/services/reconciliation.py`

#### 3. Invoice Generation & Payment Tracking
**Description:** Create invoices, send reminders, track payments, handle partial payments.
- **Backend:** Invoice PDF generation. Payment webhook handling (Stripe).
- **Frontend:** Invoice builder. Aging report.
- **Files:** `backend/app/services/invoicing.py`

#### 4. Expense Management & Approval
**Description:** Submit expenses with receipt upload. Manager approval workflow. Reimbursement tracking.
- **Backend:** Expense workflow engine. Receipt OCR (LLM/vision).
- **Frontend:** Expense submission form. Approval inbox.
- **Files:** `backend/app/services/expenses.py`

### P1 — Should Have (v1.1–1.2)

#### 5. Financial Reporting & Forecasting
**Description:** P&L, balance sheet, cash flow statements. AI-powered cash flow forecasting.
- **AI Angle:** Time-series forecasting for revenue and expenses.
- **Backend:** Report generation engine. Forecasting model.
- **Frontend:** Interactive reports. Forecast charts with confidence intervals.

#### 6. Budget vs. Actual Tracking
**Description:** Set department/project budgets. Track variance in real-time. Alert on overruns.
- **Backend:** Budget allocation + variance calculation.
- **Frontend:** Budget dashboard with variance heatmap.

#### 7. Multi-Entity & Multi-Currency
**Description:** Manage multiple subsidiaries. Handle FX rates and currency conversions.
- **Backend:** Entity hierarchy. FX rate API integration.
- **Frontend:** Entity switcher. Currency-converted reports.

#### 8. Tax Preparation & Filing
**Description:** Auto-calculate tax liabilities. Generate tax-ready reports. Integration with tax software.
- **Backend:** Tax calculation engine. Form generation.
- **Frontend:** Tax dashboard with filing deadlines.

### P2 — Could Have (v1.3+)

#### 9. AI Anomaly Detection (Fraud Prevention)
**Description:** Flag suspicious transactions and patterns in real-time.

#### 10. Vendor Management & Negotiation Insights
**Description:** Track vendor spend. AI suggests renegotiation timing based on usage trends.

#### 11. Cap Table & Equity Management
**Description:** Manage shareholder registry, option pools, and SAFE notes.

#### 12. Automated Financial Close
**Description:** AI-assisted month-end close checklist with auto-reconciliation suggestions.

---

## Implementation Priority

1. **Week 1–2:** AI Finance Copilot (P0.1) + Bank Reconciliation (P0.2)
2. **Week 3–4:** Invoicing (P0.3) + Expense Management (P0.4)
3. **Week 5–6:** Financial Reporting (P1.5) + Budget Tracking (P1.6)
4. **Week 7–8:** Multi-Entity (P1.7) + Tax Prep (P1.8)
