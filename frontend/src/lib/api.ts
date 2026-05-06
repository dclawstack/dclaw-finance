export interface FinancialModel {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  risk_score: number;
  forecast_months: number;
  created_at: string;
}

export interface ForecastResult {
  month: number;
  projected_revenue: number;
  projected_profit: number;
}

export async function api<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `/api/v1${path}`;
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
