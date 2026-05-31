"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getForecast,
  getForecastMape,
  getScenarios,
  getDrivers,
  getSensitivity,
  getThreeStatement,
  type ForecastPoint,
  type HistoricalPoint,
  type MapeResponse,
  type ScenariosResponse,
  type DriversResponse,
  type SensitivityResponse,
  type ThreeStatementResponse,
} from "@/lib/api";
import { formatINR, inrAxisTick } from "@/lib/utils";
import {
  ComposedChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Shared ─────────────────────────────────────────────────────────────────────

function Spinner() {
  return <div className="py-12 text-center text-sm text-slate-400">Loading…</div>;
}

function ErrorMsg({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-red-500">{msg}</div>;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-[#777]">{label}</p>
        <p className="mt-1 text-xl font-bold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-[#999]">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Tab 1: 12-Month Forecast ───────────────────────────────────────────────────

function ForecastTab() {
  const [projected, setProjected] = useState<ForecastPoint[]>([]);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForecast(12)
      .then((r) => { setProjected(r.projected); setHistorical(r.historical); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const chartData = [
    ...historical.map((h) => ({
      month: h.month,
      "Actual Revenue": h.actual_revenue,
      "Actual Expenses": h.actual_expenses,
      "Actual Profit": h.actual_profit,
    })),
    ...projected.map((p) => ({
      month: p.month,
      "Projected Revenue": p.projected_revenue,
      "Projected Expenses": p.projected_expenses,
      "Projected Profit": p.projected_profit,
      "Band Low": p.confidence_band_low,
      "Band High": p.confidence_band_high,
    })),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>12-Month Projection — Revenue, Expenses & Profit</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7030A0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7030A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#777" }} />
              <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 10, fill: "#777" }} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }} />
              <Legend />
              <Line type="monotone" dataKey="Actual Revenue" stroke="#18d26e" strokeWidth={2.5} dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="Actual Expenses" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="Actual Profit" stroke="#7030A0" strokeWidth={2.5} dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="Projected Revenue" stroke="#18d26e" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
              <Line type="monotone" dataKey="Projected Expenses" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
              <Line type="monotone" dataKey="Projected Profit" stroke="#7030A0" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
              <Area type="monotone" dataKey="Band High" stroke="transparent" fill="url(#bandGrad)" name="Confidence Band" connectNulls />
              <Area type="monotone" dataKey="Band Low" stroke="transparent" fill="transparent" legendType="none" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-[#999]">Solid = actuals · Dashed = projected · Shaded = confidence band</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {projected.slice(0, 4).map((p) => (
          <Card key={p.month} className="overflow-hidden">
            <div className="h-1 w-full" style={{ background: "#7030A0" }} />
            <CardContent className="p-4 space-y-1 text-sm">
              <div className="font-semibold text-[#333]">{p.month}</div>
              <div className="flex justify-between"><span className="text-[#777]">Revenue</span><span className="font-semibold text-[#7030A0]">{formatINR(p.projected_revenue)}</span></div>
              <div className="flex justify-between"><span className="text-[#777]">Expenses</span><span className="font-semibold text-red-600">{formatINR(p.projected_expenses)}</span></div>
              <div className="flex justify-between border-t border-[#ededed] pt-1">
                <span className="font-medium">Profit</span>
                <span className={`font-bold ${p.projected_profit >= 0 ? "text-[#18d26e]" : "text-red-600"}`}>{formatINR(p.projected_profit)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projected.length > 4 && (
        <details className="text-sm text-[#777] cursor-pointer">
          <summary className="font-medium text-[#555] select-none">Show months 5–12 ▾</summary>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {projected.slice(4).map((p) => (
              <Card key={p.month} className="overflow-hidden">
                <div className="h-1 w-full bg-slate-200" />
                <CardContent className="p-4 space-y-1 text-sm">
                  <div className="font-semibold text-[#555]">{p.month}</div>
                  <div className="flex justify-between"><span className="text-[#777]">Revenue</span><span>{formatINR(p.projected_revenue)}</span></div>
                  <div className="flex justify-between"><span className="text-[#777]">Expenses</span><span>{formatINR(p.projected_expenses)}</span></div>
                  <div className="flex justify-between border-t border-[#ededed] pt-1">
                    <span className="font-medium">Profit</span>
                    <span className={p.projected_profit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatINR(p.projected_profit)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ── Tab 2: Scenarios ───────────────────────────────────────────────────────────

function ScenariosTab() {
  const [data, setData] = useState<ScenariosResponse | null>(null);
  const [active, setActive] = useState<string>("base");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScenarios().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;
  if (!data) return null;

  const activeScenario = data.scenarios.find((s) => s.key === active)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {data.scenarios.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
              active === s.key ? "text-white border-transparent" : "bg-white border-[#ededed] text-[#555] hover:border-[#aaa]"
            }`}
            style={active === s.key ? { background: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Annual Revenue" value={formatINR(activeScenario.annual_summary.revenue)} sub={`×${activeScenario.assumptions.revenue_multiplier} base`} />
        <StatCard label="Annual Expenses" value={formatINR(activeScenario.annual_summary.expenses)} sub={`×${activeScenario.assumptions.expense_multiplier} base`} />
        <StatCard label="Annual Profit" value={formatINR(activeScenario.annual_summary.profit)} />
      </div>

      <Card>
        <CardHeader><CardTitle>{activeScenario.label} — Monthly Breakdown</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={activeScenario.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#777" }} />
              <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 10, fill: "#777" }} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#18d26e" opacity={0.8} />
              <Bar dataKey="expenses" name="Expenses" fill="#dc2626" opacity={0.8} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke={activeScenario.color} strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scenario Comparison (Annual)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ededed] text-left text-xs uppercase tracking-wide text-[#777]">
                  <th className="pb-2 pr-4">Scenario</th>
                  <th className="pb-2 pr-4 text-right">Revenue</th>
                  <th className="pb-2 pr-4 text-right">Expenses</th>
                  <th className="pb-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.scenarios.map((s) => (
                  <tr key={s.key} className="border-b border-[#f5f5f5] last:border-0">
                    <td className="py-2 pr-4">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: s.color }} />
                      {s.label}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatINR(s.annual_summary.revenue)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatINR(s.annual_summary.expenses)}</td>
                    <td className={`py-2 text-right font-semibold tabular-nums ${s.annual_summary.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatINR(s.annual_summary.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: 3-Statement Model ───────────────────────────────────────────────────

function ThreeStatementTab() {
  const [data, setData] = useState<ThreeStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getThreeStatement().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;
  if (!data) return null;

  const { income_statement: is, cash_flow_statement: cfs, balance_sheet: bs } = data;

  function ISRow({ label, value, bold, indent }: { label: string; value: number; bold?: boolean; indent?: boolean }) {
    return (
      <div className={`flex justify-between py-1 border-b border-[#f5f5f5] ${bold ? "font-semibold" : ""} ${indent ? "pl-4 text-[#555]" : ""}`}>
        <span>{label}</span>
        <span className="tabular-nums">{formatINR(value)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Income Statement — {data.year}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-0.5">
            <ISRow label="Revenue" value={is.revenue} bold />
            <ISRow label="Cost of Revenue (COGS)" value={-is.cogs} indent />
            <ISRow label="Gross Profit" value={is.gross_profit} bold />
            <div className="text-xs text-[#999] pb-1">Gross Margin: {is.gross_margin_pct}%</div>
            <ISRow label="Operating Expenses" value={-is.operating_expenses} indent />
            <ISRow label="EBIT" value={is.ebit} bold />
            <ISRow label="Tax Provision (25%)" value={-is.tax_provision} indent />
            <ISRow label="Net Income" value={is.net_income} bold />
            <div className="text-xs text-[#999] pt-1">Net Margin: {is.net_margin_pct}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cash Flow Statement — {data.year}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-0.5">
            <ISRow label="Net Income" value={cfs.operating.net_income} />
            <ISRow label="Δ Accounts Receivable" value={cfs.operating.change_in_accounts_receivable} indent />
            <ISRow label="Operating Cash Flow" value={cfs.operating.net_cash_from_operations} bold />
            <div className="mt-3 pt-3 border-t border-[#ededed]">
              <div className="flex justify-between py-1 text-[#777] italic text-xs">
                <span>Investing</span><span>{cfs.investing.note}</span>
              </div>
              <div className="flex justify-between py-1 text-[#777] italic text-xs">
                <span>Financing</span><span>{cfs.financing.note}</span>
              </div>
            </div>
            <ISRow label="Net Change in Cash" value={cfs.net_change_in_cash} bold />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Balance Sheet — {data.year}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#777] pb-1">Assets</p>
            <ISRow label="Cash & Equivalents" value={bs.assets.cash_and_equivalents} indent />
            <ISRow label="Accounts Receivable" value={bs.assets.accounts_receivable} indent />
            <ISRow label="Total Assets" value={bs.assets.total_assets} bold />
            <p className="text-xs font-semibold uppercase tracking-wide text-[#777] pt-3 pb-1">Liabilities</p>
            <div className="py-1 text-xs italic text-[#999]">{bs.liabilities.note}</div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#777] pt-3 pb-1">Equity</p>
            <ISRow label="Retained Earnings" value={bs.equity.retained_earnings} indent />
            <ISRow label="Total Equity" value={bs.equity.total_equity} bold />
            <p className="mt-2 text-xs text-[#bbb]">{bs.note}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Expense Breakdown — {data.year}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={Object.entries(is.expense_detail)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 12)
                .map(([cat, amt]) => ({ category: cat, amount: amt }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" horizontal={false} />
              <XAxis type="number" tickFormatter={inrAxisTick} tick={{ fontSize: 10, fill: "#777" }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#555" }} width={110} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="amount" name="Amount" fill="#7030A0" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Driver Analysis ─────────────────────────────────────────────────────

function DriversTab() {
  const [drivers, setDrivers] = useState<DriversResponse | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResponse | null>(null);
  const [mape, setMape] = useState<MapeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDrivers(), getSensitivity(), getForecastMape()])
      .then(([d, s, m]) => { setDrivers(d); setSensitivity(s); setMape(m); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;
  if (!drivers || !sensitivity) return null;

  const { drivers: d } = drivers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-base font-semibold text-[#333]">Key Business Drivers (trailing 12 months)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Avg Contract Value" value={formatINR(d.avg_contract_value_inr)} />
          <StatCard label="Active Clients" value={String(d.active_clients)} />
          <StatCard label="Win Rate" value={`${(d.win_rate * 100).toFixed(1)}%`} sub="paid / total invoices" />
          <StatCard label="Net Margin" value={`${(d.net_margin * 100).toFixed(1)}%`} />
          <StatCard label="Avg Monthly Revenue" value={formatINR(d.avg_monthly_revenue_inr)} />
          <StatCard label="Avg Monthly Expenses" value={formatINR(d.avg_monthly_expenses_inr)} />
          <StatCard label="Revenue per Client" value={formatINR(d.avg_revenue_per_client_inr)} />
          <StatCard label="Closed Deals (12m)" value={String(d.closed_deals_12m)} />
        </div>
      </div>

      {mape && (
        <Card>
          <CardHeader><CardTitle className="text-base">Forecast Accuracy (MAPE)</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {mape.note ? (
              <p className="text-[#999] italic">{mape.note}</p>
            ) : (
              <div className="flex gap-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#777]">Revenue MAPE</p>
                  <p className="text-2xl font-bold text-[#333]">{mape.mape_revenue?.toFixed(1)}%</p>
                  <p className="text-xs text-[#999]">{mape.mape_revenue !== null && mape.mape_revenue < 10 ? "✅ Target met (<10%)" : "⚠️ Above 10% target"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#777]">Expense MAPE</p>
                  <p className="text-2xl font-bold text-[#333]">{mape.mape_expenses?.toFixed(1)}%</p>
                  <p className="text-xs text-[#999]">{mape.mape_expenses !== null && mape.mape_expenses < 10 ? "✅ Target met (<10%)" : "⚠️ Above 10% target"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Sensitivity Analysis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-[#777] mb-4">
            Base: Revenue {formatINR(sensitivity.base.annual_revenue)} · Expenses {formatINR(sensitivity.base.annual_expenses)} · Profit {formatINR(sensitivity.base.annual_profit)}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#777] mb-2">Revenue Impact (expenses held constant)</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#999] border-b border-[#ededed]">
                    <th className="text-left pb-1">Change</th><th className="text-right pb-1">Profit</th><th className="text-right pb-1">Δ Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivity.sensitivity.revenue.map((r) => (
                    <tr key={r.delta} className="border-b border-[#f9f9f9]">
                      <td className="py-1 text-[#555]">{r.delta}</td>
                      <td className={`py-1 text-right tabular-nums ${r.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatINR(r.profit)}</td>
                      <td className={`py-1 text-right text-xs tabular-nums ${r.profit_change_pct >= 0 ? "text-emerald-500" : "text-red-500"}`}>{r.profit_change_pct > 0 ? "+" : ""}{r.profit_change_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#777] mb-2">Expense Impact (revenue held constant)</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#999] border-b border-[#ededed]">
                    <th className="text-left pb-1">Change</th><th className="text-right pb-1">Profit</th><th className="text-right pb-1">Δ Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivity.sensitivity.expenses.map((r) => (
                    <tr key={r.delta} className="border-b border-[#f9f9f9]">
                      <td className="py-1 text-[#555]">{r.delta}</td>
                      <td className={`py-1 text-right tabular-nums ${r.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatINR(r.profit)}</td>
                      <td className={`py-1 text-right text-xs tabular-nums ${r.profit_change_pct >= 0 ? "text-emerald-500" : "text-red-500"}`}>{r.profit_change_pct > 0 ? "+" : ""}{r.profit_change_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#bbb]">{sensitivity.note}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Expense Breakdown (12 months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={Object.entries(drivers.expense_breakdown_12m)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([cat, amt]) => ({ category: cat, amount: amt }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" horizontal={false} />
              <XAxis type="number" tickFormatter={inrAxisTick} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#555" }} width={110} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="amount" fill="#7030A0" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Financial Forecasting
        </h1>
        <p className="mt-1 text-sm text-[#777]">
          12-month projection · 5 scenarios · 3-statement model · driver sensitivity analysis
        </p>
      </div>

      <Tabs defaultValue="forecast">
        <TabsList className="mb-4">
          <TabsTrigger value="forecast">12-Month Forecast</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="three-statement">3-Statement Model</TabsTrigger>
          <TabsTrigger value="drivers">Driver Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="forecast"><ForecastTab /></TabsContent>
        <TabsContent value="scenarios"><ScenariosTab /></TabsContent>
        <TabsContent value="three-statement"><ThreeStatementTab /></TabsContent>
        <TabsContent value="drivers"><DriversTab /></TabsContent>
      </Tabs>
    </div>
  );
}
