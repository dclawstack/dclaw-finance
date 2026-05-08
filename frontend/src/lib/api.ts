const API_BASE = "/api/v1";

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
  return (await res.json()) as T;
}

export async function getDashboard(): Promise<DashboardData> {
  return api<DashboardData>("/dashboard");
}

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

export async function updateInvoice(id: string, payload: Partial<Invoice> & { items?: Array<{ description: string; quantity: number; unit_price: number }> }): Promise<Invoice> {
  return api<Invoice>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  await api(`/invoices/${id}`, { method: "DELETE" });
}

export async function listExpenses(category?: string): Promise<Expense[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return api<Expense[]>(`/expenses${qs}`);
}

export async function getExpense(id: string): Promise<Expense> {
  return api<Expense>(`/expenses/${id}`);
}

export async function createExpense(payload: Omit<Expense, "id" | "created_at" | "updated_at">): Promise<Expense> {
  return api<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(id: string, payload: Partial<Expense>): Promise<Expense> {
  return api<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  await api(`/expenses/${id}`, { method: "DELETE" });
}
