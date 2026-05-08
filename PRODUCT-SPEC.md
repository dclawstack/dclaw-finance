# PRODUCT-SPEC: Finance

## Overview

**App Name:** Finance
**Domain:** Invoicing, Expenses, and Bookkeeping
**Target User:** Small business owners, accountants, finance teams

## Core Entities

### Invoice
```
Invoice
├── id: UUID (PK)
├── invoice_number: str (unique, required)
├── client_name: str (required)
├── client_email: str (required)
├── issue_date: date (required)
├── due_date: date (required)
├── status: enum ["draft", "sent", "paid", "overdue", "cancelled"] (default: "draft")
├── subtotal: float (required, default 0)
├── tax_rate: float (default 0)
├── tax_amount: float (default 0)
├── total: float (required, default 0)
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### InvoiceItem
```
InvoiceItem
├── id: UUID (PK)
├── invoice_id: UUID (FK → Invoice, ondelete=CASCADE)
├── description: str (required)
├── quantity: float (required, default 1)
├── unit_price: float (required, default 0)
├── amount: float (required, default 0)
├── created_at: datetime
└── updated_at: datetime
```

### Expense
```
Expense
├── id: UUID (PK)
├── category: enum ["office", "travel", "software", "marketing", "salary", "other"] (required)
├── description: str (required)
├── amount: float (required, default 0)
├── date: date (required)
├── vendor: str (optional)
├── receipt_url: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

## User Stories / Screens

### Screen 1: Dashboard
- Summary cards: total revenue (paid invoices), outstanding invoices, total expenses, net profit
- Monthly revenue vs expenses chart
- Recent invoices list
- Overdue invoices alert

### Screen 2: Invoices
- Table view with pagination, search by invoice number/client
- Status filter (draft/sent/paid/overdue/cancelled)
- "Create Invoice" button → multi-step form with line items
- Download PDF action (mock for v1.0)
- Send email action (mock for v1.0)

### Screen 3: Invoice Detail
- Invoice header with client info, dates, status
- Line items table with subtotal/tax/total
- Status change buttons (Mark as Sent, Mark as Paid, Cancel)
- Edit / delete

### Screen 4: Expenses
- Table view with pagination, search
- Category filter with color-coded badges
- "Add Expense" form
- Monthly total by category

### Screen 5: Expense Detail
- Expense info card
- Edit / delete
- Receipt image placeholder

## AI Features

- **Expense categorization:** Auto-suggest category based on description/vendor
- **Cash flow prediction:** Predict next month's cash position based on historical data
- **Overdue risk:** Flag invoices likely to become overdue

## API Endpoints (v1.0)

```
GET    /api/v1/invoices           → List invoices
POST   /api/v1/invoices           → Create invoice
GET    /api/v1/invoices/{id}      → Get invoice
PUT    /api/v1/invoices/{id}      → Update invoice
DELETE /api/v1/invoices/{id}      → Delete invoice
GET    /api/v1/invoices/{id}/items → List invoice items
POST   /api/v1/invoices/{id}/items → Add invoice item
PUT    /api/v1/invoice-items/{id} → Update invoice item
DELETE /api/v1/invoice-items/{id} → Delete invoice item
GET    /api/v1/expenses           → List expenses
POST   /api/v1/expenses           → Create expense
GET    /api/v1/expenses/{id}      → Get expense
PUT    /api/v1/expenses/{id}      → Update expense
DELETE /api/v1/expenses/{id}      → Delete expense
GET    /api/v1/dashboard          → Dashboard stats
```

## Non-Functional Requirements

- Backend tests: 70%+ coverage
- Frontend: Responsive, Tailwind + shadcn/ui
- Docker: All services start with `docker compose up -d`
- No mock data — everything persisted to PostgreSQL
