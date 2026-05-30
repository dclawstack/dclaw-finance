# Graph Report - .  (2026-05-16)

## Corpus Check
- 189 files · ~73,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 900 nodes · 1358 edges · 81 communities (70 shown, 11 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.78)
- Token cost: 43,312 input · 13,560 output

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

## God Nodes (most connected - your core abstractions)
1. `api()` - 27 edges
2. `Select()` - 27 edges
3. `InvoiceRepository` - 22 edges
4. `DKube Dashboard v2 - Overview` - 19 edges
5. `ExpenseRepository` - 18 edges
6. `BudgetRepository` - 17 edges
7. `PLAN-v1.2.md — Finance v1.2 Feature Roadmap` - 16 edges
8. `dependencies` - 15 edges
9. `compilerOptions` - 15 edges
10. `cn()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `reel-prompt.md — Product Demo Reel Prompt` --semantically_similar_to--> `reel-ai-tool-brief.md — AI Video Tool Onboarding Brief`  [INFERRED] [semantically similar]
  reel-prompt.md → reel-ai-tool-brief.md
- `PostgreSQL database dclaw_finance 10Gi persistence` --semantically_similar_to--> `PostgreSQL 16`  [INFERRED] [semantically similar]
  helm/dclaw-finance/values.yaml → docs/reference/stack.md
- `Ingress nginx finance.dclawstack.io` --semantically_similar_to--> `nginx-ingress + cert-manager`  [INFERRED] [semantically similar]
  helm/dclaw-finance/values.yaml → docs/reference/architecture.md
- `Finance v1.2 Roadmap` --references--> `DClaw Finance Presentation Deck (PDF)`  [EXTRACTED]
  obsidian/Finance-v1.2-Roadmap.md → slides/DClaw-Finance-Deck.pdf
- `Finance v1.2 Roadmap` --references--> `DClaw Finance Infographic (PDF)`  [EXTRACTED]
  obsidian/Finance-v1.2-Roadmap.md → infographics/DClaw-Finance-Infographic.pdf

## Hyperedges (group relationships)
- **DClaw Finance AI Feature Stack: 9 AI features powered by llm_client routing to OpenRouter/Anthropic using haiku/sonnet model tiers** — concept_llm_client, concept_openrouter_provider, concept_anthropic_provider [EXTRACTED 1.00]
- **DClaw Finance v1.2 data model: Invoice, Expense, Budget, ChatMessage managed by Alembic migrations** — concept_invoice_entity, concept_expense_entity, concept_budget_entity [EXTRACTED 1.00]
- **One Convergence Design System applied to DClaw Finance frontend with INR formatting for Indian enterprise market** — concept_one_convergence_design_system, concept_dclaw_finance_app, concept_inr_formatting [EXTRACTED 1.00]
- **** — concept_signature_purple, concept_fraunces_typeface, concept_neutral_scale [INFERRED 0.85]
- **** — preview_comp_inputs, preview_comp_buttons, preview_comp_badges [INFERRED 0.95]
- **** — concept_dclaw_finance, concept_fastapi_backend, concept_dclaw_platform [INFERRED 0.85]
- **** — reference_architecture_frontend_component, reference_stack_nextjs, reference_stack_tailwindcss [EXTRACTED 1.00]
- **** — reference_architecture_backend_component, reference_stack_fastapi, reference_stack_sqlalchemy [EXTRACTED 1.00]
- **** — getting-started_installation_dclawapp_kind, getting-started_installation_dclaw_operator, getting-started_installation_cloudnativepg [EXTRACTED 1.00]
- **he_ai_layer_services** — obsidian_arch_llm_client_factory, obsidian_roadmap_openrouter, obsidian_roadmap_anthropic_sdk [EXTRACTED 1.00]
- **he_oc_design_system_outputs** — obsidian_design_oc_tokens, infographics_infograph_html, slides_deck_html [EXTRACTED 1.00]
- **he_v12_observability_triangle** — obsidian_finance_v12_roadmap, obsidian_finance_architecture, obsidian_finance_design_system [EXTRACTED 1.00]

## Communities (81 total, 11 thin omitted)

### Community 0 - "Frontend UI Pages"
Cohesion: 0.05
Nodes (90): KPI_CARDS, BudgetsPage(), CATEGORIES, categoryColors, InvoiceDetailPage(), statusColors, statusColors, AnomalyItem (+82 more)

### Community 1 - "Core App Concepts"
Cohesion: 0.06
Nodes (51): AI Expense Auto-Categorization Feature, Alembic — Database Migration Tool, Expense Anomaly Detection Feature, Anthropic — AI Provider (Fallback), Budget — v1.2 Data Entity, Budget Planning with AI Guardrails Feature, Cash Flow Forecast — Statistical 3-Month Projection, ChatMessage — v1.2 Data Entity (+43 more)

### Community 2 - "Invoice & AI Backend"
Cohesion: 0.07
Nodes (17): InvoiceItemRepository, InvoiceRepository, draft_reminder(), suggest_line_items(), test_repo_get_by_invoice_number(), test_repo_list_by_status(), add_invoice_item(), create_invoice() (+9 more)

### Community 3 - "Deployment & Configuration"
Cohesion: 0.05
Nodes (41): CORS_ORIGINS env var, DATABASE_URL env var, DClawApp CRD resource limits, Configuration Guide, NEXT_PUBLIC_API_URL env var, NEXT_PUBLIC_APP_NAME env var, REDIS_URL env var, DClaw Platform (+33 more)

### Community 4 - "Architecture & Docs"
Cohesion: 0.07
Nodes (40): DClaw Finance Infographic (HTML), DClaw Finance Infographic (PDF), Alembic Migrations (baseline + v1.2), API Surface v1.2 (/api/v1/*), claude-haiku-4-5 (categorisation/OCR/fast tasks), claude-sonnet-4-6 (reports/NL chat/reasoning), Data Models (Invoice, InvoiceItem, Expense, Budget, ChatMessage), FastAPI Backend (port 8096) (+32 more)

### Community 5 - "Obsidian Plugin Config"
Cohesion: 0.06
Nodes (31): audio-recorder, backlink, bases, bookmarks, canvas, command-palette, daily-notes, editor-status (+23 more)

### Community 6 - "Helm Kubernetes Chart"
Cohesion: 0.08
Nodes (32): Helm Chart dclaw-finance v0.1.0 (app chart), Helm Values dclaw-finance (app chart), App image ghcr.io/dclawstack/dclaw-finance, Ingress nginx finance.dclawstack.io, PostgreSQL database dclaw_finance 10Gi persistence, Resource limits (500m CPU, 512Mi memory), ClusterIP service port 8100, Bearer token authentication (+24 more)

### Community 7 - "Obsidian Workspace Settings"
Cohesion: 0.07
Nodes (29): active, bases:Create new base, canvas:Create new canvas, command-palette:Open command palette, daily-notes:Open today's daily note, graph:Open graph view, switcher:Open quick switcher, templates:Insert template (+21 more)

### Community 8 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, autoprefixer, class-variance-authority, clsx, lucide-react, next, postcss, @radix-ui/react-label (+20 more)

### Community 9 - "AI Chat & LLM Layer"
Cohesion: 0.11
Nodes (18): ChatMessage, ChatRepository, agentic_loop(), _ant_loop(), chat(), chat_vision(), _m(), _or_loop() (+10 more)

### Community 10 - "Reports & API Schemas"
Cohesion: 0.18
Nodes (18): BaseModel, ExpenseBase, ExpenseCreate, ExpenseResponse, ExpenseUpdate, InvoiceBase, InvoiceCreate, InvoiceResponse (+10 more)

### Community 11 - "DKube MLOps Dashboard"
Cohesion: 0.11
Nodes (24): Alert: churn-xgb-sweep failed (OOM at step 12 of 40), Alert: GPU quota 80% used (us-east-1, resets Sun 00:00 UTC), Alert: resnet-50 v3 ready to promote (+1.2pt accuracy over v2), Alerts Panel (3 active), UI Component: Ask DKube AI Button, Chart: GPU Utilization 7 Days (Training vs Inference), DKube Dashboard v2 - Overview, GPU Quota: 34/64 (53%) (+16 more)

### Community 12 - "Frontend Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 13 - "Budget & Expense Models"
Cohesion: 0.16
Nodes (12): Budget, Expense, BudgetRepository, budget_status(), BudgetCreate, BudgetResponse, BudgetUpdate, create_or_update_budget() (+4 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "Obsidian App Settings"
Cohesion: 0.12
Nodes (15): alwaysUpdateLinks, attachmentFolderPath, defaultViewMode, foldHeading, foldIndent, legacyEditor, livePreview, newFileFolderPath (+7 more)

### Community 16 - "Expense AI Categorizer"
Cohesion: 0.16
Nodes (8): ExpenseRepository, suggest_category(), categorize_expense(), create_expense(), delete_expense(), get_expense(), list_expenses(), update_expense()

### Community 17 - "Analytics & Anomaly Detection"
Cohesion: 0.14
Nodes (6): detect_anomalies(), Select(), client_profitability(), get_dashboard(), get_trends(), get_anomalies()

### Community 18 - "OC Design Tokens"
Cohesion: 0.17
Nodes (15): Accent Colors (Cobalt #1F3FBF, Ember #C2410C, Warm Paper #FAF8F4), DKube Pipeline — ML Training Orchestration, OC/DKube Design System, Semantic Color System (Success/Warning/Error/Info), Signature Purple (#7030A0) — OC Primary Brand Color, DKube UI Kit — React App Entry Point, DKube UI Kit README, colors-accents.html — Accent Colors Preview (Cobalt, Ember, Warm Paper) (+7 more)

### Community 19 - "Brand Hero Screens"
Cohesion: 0.15
Nodes (14): Architecture Section, Brand Guidelines, Color Section, Components Section, Cover Section, Design System, Grid Section, System of Record for Identity (+6 more)

### Community 20 - "Demo Seed Data"
Cohesion: 0.31
Nodes (10): build_expenses(), build_invoices(), delete_all(), _due_date(), _exp(), _invoice_status(), main(), post() (+2 more)

### Community 21 - "Logo System Docs"
Cohesion: 0.27
Nodes (10): Marks, Clear-Space, Misuse Guidelines, Glyph Only Logo Variant (Fig. 06), 03-brand-hero-v2 (Brand Hero Screenshot), Logo System (§ 02), Monochrome Logo Variant (Fig. 05), One Convergence Brand Identity, One Convergence — Primary Mark (02.1), Primary Logo Variant (Fig. 03 — On Light / Default) (+2 more)

### Community 22 - "DKube Dashboard v1"
Cohesion: 0.29
Nodes (10): Alerts Panel (3 active alerts: pipeline failure, GPU quota warning, model promotion), Ask DKube AI Button (AI assistant CTA in top nav), GPU Quota Sidebar Widget (34/64, 53%), GPU Utilization Line Chart (7 days, Training vs Inference), Infrastructure Navigation (Clusters, GPU Pools), KPI Summary Cards (Active Pipelines, Models in Registry, GPU Hours, P99 Inference), DKube Dashboard Overview Screen, Purple Primary Design Theme (brand color, nav highlights, CTA buttons) (+2 more)

### Community 24 - "Logo Guidelines"
Cohesion: 0.44
Nodes (9): Clear-Space Rule for OC Logo, One Convergence Glyph Only Logo Variant, Logo System — Section 02, Logo Misuse Guidelines, One Convergence Monochrome Logo Variant, One Convergence Brand Identity, One Convergence Primary Mark (02.1), One Convergence Reversed Mark — On Ink Dark Surfaces (+1 more)

### Community 25 - "Database Migrations"
Cohesion: 0.29
Nodes (6): Run migrations in 'offline' mode.      This configures the context with just a U, In this scenario we need to create an Engine     and associate a connection with, Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 26 - "Invoice Data Models"
Cohesion: 0.29
Nodes (5): Base, DeclarativeBase, Base, Invoice, InvoiceItem

### Community 27 - "DKube Brand Visuals"
Cohesion: 0.39
Nodes (8): DKube Brand Color — Purple, DKube — Flagship Product Mark, Brand DKube Section Screenshot, DKube Glyph Only — Favicon / App Icons, DKube Logo — Monochrome (Single-Color / Print & Technical), DKube Logo — Primary (Light/Default), DKube Logo — Reversed (Dark Surfaces), SVG Vector Master Format

### Community 28 - "Color Palette System"
Cohesion: 0.48
Nodes (7): OC Design System v3 - Primary Purple Scale, Brand Color Philosophy - Purple dominant, white/ink structural, other hues signal state only, OC Purple Light 300 (#B999FF), OC Purple 500 - Signature Primary (#9057FF), OC Purple Dark 700, Primary Purple Scale (Section 03.1), WCAG 2.1 Contrast Ratios

### Community 29 - "Brand Architecture"
Cohesion: 0.33
Nodes (7): AI/MLOps Platform, DKube, Enterprise Audience, Brand Architecture v2 (Image), One Convergence, Parent Brand, Practitioner Audience

### Community 30 - "DKube Logo Variants"
Cohesion: 0.62
Nodes (7): DKube Brand Cube — Flagship Product Mark, DKube 3D Cube Brand Mark (Geometric Cube Logomark), DKube Glyph Only — Favicon & App Icons, DKube Logo — Monochrome (Single-Color, Print & Technical), DKube Logo — Primary (Light/Default), DKube Logo — Reversed (Ink/Dark Surfaces), SVG Vector Master — DKube Product Mark

### Community 31 - "OC Official Logo"
Cohesion: 0.6
Nodes (6): One Convergence (Brand), Purple Brand Color (#7B61FF / medium purple), OC Logo Official (One Convergence), OC Logomark (interlocking O and C letterforms), Trademark Symbol (TM), One Convergence Wordmark (sans-serif, TM mark)

### Community 32 - "Backend Tech Stack"
Cohesion: 0.4
Nodes (6): Backend Python Requirements, DClaw Finance — Financial Modeling & Risk Analysis Platform, DClaw Platform — Unified AI App Ecosystem, FastAPI + SQLAlchemy Async Backend, DClaw Finance Quickstart Guide, DClaw Finance Documentation README

### Community 33 - "Typography System"
Cohesion: 0.4
Nodes (6): Fraunces — Soft-serif Display Typeface, Inter — UI & Body Sans-serif Font, JetBrains Mono — Code & Metadata Monospace Font, type-fraunces.html — Fraunces Display Typeface Preview, type-inter-mono.html — Inter & JetBrains Mono Typography Preview, type-scale.html — Typography Scale Preview

### Community 35 - "Color Design Final"
Cohesion: 0.6
Nodes (6): Brand Color Philosophy — Purple brand, white/ink structural, hue signals state, OC Design System Color Palette — Final, OC Purple 700 — Dark (#9057FF dark variant), OC Purple 300 — Light (#B999FF), OC Purple 500 — Primary / Signature (#9057FF), WCAG 2.1 Contrast Ratios for Purple Scale

### Community 36 - "Brand Hero v2 Screens"
Cohesion: 0.53
Nodes (6): Brand Hero v2 - Brand Architecture, Brand Architecture - One Company, One Platform, One Visual System, DKube (Flagship AI/MLOps Platform), Enterprise Audience (One Convergence target), One Convergence (Parent Brand), Practitioner Audience (DKube target)

### Community 37 - "Brand Guidelines Final"
Cohesion: 0.47
Nodes (6): Brand Usage Guidelines - Apply When, Corporate Communications Use Case, DKube Brand (Practitioner-Facing), 02-final.png (Design System Screenshot - Parent Brand), One Convergence Logo (Parent Brand Wordmark), Parent Brand - One Convergence

### Community 38 - "Typography Hero"
Cohesion: 0.33
Nodes (6): Brand Hero v2 - Typography Section, Inter (Sans UI) Typeface, JetBrains Mono (Code) Typeface, Manrope (Display Sans) Typeface, Purple Brand Accent Color, Typography Design System Section (§04)

### Community 39 - "Logo Design Iterations"
Cohesion: 0.6
Nodes (6): Custom SVG Glyph Version, Glyph Design Iteration Decision, OC Glyph Comparison Screenshot, OC Glyph (interlocking circles mark), One Convergence Official Logo (OC glyph + wordmark), One Convergence Brand Identity

### Community 40 - "OC Logo Uploads"
Cohesion: 0.6
Nodes (6): One Convergence (Brand), Purple Brand Color (#7B61FF approx), One Convergence Logo, OC Lettermark Symbol, Trademark (TM) Registration, Sans-Serif Wordmark Typography

### Community 43 - "Docs Nav Config"
Cohesion: 0.4
Nodes (4): app_id, nav, title, version

### Community 45 - "Brand Guidelines Cover"
Cohesion: 0.5
Nodes (5): Brand & Design Team, One Convergence (Stewardship), Brand Guidelines Document Vol. 01 2026, One Convergence Brand Guidelines Cover Page, Design System Navigation (Cover, Architecture, Logo, Color, Type, Grid, Components, Voice), One Convergence Brand

### Community 46 - "OC Corporate Usage"
Cohesion: 0.6
Nodes (5): Apply When: Corporate Site, Careers, Press Releases, Corporate Usage Guidance — The Company, One Convergence Logo (OC Symbol, Purple), One Convergence Wordmark, Parent Brand — One Convergence (Fig. 01)

### Community 47 - "Glyph Iteration v2"
Cohesion: 0.8
Nodes (5): Custom SVG Reproduction of OC Glyph, Glyph Comparison: Official vs Custom SVG, OC Glyph Compare 2 (Screenshot), One Convergence Official Logo (OC Glyph), One Convergence Brand Identity

### Community 50 - "Financial Forecasting"
Cohesion: 0.83
Nodes (3): _exponential_smooth(), get_forecast(), _monthly_totals()

### Community 51 - "Spacing & Grid"
Cohesion: 0.5
Nodes (4): 12-Column Grid Layout (1320px max-width, 32px gutter), 4px-base Spacing Scale (space-1 to space-16), spacing-grid.html — 12-Column Grid Preview (1320px max-width), spacing-scale.html — Spacing Scale Preview (4px to 64px)

### Community 52 - "Backend Settings"
Cohesion: 0.67
Nodes (3): BaseSettings, get_settings(), Settings

### Community 53 - "Brand Architecture Preview"
Cohesion: 0.5
Nodes (4): Brand Architecture: One Convergence (Parent) + DKube (Product), brand-architecture.html — Brand Architecture Preview (OC Parent / DKube Product), brand-dkube-mark.html — DKube Brand Mark Preview, brand-oc-mark.html — One Convergence Logo Mark Preview

### Community 54 - "Glyph Iteration v3"
Cohesion: 1.0
Nodes (4): Custom SVG OC Glyph Reproduction, OC Glyph Compare 3 - Logo Design Iteration, One Convergence Official Logo (OC glyph + wordmark), One Convergence Brand Identity

### Community 55 - "Glyph Iteration v4"
Cohesion: 1.0
Nodes (4): Custom SVG OC Glyph (design iteration), OC Glyph Compare 4 - Logo Version Comparison, One Convergence Brand Identity, One Convergence Official Logo (OC glyph + wordmark)

### Community 56 - "Glyph Iteration v5"
Cohesion: 1.0
Nodes (4): Custom SVG OC Glyph (design iteration), OC Glyph Compare 5 - Official vs Custom SVG, One Convergence Design System, One Convergence Official Logo (OC glyph + wordmark)

### Community 59 - "AI CI Workflows"
Cohesion: 0.67
Nodes (3): anthropics/claude-code-action@v1 — GitHub Action, claude.yml — Claude Code Agentic Workflow, claude-code-review.yml — Claude Code Review Workflow

## Knowledge Gaps
- **283 isolated node(s):** `id`, `type`, `children`, `direction`, `id` (+278 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## TestSprite AI Testing — 2026-05-23

> Results appended after automated test run. Full reports in `testsprite_tests/`.

### Backend: 9/10 passed (90%)
- All Invoice CRUD endpoints pass
- AI endpoints (suggest-items, reminder-draft) pass via `dry_run=true`
- TC009 (update line item) fails due to test fixture missing required invoice fields — not an API regression
- **Critical gap:** no authentication on any `/api/v1/*` endpoint

### Frontend: 20/36 passed (56%)
Run across 3 batches against a production Next.js build (`npm run build && npm start`).

**Confirmed app bugs found:**
1. `BudgetRepository` — DELETE budget endpoint broken
2. Invoice creation form missing `invoice_number` field → 422 on submit
3. `/clients/profitability` page missing (404)
4. Anomaly detection rows not clickable — no drill-down
5. Dashboard KPI cards missing profit percentage metric
6. Report month input: `min/max` HTML attribute present but invalid month hits 500 instead of client-side error
7. Forecast page missing current vs projected comparison
8. Dashboard shows no empty state when data is absent

**Nodes most affected by findings:**
- `BudgetRepository` (Community 13 — Budget & Expense Models)
- `InvoiceCreate` / invoice creation form (Community 10 — Reports & API Schemas)
- `client_profitability()` (Community 17 — Analytics & Anomaly Detection)
- `get_forecast()` (Community 50 — Financial Forecasting)
- `get_dashboard()` (Community 17 — Analytics & Anomaly Detection)

---

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Select()` connect `Analytics & Anomaly Detection` to `Frontend UI Pages`, `Invoice & AI Backend`, `AI Chat & LLM Layer`, `Reports & API Schemas`, `Budget & Expense Models`, `Expense AI Categorizer`, `Financial Forecasting`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `cn()` connect `Frontend UI Pages` to `Frontend Dependencies`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `InvoiceRepository` connect `Invoice & AI Backend` to `Reports & API Schemas`, `Invoice Data Models`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `Select()` (e.g. with `_monthly_totals()` and `get_dashboard()`) actually correct?**
  _`Select()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `InvoiceRepository` (e.g. with `SuggestItemsRequest` and `Invoice`) actually correct?**
  _`InvoiceRepository` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `ExpenseRepository` (e.g. with `CategorizationRequest` and `Expense`) actually correct?**
  _`ExpenseRepository` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `id`, `type`, `children` to the rest of the system?**
  _283 weakly-connected nodes found - possible documentation gaps or missing edges._