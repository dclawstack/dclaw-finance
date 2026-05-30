# DClaw Finance — Test Failure Analysis
**Run date:** 2026-05-23  
**Analysed:** 2026-05-28  
**Scope:** 10 backend tests · 36 frontend tests  
**Result:** Backend 9/10 (90%) · Frontend 20/36 (56%)

---

## Contents

1. [Summary](#summary)
2. [Backend Failures](#backend-failures)
   - [TC009 — Update line item (fixture bug)](#tc009--put-apiv1invoicesiditems-update-line-item-)
3. [Frontend — Genuine App Bugs](#frontend--genuine-app-bugs)
   - [TC025 — Budget delete does nothing (HIGH)](#tc025--budget-delete-button-does-nothing-high-)
   - [TC001 — Invoice creation 422 (HIGH)](#tc001--invoice-creation-form--422-high-)
   - [TC034 — Month=13 causes 500 (MEDIUM)](#tc034--month13-hits-backend-and-returns-500-medium-)
   - [TC005 — Dashboard profit % missing (MEDIUM)](#tc005--dashboard-net-profit-card-missing--change-indicator-medium-)
   - [TC016 — Anomaly rows not clickable (MEDIUM)](#tc016--expense-anomaly-rows-not-clickable-medium-)
   - [TC018 & TC029 — /clients/profitability 404 (HIGH)](#tc018--tc029--clientsprofitability-returns-404-high-)
4. [Test Config Issues (not app bugs)](#test-config-issues-not-app-bugs)
5. [Proactive Gaps & Best Practices](#proactive-gaps--best-practices)
6. [Fix Priority Order](#fix-priority-order)

---

## Summary

| Category | Count | Severity |
|---|---|---|
| Backend test fixture bugs | 1 | LOW — test only, API is clean |
| Frontend genuine app bugs | 6 | 3× HIGH · 2× MEDIUM · 1× LOW |
| Frontend test config issues | 7 | Not app bugs — update test plans |

Immediate actions before next test run:
1. Fix `api()` 204 handling — unblocks TC025 (budget delete)
2. Add client-side month validation — unblocks TC034 (reports 500)
3. Fix invoice line item guard — reduces TC001 failure rate
4. Add `/clients/profitability` redirect — unblocks TC018, TC029

---

## Backend Failures

---

### TC009 — PUT /api/v1/invoices/{id}/items — Update line item ❌

**Severity:** LOW — test fixture issue; the API endpoint is functional  
**File:** `testsprite_tests/failed_tests/test_files/TC009_put_api_v1_invoices_invoice_id_items_item_id_update_line_item.py`

#### 1. Error
```
AssertionError: Invoice creation in TC009 fixture returned 422 Unprocessable Entity
```

#### 2. Root Cause

The fixture sends a rogue `amount` field that is not part of the backend `InvoiceCreate` Pydantic schema:

```python
# TC009 test file, line 17
invoice_payload = {
    "client_name": "Test Client TC009",
    "client_email": "testclient009@example.com",
    "invoice_number": "INV-009",
    "issue_date": "2030-11-30",
    "amount": 1000.0,          # ← not in InvoiceCreate schema
    "due_date": "2030-12-31"
}
```

If the schema uses `model_config = ConfigDict(extra='forbid')`, this causes an immediate 422. TC008 (add item) and TC010 (delete item) pass because they share no fixture with TC009 and don't send `amount`. The API endpoint itself is not broken.

#### 3. Blast Radius

Only this test file. No source code changes needed.

#### 4. Fix — test file only

```python
invoice_payload = {
    "client_name": "Test Client TC009",
    "client_email": "testclient009@example.com",
    "invoice_number": "INV-009",
    "issue_date": "2030-11-30",
    "due_date": "2030-12-31"
    # removed: "amount": 1000.0
}
```

---

## Frontend — Genuine App Bugs

---

### TC025 — Budget delete button does nothing [HIGH] ❌

**Severity:** HIGH — data appears to persist after delete; UI never refreshes  
**Files affected:**
- `frontend/src/lib/api.ts` — root cause
- `frontend/src/app/budgets/page.tsx` — missing error handling

#### 1. Error
```
Budget card "Remove" button was visible and clickable.
Clicking Remove did nothing — budget card remained in DOM after repeated clicks.
No network request to DELETE /api/v1/budgets/{id} was observed.
No error thrown; click silently ignored.
```

#### 2. Root Cause

The backend budget delete route returns **204 No Content** with an empty body:

```python
# backend/app/api/v1/budgets.py:82
@router.delete("/{budget_id}", status_code=204)
async def delete_budget(budget_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
```

The shared `api()` helper in `src/lib/api.ts` **always** calls `res.json()` regardless of status code:

```typescript
// src/lib/api.ts:123
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ... });
  if (!res.ok) { throw ... }
  return (await res.json()) as T;   // ← called even on 204, throws SyntaxError
}
```

`res.json()` on a 204 No Content (empty body) throws:
```
SyntaxError: Unexpected end of JSON input
```

This propagates up to `handleDelete` in `budgets/page.tsx`, which has **no try/catch**:

```typescript
// budgets/page.tsx:98
const handleDelete = async (id: string) => {
  await deleteBudget(id);   // ← SyntaxError thrown here
  setEditingId(null);       // ← never reached
  await load();             // ← never reached
  await loadStatus();       // ← never reached
};
```

React silently drops uncaught errors from async event handlers. The DELETE **does fire** and the record **is deleted** from the database — but `load()` is never called, so the stale card remains in the DOM for the rest of the session.

The test runner's report of "no network request observed" is a timing/capture issue; the request is sent and succeeds at the backend level.

#### 3. Blast Radius

The same `api()` function is called by `deleteInvoice`, `deleteExpense`, and `deleteBudget`. All three are vulnerable to this bug. Other DELETE tests appear to pass only because the test environment masked the stale-UI consequence. The fix must be applied at the `api()` layer to cover all three.

#### 4. Fix

**`frontend/src/lib/api.ts` — handle 204 responses:**

```typescript
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  if (res.status === 204) return undefined as T;   // ← ADD: skip JSON parse on empty body
  return (await res.json()) as T;
}
```

**`frontend/src/app/budgets/page.tsx` — add error handling to handleDelete:**

```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteBudget(id);
    setEditingId(null);
    await load();
    await loadStatus();
  } catch (e: unknown) {
    alert(`Failed to remove budget: ${e instanceof Error ? e.message : "error"}`);
  }
};
```

---

### TC001 — Invoice creation form → 422 [HIGH] ❌

**Severity:** HIGH — core invoice creation workflow broken in headless/automated context  
**Files affected:**
- `frontend/src/app/invoices/new/page.tsx` — missing client-side guard + cosmetic $ bug

#### 1. Error
```
Repeated "Failed to create invoice" alerts after form submission.
App DOM emptied after submission.
Invoice did not appear in the list.
```

#### 2. Root Cause

The form initialises with a default blank line item:

```typescript
// invoices/new/page.tsx:32
const [items, setItems] = useState<LineItem[]>([
  { description: "", quantity: 1, unit_price: 0 }  // ← description is empty
]);
```

When submitted without filling in the description field, the payload sent is:
```json
{
  "invoice_number": "...",
  "items": [{ "description": "", "quantity": 1, "unit_price": 0 }]
}
```

The backend validates `description` as a required non-empty string. This returns a **422 Unprocessable Entity**, which triggers `alert("Failed to create invoice.")` in the catch block.

In headless test environments, native HTML `required` validation **does not block programmatic submission** via click events — only browser-native submit events enforce it. The test runner clicks Submit with the default empty-description state, bypassing HTML validation entirely.

The DOM-empty effect is the headless runner auto-dismissing the repeated `alert()` calls and re-triggering submission, causing a loop.

**Secondary bug:** The line item amount display and totals use `$` instead of `₹`:
```typescript
// page.tsx:174 — should use formatINR()
<div className="w-24 pb-2 text-right text-sm text-slate-600">
  ${(item.quantity * item.unit_price).toFixed(2)}   {/* ← wrong currency */}
</div>
```

#### 3. Blast Radius

- `frontend/src/app/invoices/new/page.tsx` — form validation and currency display
- Backend schema is correct; no changes needed there

#### 4. Fix

**`frontend/src/app/invoices/new/page.tsx` — add guard in handleSubmit:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (items.some((it) => !it.description.trim())) {
    alert("All line items must have a description.");
    return;
  }
  setSaving(true);
  try {
    await createInvoice({ ... });
    router.push("/invoices");
  } catch {
    alert("Failed to create invoice.");
    setSaving(false);
  }
};
```

**Fix INR currency display (same file):**

```typescript
// line 174 — line item amount column
- ${(item.quantity * item.unit_price).toFixed(2)}
+ {formatINR(item.quantity * item.unit_price)}

// lines 213-218 — footer
- <div>Subtotal: ${subtotal.toFixed(2)}</div>
- <div>Tax: ${taxAmount.toFixed(2)}</div>
- <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
+ <div>Subtotal: {formatINR(subtotal)}</div>
+ <div>Tax: {formatINR(taxAmount)}</div>
+ <div className="text-xl font-bold">Total: {formatINR(total)}</div>
```

Import `formatINR` from `@/lib/utils` (already imported on the dashboard page; confirm it's imported here).

---

### TC034 — Month=13 hits backend and returns 500 [MEDIUM] ❌

**Severity:** MEDIUM — API crash on invalid input; should be a 422  
**Files affected:**
- `frontend/src/app/reports/page.tsx` — no client-side guard
- `backend/app/api/v1/reports.py` — no Pydantic range validation

#### 1. Error
```
Submitting month=13 produced numerous auto-closed alerts with
"Failed to generate report: API error 500: Internal Server Error"
The Month input has min=1 max=12 attributes but no visible validation
message was shown. The form submitted the invalid value.
```

#### 2. Root Cause

The reports form uses a `<Button onClick>` pattern, not `<form onSubmit>`:

```typescript
// reports/page.tsx:68
<Button onClick={handleGenerate} disabled={loading}>
  {loading ? "Generating…" : "Generate Report"}
</Button>
```

`<Button onClick>` completely bypasses HTML form validation — `min` and `max` on the month `<Input>` are never enforced. `month=13` is passed directly to `generateMonthlyReport(year, 13)`.

The backend schema also has no range constraint:

```python
# backend/app/api/v1/reports.py:11
class MonthlySummaryRequest(BaseModel):
    year: int
    month: int   # ← no ge=1, le=12
```

`month=13` reaches `generate_monthly_summary(db, year, 13)`. The SQL aggregation returns nothing meaningful, and date/LLM formatting with month=13 causes an unhandled Python exception → 500.

#### 3. Blast Radius

- `frontend/src/app/reports/page.tsx` — missing guard
- `backend/app/api/v1/reports.py` — missing field constraints
- `backend/app/services/report_generator.py` — crashes on month=13 (no change needed after Pydantic fix)

#### 4. Fix

**`frontend/src/app/reports/page.tsx` — guard in handleGenerate:**

```typescript
const handleGenerate = async () => {
  if (month < 1 || month > 12) {
    alert("Month must be between 1 and 12.");
    return;
  }
  if (year < 2000 || year > 2099) {
    alert("Year must be between 2000 and 2099.");
    return;
  }
  setLoading(true);
  ...
```

**`backend/app/api/v1/reports.py` — Pydantic field constraints:**

```python
from pydantic import BaseModel, Field

class MonthlySummaryRequest(BaseModel):
    year: int = Field(ge=2000, le=2099)
    month: int = Field(ge=1, le=12)
```

This converts the 500 into a proper 422 if the frontend guard is ever bypassed.

---

### TC005 — Dashboard Net Profit card missing % change indicator [MEDIUM] ❌

**Severity:** MEDIUM — KPI card is visually incomplete; affects perceived product quality  
**Files affected:**
- `frontend/src/app/dashboard/page.tsx` — card rendering

#### 1. Error
```
Dashboard shows Revenue ₹39.05 Cr, Outstanding Invoices 6,
Expenses ₹29.41 Cr, Net Profit ₹9.64 Cr —
but the profit percent-change indicator is missing.
```

#### 2. Root Cause

The KPI cards are rendered from a static config array with no delta/trend fields:

```typescript
// dashboard/page.tsx:13
const KPI_CARDS = [
  { label: "Total Revenue",        key: "total_revenue"       ... },
  { label: "Outstanding Invoices", key: "outstanding_invoices" ... },
  { label: "Total Expenses",       key: "total_expenses"      ... },
  { label: "Net Profit",           key: "net_profit"          ... },
  // no delta field on any card
];
```

The `DashboardData` interface (`api.ts:47`) has no previous-period fields — no `prev_profit`, no `profit_change_pct`. The landing page hero mock (`page.tsx:329-338`) shows `delta: "+28%"` as a hardcoded value; the test may have expected this to also appear on the real dashboard.

Trend data is already fetched on the dashboard page (`getDashboardTrends()`), making previous-month profit computable without a backend change.

#### 3. Blast Radius

Frontend only. The trend endpoint already exists and is already called on this page — no new API needed.

#### 4. Fix

**`frontend/src/app/dashboard/page.tsx` — compute and display MoM profit delta:**

```typescript
// After trends load — add to the existing useEffect or derive from state:
const profitDelta = (() => {
  if (trends.length < 2) return null;
  const prev = trends[trends.length - 2];
  const curr = trends[trends.length - 1];
  const prevProfit = prev.revenue - prev.expenses;
  const currProfit = curr.revenue - curr.expenses;
  if (prevProfit === 0) return null;
  return ((currProfit - prevProfit) / Math.abs(prevProfit)) * 100;
})();
```

```tsx
// In the Net Profit KPI card render:
{key === "net_profit" && profitDelta !== null && (
  <p className={`mt-1 text-xs font-semibold tabular-nums ${
    profitDelta >= 0 ? "text-emerald-600" : "text-red-600"
  }`}>
    {profitDelta >= 0 ? "+" : ""}{profitDelta.toFixed(1)}% vs last month
  </p>
)}
```

---

### TC016 — Expense anomaly rows not clickable [MEDIUM] ❌

**Severity:** MEDIUM — anomaly list is display-only; no drill-down as spec requires  
**Files affected:**
- `frontend/src/app/expenses/page.tsx` — anomaly table rows

#### 1. Error
```
Anomaly list rendered correctly with anomaly entries.
Clicking an anomaly row did nothing — no modal, detail pane, or navigation.
No error thrown; click silently ignored.
```

#### 2. Root Cause

The anomaly `<TableRow>` elements have no `onClick` handler, no `cursor-pointer` styling, and no state to control expansion. The rows are purely presentational:

```tsx
// expenses/page.tsx:186
{anomalies.map((item) => (
  <TableRow key={item.expense.id}>   {/* ← no onClick, no interactivity */}
    <TableCell>{item.expense.date}</TableCell>
    ...
  </TableRow>
))}
```

The AI explanation is already rendered inline in the last `<TableCell>`, so adding drill-down means expanding a secondary row with the full explanation and a link to the expense.

#### 3. Blast Radius

Only `expenses/page.tsx`. No backend changes needed — all required data (`llm_explanation`, `expense.id`) is already in the `AnomalyItem` response.

#### 4. Fix

**`frontend/src/app/expenses/page.tsx`:**

Add expand state:
```typescript
const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);
```

Make rows clickable and add expand row:
```tsx
{anomalies.map((item) => (
  <>
    <TableRow
      key={item.expense.id}
      className="cursor-pointer hover:bg-slate-50"
      onClick={() =>
        setExpandedAnomaly(
          expandedAnomaly === item.expense.id ? null : item.expense.id
        )
      }
    >
      <TableCell>{item.expense.date}</TableCell>
      <TableCell>
        <Badge className={categoryColors[item.expense.category] || ""}>
          {item.expense.category}
        </Badge>
      </TableCell>
      <TableCell>{item.expense.vendor || "—"}</TableCell>
      <TableCell className="text-right tabular-nums">
        {formatINR(item.expense.amount)}
      </TableCell>
      <TableCell>
        <Badge className="bg-amber-100 text-amber-800">
          {item.zscore.toFixed(1)}σ
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-slate-400 italic">
        Click to expand
      </TableCell>
    </TableRow>
    {expandedAnomaly === item.expense.id && (
      <TableRow key={`${item.expense.id}-detail`}>
        <TableCell
          colSpan={6}
          className="bg-amber-50 border-l-4 border-amber-400 py-3 px-4 text-sm text-amber-900"
        >
          <span className="font-semibold">AI Explanation: </span>
          {item.llm_explanation}
        </TableCell>
      </TableRow>
    )}
  </>
))}
```

---

### TC018 & TC029 — `/clients/profitability` returns 404 [HIGH, BLOCKED] 🚫

**Severity:** HIGH — 2 tests permanently blocked; route mismatch between API and frontend  
**Files affected:**
- No existing file at `frontend/src/app/clients/profitability/` — needs creation

#### 1. Error
```
Navigation to /clients/profitability returned Next.js 404.
The backend endpoint GET /api/v1/clients/profitability works correctly.
```

#### 2. Root Cause

The client page exists at `frontend/src/app/clients/page.tsx` (route: `/clients`). It correctly calls `GET /api/v1/clients/profitability` and renders the ranked table. TC021 (refresh rankings) passed by navigating to `/clients`.

The test plan for TC018/TC029 navigates to `/clients/profitability` — matching the backend API path. There is no `page.tsx` at that path. Next.js App Router returns 404.

#### 3. Blast Radius

Two tests blocked. TC026 (open client from profitability) passed because it navigated from within the app at `/clients`.

#### 4. Fix

**Option A — redirect (minimal, no UX change):**

Create `frontend/src/app/clients/profitability/page.tsx`:
```typescript
import { redirect } from "next/navigation";

export default function ClientProfitabilityRedirect() {
  redirect("/clients");
}
```

**Option B — update test descriptions (if `/clients` is the canonical route):**

Per PRODUCT-SPEC Screen 10: `Clients (/clients)`. The page is at the correct route. Update TC018/TC029 descriptions in the test plan to navigate to `http://localhost:3007/clients`.

Option A is recommended because it future-proofs direct-URL access and makes the route self-documenting.

---

## Test Config Issues (not app bugs)

These 7 blocked tests need test plan description updates only — no source code changes.

| TC | Observed | Root Cause | Fix |
|---|---|---|---|
| TC003 | Hits `localhost:3007/health` → 404 | Test plan uses frontend URL for health check | Change to `http://localhost:8096/health` (backend) |
| TC012 | Fixture invoice INV-1001 not found | TC001 failure cascade auto-deleted the shared fixture | Each test must create + tear down its own invoice fixture |
| TC014 | Navigates to `/api/v1/chat` → `{"detail":"Method Not Allowed"}` | Test plan description sets wrong URL | Change to `http://localhost:3007/chat` |
| TC019 | Same as TC014 | Same root cause | Same fix |
| TC033 | Same as TC014 | Same root cause | Same fix |
| TC018 | `/clients/profitability` → 404 | Frontend route is `/clients` | See app fix above (redirect) or update test plan |
| TC029 | Same as TC018 | Same root cause | Same fix |

---

## Proactive Gaps & Best Practices

### 1. `api()` is fragile for all non-JSON responses
The 204 issue identified in TC025 affects `deleteInvoice`, `deleteExpense`, and `deleteBudget`. The fix above (`if (res.status === 204) return undefined as T`) covers all three. Consider also handling `content-length: 0` for future robustness:
```typescript
if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
```

### 2. No async error handling in event handlers
`handleDelete`, `handleSet`, and `handleInlineSave` in `budgets/page.tsx` all lack try/catch. Any async failure silently leaves the UI stale. Audit every `async` onClick handler across the frontend — this is a systemic pattern.

### 3. `<Button onClick>` bypasses HTML form validation everywhere
`reports/page.tsx`, `budgets/page.tsx`, and `expenses/new/page.tsx` all use `<Button onClick>` for submission rather than `<form onSubmit>`. This means `min`, `max`, and `required` attributes on inputs are never enforced programmatically. Add explicit guards in every handler, and back them with Pydantic `Field(ge=..., le=...)` constraints on the backend.

### 4. Missing `key` prop on React Fragments in `clients/page.tsx`
```tsx
// clients/page.tsx:69 — causes React reconciliation warnings
{clients.map((c, i) => (
  <>          {/* ← bare Fragment, no key */}
    <TableRow key={c.client_name} ...>
```
Fix:
```tsx
{clients.map((c, i) => (
  <Fragment key={c.client_name}>
    <TableRow ...>
```
Import `Fragment` from React. Without a key, React cannot correctly reconcile the expand/collapse row pairs during re-renders.

### 5. Test isolation — shared fixtures cause cascade failures
TC012 was blocked because TC001's failure side-effects deleted a shared invoice. Every test should own its fixtures: create on entry, delete in `finally`. The `testsprite_backend_test_plan.json` descriptions for TC009 and TC012 should enforce this.

### 6. AI endpoints not tested with live LLM calls
All AI paths (suggest-items, reminder-draft, categorize, anomalies, reports, chat) are only tested with `?dry_run=true`. Live AI paths are uncovered. Consider adding at least one integration test per AI endpoint using real API keys in a CI secrets store, gated behind an `@pytest.mark.live` marker.

### 7. No authentication on any endpoint
Every `/api/v1/*` endpoint is publicly accessible. This is the highest-priority gap before any production deployment. All v1.3 infrastructure work (multi-tenancy, JWT auth) depends on this being closed first per `PLAN-v1.3.md` Feature 1.

---

## Fix Priority Order

| Priority | TC | File(s) | Effort | Impact |
|---|---|---|---|---|
| 1 | TC025 | `src/lib/api.ts` | 1 line | Fixes all 3 DELETE operations |
| 2 | TC034 | `reports/page.tsx`, `reports.py` | 5 lines each | Stops 500 crash |
| 3 | TC001 | `invoices/new/page.tsx` | 5 lines + INR fix | Core invoice flow |
| 4 | TC018/TC029 | `clients/profitability/page.tsx` (new file) | 4 lines | Unblocks 2 tests |
| 5 | TC005 | `dashboard/page.tsx` | 15 lines | Dashboard completeness |
| 6 | TC016 | `expenses/page.tsx` | 20 lines | Anomaly UX |
| 7 | TC009 | Test file only | 1 line removed | Backend fixture |
| 8 | TC003/TC014/TC019/TC033 | Test plan JSON | Description update | Unblocks 4 tests |

---

*Generated by Claude Code · DClaw Finance v1.2 · 2026-05-28*
