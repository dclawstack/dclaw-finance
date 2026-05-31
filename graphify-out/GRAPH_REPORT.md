# Graph Report - DClaw Finance (2026-05-31)

> Last generated: 2026-05-16 (graph.json) · **Manual update: 2026-05-31 (v1.4)**
> Source: graphify scan of repo root · Commit at scan: `3c21ee4` (P0 gap-fill + Vercel consolidation)
> Note: graph.json, graph.html, and manifest.json were generated at v1.2. This report reflects v1.4 state.

---

## Corpus Check (at scan)
- 189 files · ~73,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Graph Statistics
- 900 nodes · 1358 edges · 81 communities (70 shown, 11 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.78)
- Token cost: 43,312 input · 13,560 output

---

## What's Changed Since Graph Was Built (v1.2 → v1.4)

> [!note] The graph.json was generated at v1.2 (commit `3c21ee4` baseline). These new nodes and edges are not yet in the graph data but should be included in the next graphify re-run.

### New Source Files (not yet in graph)

| File | Community (expected) |
|---|---|
| `web/src/app/cash-flow/page.tsx` | Frontend UI Pages |
| `web/src/app/page.tsx` (landing + roadmap) | Frontend UI Pages |
| `backend/app/api/v1/finance.py` (extended: /mape, /scenarios, /drivers, /sensitivity, /three-statement) | Financial Forecasting |
| `backend/app/api/v1/cash_flow.py` (13-week + optimization) | Financial Forecasting |
| `testforge/test_analysis/testforge-analysis.md` | Architecture & Docs |
| `infographics/architecture-diagram.md` | Architecture & Docs |
| `slides/deck-content.md` | Architecture & Docs |
| `PLAN-v1.4.md` | Architecture & Docs |
| `PRODUCT-SPEC.md` (rewritten v1.4) | Architecture & Docs |
| `README.md` (rewritten v1.4) | Architecture & Docs |
| `obsidian/Finance-v1.4-Roadmap.md` | Architecture & Docs |
| `obsidian/Finance-TestForge-2026-05-31.md` | Architecture & Docs |

### New Conceptual Nodes (expected in next scan)

- `CashFlowPage()` — 13-week rolling projection + optimization levers
- `get_13_week_forecast()` — weekly cash flow from 3-month trailing actuals
- `get_cash_flow_optimization()` — top-3 spend categories + 10% reduction lever
- `FadeUp()` — IntersectionObserver-based scroll animation component
- `FeatureCard()` — AI feature card on landing page
- `RoadmapSection` — Live/Next two-column roadmap on landing page
- `/forecast/scenarios` endpoint — 5-variant scenario model
- `/forecast/three-statement` endpoint — Income Statement + Cash Flow + Balance Sheet
- `/forecast/drivers` endpoint — active clients, win rate, deal size
- `/forecast/sensitivity` endpoint — 4-point sensitivity table
- `/forecast/mape` endpoint — forecast accuracy vs actuals
- `Finance-v1.4-Roadmap.md` — current planning note
- `Finance-TestForge-2026-05-31.md` — TestForge audit note
- `Vercel production deployment` — `web/` → dclaw-finance-q5sakx56m-chandraja-s-projects.vercel.app
- `_check_rate_limit()` — per-IP auth rate limiter (S1 fix target)
- `_fetch_jwks() TTL cache` — JWKS cache with TTL replacing `@lru_cache` (S1 fix target)

### Updated God Nodes

| Node | Previous edges | Change |
|---|---|---|
| `api()` | 27 | Now also connects to CashFlowPage, new forecast pages |
| `PLAN-v1.2.md` | 16 | Superseded by `PLAN-v1.4.md` (new hub node) |

---

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend UI Pages|Frontend UI Pages]]
- [[_COMMUNITY_Core App Concepts|Core App Concepts]]
- [[_COMMUNITY_Invoice & AI Backend|Invoice & AI Backend]]
- [[_COMMUNITY_Deployment & Configuration|Deployment & Configuration]]
- [[_COMMUNITY_Architecture & Docs|Architecture & Docs]]
- [[_COMMUNITY_Obsidian Plugin Config|Obsidian Plugin Config]]
- [[_COMMUNITY_Helm Kubernetes Chart|Helm Kubernetes Chart]]
- [[_COMMUNITY_Obsidian Workspace Settings|Obsidian Workspace Settings]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_AI Chat & LLM Layer|AI Chat & LLM Layer]]
- [[_COMMUNITY_Reports & API Schemas|Reports & API Schemas]]
- [[_COMMUNITY_DKube MLOps Dashboard|DKube MLOps Dashboard]]
- [[_COMMUNITY_Frontend Component Config|Frontend Component Config]]
- [[_COMMUNITY_Budget & Expense Models|Budget & Expense Models]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Obsidian App Settings|Obsidian App Settings]]
- [[_COMMUNITY_Expense AI Categorizer|Expense AI Categorizer]]
- [[_COMMUNITY_Analytics & Anomaly Detection|Analytics & Anomaly Detection]]
- [[_COMMUNITY_OC Design Tokens|OC Design Tokens]]
- [[_COMMUNITY_Brand Hero Screens|Brand Hero Screens]]
- [[_COMMUNITY_Demo Seed Data|Demo Seed Data]]
- [[_COMMUNITY_Logo System Docs|Logo System Docs]]
- [[_COMMUNITY_DKube Dashboard v1|DKube Dashboard v1]]
- [[_COMMUNITY_Expense API Tests|Expense API Tests]]
- [[_COMMUNITY_Logo Guidelines|Logo Guidelines]]
- [[_COMMUNITY_Database Migrations|Database Migrations]]
- [[_COMMUNITY_Invoice Data Models|Invoice Data Models]]
- [[_COMMUNITY_DKube Brand Visuals|DKube Brand Visuals]]
- [[_COMMUNITY_Color Palette System|Color Palette System]]
- [[_COMMUNITY_Brand Architecture|Brand Architecture]]
- [[_COMMUNITY_DKube Logo Variants|DKube Logo Variants]]
- [[_COMMUNITY_OC Official Logo|OC Official Logo]]
- [[_COMMUNITY_Backend Tech Stack|Backend Tech Stack]]
- [[_COMMUNITY_Typography System|Typography System]]
- [[_COMMUNITY_FastAPI Core Setup|FastAPI Core Setup]]
- [[_COMMUNITY_Color Design Final|Color Design Final]]
- [[_COMMUNITY_Brand Hero v2 Screens|Brand Hero v2 Screens]]
- [[_COMMUNITY_Brand Guidelines Final|Brand Guidelines Final]]
- [[_COMMUNITY_Typography Hero|Typography Hero]]
- [[_COMMUNITY_Logo Design Iterations|Logo Design Iterations]]
- [[_COMMUNITY_OC Logo Uploads|OC Logo Uploads]]
- [[_COMMUNITY_DKube UI Primitives|DKube UI Primitives]]
- [[_COMMUNITY_Docs Nav Config|Docs Nav Config]]
- [[_COMMUNITY_Brand Guidelines Cover|Brand Guidelines Cover]]
- [[_COMMUNITY_OC Corporate Usage|OC Corporate Usage]]
- [[_COMMUNITY_Glyph Iteration v2|Glyph Iteration v2]]
- [[_COMMUNITY_App Layout & Nav|App Layout & Nav]]
- [[_COMMUNITY_v1.2 Feature Migration|v1.2 Feature Migration]]
- [[_COMMUNITY_Financial Forecasting|Financial Forecasting]]
- [[_COMMUNITY_Spacing & Grid|Spacing & Grid]]
- [[_COMMUNITY_Backend Settings|Backend Settings]]
- [[_COMMUNITY_Brand Architecture Preview|Brand Architecture Preview]]
- [[_COMMUNITY_Glyph Iteration v3|Glyph Iteration v3]]
- [[_COMMUNITY_Glyph Iteration v4|Glyph Iteration v4]]
- [[_COMMUNITY_Glyph Iteration v5|Glyph Iteration v5]]
- [[_COMMUNITY_Baseline DB Migration|Baseline DB Migration]]
- [[_COMMUNITY_AI Permissions Config|AI Permissions Config]]
- [[_COMMUNITY_AI CI Workflows|AI CI Workflows]]
- [[_COMMUNITY_Neutral Colors|Neutral Colors]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]

**New communities expected after re-scan:**
- `Cash Flow Management` — CashFlowPage, get_13_week_forecast, get_cash_flow_optimization
- `Vercel Deployment` — web/ app, vercel.json, .vercel/project.json, Vercel prod URL
- `Security & Reliability` — auth rate limiting, JWKS TTL, S1–S7 findings, Finance-TestForge note
- `Landing Page` — FadeUp, FeatureCard, RoadmapSection, shimmer-text, dot-grid

---

## God Nodes (most connected — core abstractions)
1. `api()` — 27 edges (connects all frontend pages to backend)
2. `Select()` — 27 edges (rewritten custom dropdown; used across all form pages)
3. `InvoiceRepository` — 22 edges
4. `DKube Dashboard v2 - Overview` — 19 edges
5. `ExpenseRepository` — 18 edges
6. `BudgetRepository` — 17 edges
7. `PLAN-v1.2.md — Finance v1.2 Feature Roadmap` — 16 edges (superseded by PLAN-v1.4.md)
8. `dependencies` — 15 edges
9. `compilerOptions` — 15 edges
10. `cn()` — 15 edges

---

## Surprising Connections (from original scan)
- `reel-prompt.md` --semantically_similar_to--> `reel-ai-tool-brief.md` [INFERRED]
- `PostgreSQL database dclaw_finance 10Gi persistence` --semantically_similar_to--> `PostgreSQL 16` [INFERRED]
- `Ingress nginx finance.dclawstack.io` --semantically_similar_to--> `nginx-ingress + cert-manager` [INFERRED]
- `Finance v1.2 Roadmap` --references--> `DClaw Finance Presentation Deck (PDF)` [EXTRACTED]
- `Finance v1.2 Roadmap` --references--> `DClaw Finance Infographic (PDF)` [EXTRACTED]

**New connections (manual — expected after re-scan):**
- `Finance-v1.4-Roadmap` --supersedes--> `Finance-v1.2-Roadmap` [EXTRACTED]
- `Finance-v1.4-Roadmap` --references--> `Finance-TestSprite-2026-05-23` [EXTRACTED]
- `Finance-v1.4-Roadmap` --references--> `Finance-TestForge-2026-05-31` [EXTRACTED]
- `CashFlowPage` --calls--> `api()` --calls--> `get_13_week_forecast()` [EXTRACTED]
- `PLAN-v1.4.md` --supersedes--> `PLAN-v1.2.md` [EXTRACTED]
- `web/` --deployed_to--> `Vercel production` [EXTRACTED]

---

## Hyperedges (group relationships)
- **DClaw Finance AI Feature Stack: 9 AI features powered by llm_client routing to OpenRouter/Anthropic using haiku/sonnet model tiers** — concept_llm_client, concept_openrouter_provider, concept_anthropic_provider [EXTRACTED 1.00]
- **DClaw Finance v1.4 data model: Invoice, Expense, Budget, ChatMessage managed by Alembic migrations** — concept_invoice_entity, concept_expense_entity, concept_budget_entity [EXTRACTED 1.00]
- **One Convergence Design System applied to DClaw Finance frontend with INR formatting for Indian enterprise market** — concept_one_convergence_design_system, concept_dclaw_finance_app, concept_inr_formatting [EXTRACTED 1.00]
- **he_ai_layer_services** — obsidian_arch_llm_client_factory, obsidian_roadmap_openrouter, obsidian_roadmap_anthropic_sdk [EXTRACTED 1.00]
- **he_oc_design_system_outputs** — obsidian_design_oc_tokens, infographics_infograph_html, slides_deck_html, infographics_architecture_diagram_md [EXTRACTED 1.00]
- **he_v14_observability_triangle** — obsidian_finance_v14_roadmap, obsidian_finance_architecture, obsidian_finance_design_system, obsidian_finance_testforge [EXTRACTED 1.00]
- **he_cash_flow_cluster: 13-week projection + optimization levers via statistical analysis of trailing 3-month actuals** — cash_flow_page, get_13_week_forecast, get_cash_flow_optimization [INFERRED 0.92]
- **he_forecast_extended_api: 5 new forecast sub-endpoints delivering scenarios, 3-statement, drivers, sensitivity, mape** — forecast_scenarios, forecast_three_statement, forecast_drivers, forecast_sensitivity, forecast_mape [INFERRED 0.95]
- **he_security_track: S1-S7 reliability findings requiring auth rate limiting, observability, and test coverage** — finding_s1_rate_limit, finding_s2_boot_guard, finding_s3_sentry, finding_s4_test_coverage [INFERRED 0.90]

---

## Communities (81 total from scan + 4 new expected)

### Community 0 - "Frontend UI Pages"
Cohesion: 0.05
Nodes (90+): KPI_CARDS, BudgetsPage(), CATEGORIES, categoryColors, InvoiceDetailPage(), statusColors, AnomalyItem, **CashFlowPage()** (new), **RoadmapSection** (new) (+82 more)

### Community 1 - "Core App Concepts"
Cohesion: 0.06
Nodes (51+): AI Expense Auto-Categorization Feature, Alembic, Expense Anomaly Detection Feature, Budget Planning with AI Guardrails Feature, **13-Week Cash Flow Feature** (new), **5-Scenario Forecast** (new), **Floating AI Copilot** (new) (+43 more)

### Community 2 - "Invoice & AI Backend"
Cohesion: 0.07
Nodes (17): InvoiceItemRepository, InvoiceRepository, draft_reminder(), suggest_line_items(), test_repo_get_by_invoice_number(), test_repo_list_by_status(), add_invoice_item(), create_invoice() (+9 more)

### Community 3 - "Deployment & Configuration"
Cohesion: 0.05
Nodes (41+): CORS_ORIGINS, DATABASE_URL, NEXT_PUBLIC_API_URL, REDIS_URL, DClaw Platform, **Vercel prod URL** (new), **web/.vercel/project.json** (new) (+33 more)

### Community 4 - "Architecture & Docs"
Cohesion: 0.07
Nodes (40+): DClaw Finance Infographic (HTML + PDF), Alembic Migrations, API Surface v1.4, claude-haiku-4-5, claude-sonnet-4-6, Data Models, FastAPI Backend (port 8096), **PLAN-v1.4.md** (new), **Finance-v1.4-Roadmap.md** (new), **Finance-TestForge-2026-05-31.md** (new), **architecture-diagram.md** (new), **deck-content.md** (new) (+32 more)

### Community 9 - "AI Chat & LLM Layer"
Cohesion: 0.11
Nodes (18+): ChatMessage, ChatRepository, agentic_loop(), _ant_loop(), chat(), chat_vision(), _m(), _or_loop(), **Ollama fallback path** (new) (+10 more)

### Community 50 - "Financial Forecasting" (was thin, now expanded)
Cohesion: 0.14 (estimated)
Nodes: exponential_smooth(), _project(), _month_offsets(), _hist_offsets(), _monthly_totals(), **get_mape()** (new), **get_scenarios()** (new), **get_three_statement()** (new), **get_drivers()** (new), **get_sensitivity()** (new), **get_13_week_forecast()** (new), **get_cash_flow_optimization()** (new)

---

## Re-scan Recommendation

> [!warning] The graph data (graph.json, manifest.json, graph.html) was built at v1.2. A re-scan is recommended to incorporate:
> - `web/` directory (Vercel app with landing page + roadmap section)
> - Extended forecast endpoints (5 new sub-routes in `finance.py`)
> - `backend/app/api/v1/cash_flow.py` (new file)
> - New Obsidian notes: `Finance-v1.4-Roadmap.md`, `Finance-TestForge-2026-05-31.md`
> - Updated docs: `PLAN-v1.4.md`, `PRODUCT-SPEC.md`, `README.md`, `infographics/architecture-diagram.md`, `slides/deck-content.md`

Run `/graphify` from repo root to regenerate after the above changes are committed.
