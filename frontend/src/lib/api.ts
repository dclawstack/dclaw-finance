const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "/api/v1";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor: string | null;
  receipt_url: string | null;
  ai_suggested_category: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  total_revenue: number;
  outstanding_invoices: number;
  total_expenses: number;
  net_profit: number;
  overdue_invoices: Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    total: number;
    due_date: string;
  }>;
  expenses_by_category: Record<string, number>;
}

export interface TrendPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ForecastPoint {
  month: string;
  projected_revenue: number;
  projected_expenses: number;
  projected_profit: number;
  confidence_band_low: number;
  confidence_band_high: number;
}

export interface HistoricalPoint {
  month: string;
  actual_revenue: number;
  actual_expenses: number;
  actual_profit: number;
}

export interface ForecastResponse {
  projected: ForecastPoint[];
  historical: HistoricalPoint[];
}

export interface CashFlowWeek {
  week: number;
  week_start: string;
  week_end: string;
  projected_inflow: number;
  projected_outflow: number;
  net_cash_flow: number;
  running_balance: number;
}

export interface CashFlowForecast {
  weeks: CashFlowWeek[];
  summary: {
    total_inflow: number;
    total_outflow: number;
    net_13_week: number;
    weeks_positive: number;
    weeks_negative: number;
  };
}

export interface CashFlowLever {
  category: string;
  total_3_months: number;
  percentage_of_spend: number;
  monthly_avg: number;
  potential_saving_10pct: number;
  suggestion: string;
}

export interface AnomalyItem {
  expense: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    vendor: string | null;
  };
  zscore: number;
  llm_explanation: string;
}

export interface ClientScore {
  client_name: string;
  total_revenue: number;
  invoice_count: number;
  outstanding: number;
  score: number;
  ai_insight: string;
}

export interface BudgetStatus {
  budget_id: string;
  category: string;
  monthly_limit: number;
  actual_spend: number;
  utilization: number;
  ai_suggestion: string | null;
}

export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  year: number;
  month: number;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

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
  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return (await res.json()) as T;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardData> {
  return api<DashboardData>("/dashboard");
}

export async function getDashboardTrends(): Promise<{ trends: TrendPoint[] }> {
  return api<{ trends: TrendPoint[] }>("/dashboard/trends");
}

// ── Invoices ───────────────────────────────────────────────────────────────

export async function listInvoices(status?: string): Promise<Invoice[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<Invoice[]>(`/invoices${qs}`);
}

export async function getInvoice(id: string): Promise<Invoice> {
  return api<Invoice>(`/invoices/${id}`);
}

export async function createInvoice(payload: {
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: string;
  tax_rate: number;
  notes: string | null;
  items: Array<{ description: string; quantity: number; unit_price: number }>;
}): Promise<Invoice> {
  return api<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateInvoice(
  id: string,
  payload: Partial<Invoice> & {
    items?: Array<{ description: string; quantity: number; unit_price: number }>;
  }
): Promise<Invoice> {
  return api<Invoice>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  await api(`/invoices/${id}`, { method: "DELETE" });
}

export async function draftReminder(
  invoiceId: string,
  dryRun = false
): Promise<{ subject: string; body: string }> {
  return api<{ subject: string; body: string }>(
    `/invoices/${invoiceId}/reminder-draft${dryRun ? "?dry_run=true" : ""}`,
    { method: "POST" }
  );
}

export async function suggestLineItems(
  clientName: string,
  firstItem: string,
  dryRun = false
): Promise<Array<{ description: string; typical_unit_price: number }>> {
  return api(`/invoices/suggest-items${dryRun ? "?dry_run=true" : ""}`, {
    method: "POST",
    body: JSON.stringify({ client_name: clientName, first_item: firstItem }),
  });
}

// ── Expenses ───────────────────────────────────────────────────────────────

export async function listExpenses(category?: string): Promise<Expense[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return api<Expense[]>(`/expenses${qs}`);
}

export async function getExpense(id: string): Promise<Expense> {
  return api<Expense>(`/expenses/${id}`);
}

export async function createExpense(
  payload: Omit<Expense, "id" | "ai_suggested_category" | "created_at" | "updated_at">
): Promise<Expense> {
  return api<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(
  id: string,
  payload: Partial<Expense>
): Promise<Expense> {
  return api<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  await api(`/expenses/${id}`, { method: "DELETE" });
}

export async function categorizeExpense(
  description: string,
  vendor: string,
  dryRun = false
): Promise<{ suggested_category: string; confidence: number }> {
  return api(`/expenses/categorize${dryRun ? "?dry_run=true" : ""}`, {
    method: "POST",
    body: JSON.stringify({ description, vendor }),
  });
}

export async function ocrReceipt(file: File, dryRun = false): Promise<{
  vendor: string | null;
  amount: number | null;
  date: string | null;
  description: string | null;
  suggested_category: string;
}> {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${API_BASE}/expenses/ocr${dryRun ? "?dry_run=true" : ""}`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getAnomalies(): Promise<AnomalyItem[]> {
  return api<AnomalyItem[]>("/expenses/anomalies");
}

// ── Forecast ───────────────────────────────────────────────────────────────

export async function getForecast(months = 12): Promise<ForecastResponse> {
  return api<ForecastResponse>(`/forecast?months=${months}`);
}

export interface MapeResponse {
  mape_revenue: number | null;
  mape_expenses: number | null;
  validation_months: string[];
  actuals_revenue: number[];
  predicted_revenue: number[];
  actuals_expenses: number[];
  predicted_expenses: number[];
  note?: string;
}

export async function getForecastMape(): Promise<MapeResponse> {
  return api<MapeResponse>("/forecast/mape");
}

export interface ScenarioMonth {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Scenario {
  key: string;
  label: string;
  color: string;
  assumptions: { revenue_multiplier: number; expense_multiplier: number };
  monthly: ScenarioMonth[];
  annual_summary: { revenue: number; expenses: number; profit: number };
}

export interface ScenariosResponse {
  scenarios: Scenario[];
  months: string[];
}

export async function getScenarios(): Promise<ScenariosResponse> {
  return api<ScenariosResponse>("/forecast/scenarios");
}

export interface DriversResponse {
  drivers: {
    avg_contract_value_inr: number;
    active_clients: number;
    closed_deals_12m: number;
    win_rate: number;
    avg_monthly_revenue_inr: number;
    avg_monthly_expenses_inr: number;
    avg_revenue_per_client_inr: number;
    net_margin: number;
  };
  expense_breakdown_12m: Record<string, number>;
  trailing_months: number;
}

export async function getDrivers(): Promise<DriversResponse> {
  return api<DriversResponse>("/forecast/drivers");
}

export interface SensitivityRow {
  delta: string;
  revenue?: number;
  expenses?: number;
  profit: number;
  profit_change_pct: number;
}

export interface SensitivityResponse {
  base: { annual_revenue: number; annual_expenses: number; annual_profit: number };
  sensitivity: { revenue: SensitivityRow[]; expenses: SensitivityRow[] };
  note: string;
}

export async function getSensitivity(): Promise<SensitivityResponse> {
  return api<SensitivityResponse>("/forecast/sensitivity");
}

export interface ThreeStatementResponse {
  year: number;
  income_statement: {
    revenue: number;
    cogs: number;
    gross_profit: number;
    gross_margin_pct: number;
    operating_expenses: number;
    ebit: number;
    tax_provision: number;
    net_income: number;
    net_margin_pct: number;
    expense_detail: Record<string, number>;
  };
  cash_flow_statement: {
    operating: { net_income: number; change_in_accounts_receivable: number; net_cash_from_operations: number };
    investing: { net_cash_from_investing: number; note: string };
    financing: { net_cash_from_financing: number; note: string };
    net_change_in_cash: number;
  };
  balance_sheet: {
    assets: { cash_and_equivalents: number; accounts_receivable: number; total_assets: number };
    liabilities: { total_liabilities: number; note: string };
    equity: { retained_earnings: number; total_equity: number };
    note: string;
  };
}

export async function getThreeStatement(year?: number): Promise<ThreeStatementResponse> {
  const qs = year ? `?year=${year}` : "";
  return api<ThreeStatementResponse>(`/forecast/three-statement${qs}`);
}

// ── Cash Flow ──────────────────────────────────────────────────────────────

export async function get13WeekForecast(): Promise<CashFlowForecast> {
  return api<CashFlowForecast>("/cash-flow/13-week");
}

export async function getCashFlowOptimization(): Promise<CashFlowLever[]> {
  return api<CashFlowLever[]>("/cash-flow/optimization");
}

// ── Reports ────────────────────────────────────────────────────────────────

export async function generateMonthlyReport(
  year: number,
  month: number,
  dryRun = false
): Promise<{
  period: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  top_categories: Record<string, number>;
  summary: string;
}> {
  return api(`/reports/monthly-summary${dryRun ? "?dry_run=true" : ""}`, {
    method: "POST",
    body: JSON.stringify({ year, month }),
  });
}

// ── Clients ────────────────────────────────────────────────────────────────

export async function getClientProfitability(): Promise<ClientScore[]> {
  return api<ClientScore[]>("/clients/profitability");
}

// ── Budgets ────────────────────────────────────────────────────────────────

export async function listBudgets(year?: number, month?: number): Promise<Budget[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<Budget[]>(`/budgets${qs}`);
}

export async function createBudget(payload: {
  category: string;
  monthly_limit: number;
  year: number;
  month: number;
}): Promise<Budget> {
  return api<Budget>("/budgets", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateBudget(
  id: string,
  monthly_limit: number
): Promise<Budget> {
  return api<Budget>(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify({ monthly_limit }),
  });
}

export async function deleteBudget(id: string): Promise<void> {
  await api(`/budgets/${id}`, { method: "DELETE" });
}

export async function getBudgetStatus(
  year?: number,
  month?: number
): Promise<BudgetStatus[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<BudgetStatus[]>(`/budgets/status${qs}`);
}

// ── Chat ───────────────────────────────────────────────────────────────────

export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  return api<{ reply: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  return api<ChatMessage[]>("/chat/history");
}

// ── TestSprite ─────────────────────────────────────────────────────────────

export interface TestSpriteGenerateRequest {
  url: string;
  description: string;
  framework?: string;
}

export interface TestSpriteGenerateResponse {
  success: boolean;
  data: Record<string, unknown>;
}

export interface TestSpriteRunRequest {
  url: string;
  test_ids?: string[];
  configurations?: Record<string, unknown>[];
}

export interface TestSpriteRunResponse {
  run_id: string;
  status: string;
  url: string;
}

export interface TestSpriteRunStatus {
  run_id: string;
  status: string;
  results?: Record<string, unknown> | null;
}

export interface TestSpriteRunsList {
  runs: Record<string, unknown>[];
  total: number;
}

export async function generateTestspriteTests(
  payload: TestSpriteGenerateRequest
): Promise<TestSpriteGenerateResponse> {
  return api<TestSpriteGenerateResponse>("/testsprite/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createTestspriteRun(
  payload: TestSpriteRunRequest
): Promise<TestSpriteRunResponse> {
  return api<TestSpriteRunResponse>("/testsprite/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTestspriteRunStatus(runId: string): Promise<TestSpriteRunStatus> {
  return api<TestSpriteRunStatus>(`/testsprite/status/${runId}`);
}

export async function listTestspriteRuns(limit = 20, offset = 0): Promise<TestSpriteRunsList> {
  return api<TestSpriteRunsList>(`/testsprite/runs?limit=${limit}&offset=${offset}`);
}

export async function checkTestspriteHealth(): Promise<{ connected: boolean; detail: unknown }> {
  return api<{ connected: boolean; detail: unknown }>("/testsprite/health");
}
