"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  get13WeekForecast,
  getCashFlowOptimization,
  type CashFlowForecast,
  type CashFlowLever,
} from "@/lib/api";
import { formatINR, inrAxisTick } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function CashFlowPage() {
  const [forecast, setForecast]   = useState<CashFlowForecast | null>(null);
  const [levers,   setLevers]     = useState<CashFlowLever[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState<string | null>(null);

  useEffect(() => {
    Promise.all([get13WeekForecast(), getCashFlowOptimization()])
      .then(([f, l]) => { setForecast(f); setLevers(l); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-[#777]">Loading cash flow…</div>;
  if (error)   return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!forecast) return null;

  const { weeks, summary } = forecast;

  const chartData = weeks.map((w) => ({
    week:    `W${w.week}`,
    Inflow:  w.projected_inflow,
    Outflow: w.projected_outflow,
    Balance: w.running_balance,
    Net:     w.net_cash_flow,
  }));

  return (
    <div className="space-y-8">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          13-Week Cash Flow
        </h1>
        <p className="mt-1 text-sm text-[#777]">
          Weekly projection based on trailing 3-month actuals · amounts in INR
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total Inflow",    value: formatINR(summary.total_inflow),   stripe: "#18d26e" },
          { label: "Total Outflow",   value: formatINR(summary.total_outflow),  stripe: "#dc2626" },
          { label: "Net 13-Week",     value: formatINR(summary.net_13_week),    stripe: summary.net_13_week >= 0 ? "#7030A0" : "#dc2626" },
          { label: "Positive Weeks",  value: String(summary.weeks_positive),    stripe: "#18d26e" },
          { label: "Negative Weeks",  value: String(summary.weeks_negative),    stripe: summary.weeks_negative > 0 ? "#dc2626" : "#ededed" },
        ].map(({ label, value, stripe }) => (
          <Card key={label} className="overflow-hidden">
            <div className="h-1 w-full" style={{ background: stripe }} />
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#777]"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                {label}
              </p>
              <p className="mt-1 text-xl font-bold text-[#333] tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Running balance chart */}
      <Card>
        <CardHeader><CardTitle>Running Cash Balance — 13 Weeks</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7030A0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7030A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#777" }} />
              <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 11, fill: "#777" }} />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }}
              />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 3" />
              <Area type="monotone" dataKey="Balance" stroke="#7030A0" strokeWidth={2.5} fill="url(#balGrad)" name="Running Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly inflow vs outflow */}
      <Card>
        <CardHeader><CardTitle>Weekly Inflow vs Outflow</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#777" }} />
              <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 11, fill: "#777" }} />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }}
              />
              <Area type="monotone" dataKey="Inflow"  stroke="#18d26e" strokeWidth={2} fill="#dcfce7" fillOpacity={0.5} name="Inflow" />
              <Area type="monotone" dataKey="Outflow" stroke="#dc2626" strokeWidth={2} fill="#fee2e2" fillOpacity={0.5} name="Outflow" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimization levers */}
      {levers.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Top 3 Optimization Levers
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {levers.map((lever, i) => (
              <Card key={lever.category} className="overflow-hidden">
                <div className="h-1 w-full" style={{ background: i === 0 ? "#dc2626" : i === 1 ? "#f59e0b" : "#7030A0" }} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-[#333]">{lever.category}</span>
                    <Badge className="bg-slate-100 text-slate-700 text-xs">
                      {lever.percentage_of_spend}% of spend
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#777]">
                    <div className="flex justify-between">
                      <span>3-month total</span>
                      <span className="font-medium tabular-nums text-[#444]">{formatINR(lever.total_3_months)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly avg</span>
                      <span className="font-medium tabular-nums text-[#444]">{formatINR(lever.monthly_avg)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#ededed] pt-2">
                      <span className="font-semibold text-emerald-700">10% saving</span>
                      <span className="font-bold tabular-nums text-emerald-700">{formatINR(lever.potential_saving_10pct)}</span>
                    </div>
                  </div>
                  <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                    {lever.suggestion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Weekly detail table */}
      <Card>
        <CardHeader><CardTitle>Weekly Detail</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ededed] text-left text-xs text-[#777] uppercase tracking-wider">
                  <th className="pb-2 pr-4">Week</th>
                  <th className="pb-2 pr-4">Period</th>
                  <th className="pb-2 pr-4 text-right">Inflow</th>
                  <th className="pb-2 pr-4 text-right">Outflow</th>
                  <th className="pb-2 pr-4 text-right">Net</th>
                  <th className="pb-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.week} className="border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                    <td className="py-2 pr-4 font-medium text-[#333]">W{w.week}</td>
                    <td className="py-2 pr-4 text-[#777] text-xs">
                      {w.week_start} – {w.week_end}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-emerald-700">{formatINR(w.projected_inflow)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-red-600">{formatINR(w.projected_outflow)}</td>
                    <td className={`py-2 pr-4 text-right tabular-nums font-medium ${w.net_cash_flow >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {w.net_cash_flow >= 0 ? "+" : ""}{formatINR(w.net_cash_flow)}
                    </td>
                    <td className={`py-2 text-right tabular-nums font-semibold ${w.running_balance >= 0 ? "text-[#7030A0]" : "text-red-600"}`}>
                      {formatINR(w.running_balance)}
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
