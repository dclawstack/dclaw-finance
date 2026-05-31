# DClaw Finance — Architecture Diagrams

> Source diagrams for infographic regeneration. Rendered with Mermaid.
> Version: 1.4 · Updated: 2026-05-31

---

## 1. System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        B[Browser / App]
    end

    subgraph Frontend["Frontend (Next.js 14+)"]
        LP[Landing Page /]
        DB[Dashboard /dashboard]
        INV[Invoices /invoices]
        EXP[Expenses /expenses]
        CF[Cash Flow /cash-flow]
        FC[Forecast /forecast]
        RPT[Reports /reports]
        BUD[Budgets /budgets]
        CLI[Clients /clients]
        CHT[Ask AI /chat]
    end

    subgraph Backend["Backend (FastAPI · Port 8096)"]
        API[API Router /api/v1]
        AUTH[Auth Middleware JWT/Logto]
        subgraph Services["Services Layer"]
            LLM[llm_client.py]
            CAT[ai_categorizer]
            OCR[receipt_ocr]
            WRT[ai_writer]
            ANO[anomaly_detector]
            RPG[report_generator]
            NLQ[nl_query]
        end
        subgraph Repos["Repository Layer"]
            IR[invoice_repo]
            ER[expense_repo]
            BR[budget_repo]
            CR[chat_repo]
        end
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL 16\ndclaw_finance)]
    end

    subgraph AI["AI Providers"]
        OR[OpenRouter\nclaude-haiku-4-5\nclaude-sonnet-4-6]
        AN[Anthropic Direct]
        OL[Ollama / Local]
    end

    B --> Frontend
    Frontend --> API
    API --> AUTH
    AUTH --> Services
    AUTH --> Repos
    Repos --> PG
    LLM --> OR
    LLM --> AN
    LLM --> OL
```

---

## 2. AI Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant SV as Service
    participant LC as llm_client
    participant AI as AI Provider

    U->>FE: Action (type/upload/click)
    FE->>BE: POST /api/v1/expenses/categorize
    BE->>SV: ai_categorizer.suggest()
    SV->>LC: chat(prompt, model="claude-haiku-4-5")
    LC->>AI: OpenRouter / Anthropic API
    AI-->>LC: {category, confidence}
    LC-->>SV: parsed response
    SV-->>BE: {suggested_category, confidence}
    BE-->>FE: JSON response
    FE->>U: Pre-fill select + "AI suggested 94%" badge

    Note over BE,AI: On failure: try/except → return {} without AI
    Note over FE,BE: ?dry_run=true skips AI call entirely
```

---

## 3. Cash Flow Forecast Pipeline

```mermaid
flowchart LR
    subgraph Input["Historical Data (6 months)"]
        I1[Paid Invoice Totals\nfunc.sum by month]
        E1[Expense Totals\nfunc.sum by month]
    end

    subgraph Smoothing["Exponential Smoothing"]
        ES[α = 0.3\nSmoothed series]
        GR[Growth Rate\ncapped ±20%]
    end

    subgraph Output["3-Month Projection"]
        P1[Month+1\nRevenue · Expenses · Profit]
        P2[Month+2]
        P3[Month+3]
        CB[Confidence Band\n±10% of projected]
    end

    subgraph Extended["Extended Forecast Endpoints"]
        SC[/forecast/scenarios\n5 variants]
        TS[/forecast/three-statement\nIS + CF + BS]
        DR[/forecast/drivers\nClients · Win rate]
        SN[/forecast/sensitivity\n4-point table]
        MP[/forecast/mape\nAccuracy vs actuals]
    end

    I1 --> ES
    E1 --> ES
    ES --> GR
    GR --> P1 --> P2 --> P3
    P1 --> CB
    P3 --> Extended
```

---

## 4. LLM Provider Selection

```mermaid
flowchart TD
    S[LLM Request] --> A{OPENROUTER_API_KEY\nset?}
    A -->|Yes| OR[OpenAI SDK\nhttps://openrouter.ai/api/v1\nModels: anthropic/claude-*]
    A -->|No| B{ANTHROPIC_API_KEY\nset?}
    B -->|Yes| AN[Anthropic SDK\nhttps://api.anthropic.com\nDirect models]
    B -->|No| C{OLLAMA_URL\nset?}
    C -->|Yes| OL[Ollama\nlocalhost:11434\nllama3.1 or custom]
    C -->|No| ERR[RuntimeError\nat call time]

    OR --> R[Response]
    AN --> R
    OL --> R
    R --> TC[try/except wrapper]
    TC -->|Success| D[Return AI result]
    TC -->|Failure| E[Return data without AI]
```

---

## 5. Docker Compose Service Map

```mermaid
graph LR
    subgraph dc["docker compose up"]
        PG[(postgres:16-alpine\nPort 5434:5432\ndclaw_finance DB)]
        BE[backend\npython:3.11-slim\nPort 8096\nnon-root appuser]
        FE[frontend\nnode:20-alpine\nPort 3007]
    end

    FE -->|NEXT_PUBLIC_API_URL| BE
    BE -->|DATABASE_URL| PG
    PG -.->|healthcheck| BE
    BE -.->|healthcheck| FE

    note1["Backend healthcheck:\npython urllib.request.urlopen()"]
    note2["Frontend healthcheck:\nwget -q --spider"]
```

---

## 6. Data Model (Entity Relationships)

```mermaid
erDiagram
    Invoice {
        UUID id PK
        string invoice_number UK
        string client_name
        string client_email
        date issue_date
        date due_date
        enum status
        float subtotal
        float tax_rate
        float tax_amount
        float total
        string notes
    }
    InvoiceItem {
        UUID id PK
        UUID invoice_id FK
        string description
        float quantity
        float unit_price
        float amount
    }
    Expense {
        UUID id PK
        enum category
        string description
        float amount
        date date
        string vendor
        string receipt_url
        string ai_suggested_category
    }
    Budget {
        UUID id PK
        string category
        float monthly_limit
        int year
        int month
    }
    ChatMessage {
        UUID id PK
        string role
        text content
        datetime created_at
    }

    Invoice ||--o{ InvoiceItem : "has items"
```

---

## 7. Screen Navigation Map

```mermaid
graph TD
    LAND[Landing /]
    DASH[Dashboard /dashboard]
    INV[Invoices /invoices]
    INVN[New Invoice /invoices/new]
    INVD[Invoice Detail /invoices/id]
    EXP[Expenses /expenses]
    EXPN[New Expense /expenses/new]
    CF[Cash Flow /cash-flow]
    FC[Forecast /forecast]
    RPT[Reports /reports]
    BUD[Budgets /budgets]
    CLI[Clients /clients]
    CHT[Ask AI /chat]

    LAND --> DASH
    LAND --> INV
    LAND --> EXP
    LAND --> CF
    LAND --> FC
    LAND --> RPT
    LAND --> BUD
    LAND --> CLI
    LAND --> CHT

    INV --> INVN
    INV --> INVD
    EXP --> EXPN

    INVD -->|AI: Draft Reminder| INVD
    INVN -->|AI: Suggest Items| INVN
    EXPN -->|AI: OCR + Categorise| EXPN
    EXP -->|AI: Anomaly Explain| EXP
    RPT -->|AI: Executive Summary| RPT
    BUD -->|AI: Breach Suggestion| BUD
    CLI -->|AI: Client Insight| CLI
    CHT -->|AI: Tool-use Q&A| CHT
```

---

## 8. AI Feature Cost Map

| Feature | Model | Tokens | Caching |
|---------|-------|--------|---------|
| Expense categorisation | haiku-4-5 | ~50 | DB column `ai_suggested_category` |
| Receipt OCR | haiku-4-5 (vision) | ~1k | None |
| Invoice reminder draft | sonnet-4-6 | ~250 | None |
| Line-item suggestions | haiku-4-5 | ~200 | None |
| Anomaly explanations | haiku-4-5 | ~200 (batch) | 1h in-memory |
| Monthly report | sonnet-4-6 | ~1k | None |
| Budget breach suggestion | haiku-4-5 | ~150 | None |
| Client profitability insight | haiku-4-5 | ~300 (batch) | 24h in-memory |
| NL chat tool-use | sonnet-4-6 | ~500–2k | Chat history in DB |

All AI endpoints: `?dry_run=true` → mock response, zero token spend.
