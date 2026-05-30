"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboard, getDashboardTrends, type DashboardData, type TrendPoint } from "@/lib/api";
import { formatINR, inrAxisTick } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const KPI_CARDS = [
  { label: "Total Revenue",        key: "total_revenue"      as const, stripe: "#7030A0" },
  { label: "Outstanding Invoices", key: "outstanding_invoices" as const, stripe: "#B180F8", isCount: true },
  { label: "Total Expenses",       key: "total_expenses"     as const, stripe: "#682899" },
  { label: "Net Profit",           key: "net_profit"         as const, stripe: "#18d26e" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const profitDelta = (() => {
    if (trends.length < 2) return null;
    const last = trends[trends.length - 1];
    const prev = trends[trends.length - 2];
    const lastProfit = last.revenue - last.expenses;
    const prevProfit = prev.revenue - prev.expenses;
    if (prevProfit === 0) return null;
    return ((lastProfit - prevProfit) / Math.abs(prevProfit)) * 100;
  })();

  useEffect(() => {
    Promise.all([getDashboard(), getDashboardTrends()])
      .then(([dash, trend]) => { setData(dash); setTrends(trend.trends); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-[#777]">Loading…</div>;
  if (!data)   return <div className="py-12 text-center text-red-500">Failed to load dashboard.</div>;

  const isEmpty =
    data.total_revenue === 0 &&
    data.total_expenses === 0 &&
    data.outstanding_invoices === 0 &&
    data.overdue_invoices.length === 0;

  const expenseChartData = Object.entries(data.expenses_by_category).map(
    ([name, value]) => ({ name, value })
  );

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div className="border-b border-[#ededed] pb-4">
          <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Dashboard
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d4b8f0] bg-[#faf5ff] py-20 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <h2 className="text-xl font-bold text-[#7030A0]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            No financial data yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[#777]">
            Create your first invoice or log an expense to see your dashboard come to life.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/invoices/new"
               className="rounded-full px-5 py-2 text-sm font-semibold text-white"
               style={{ background: "#7030A0" }}>
              New Invoice
            </a>
            <a href="/expenses/new"
               className="rounded-full border border-[#7030A0] px-5 py-2 text-sm font-semibold text-[#7030A0]">
              Add Expense
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#777]">Financial overview — amounts in INR</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map(({ label, key, stripe, isCount }) => {
          const raw = data[key] as number;
          return (
            <Card key={key} className="overflow-hidden">
              <div className="h-1 w-full" style={{ background: stripe }} />
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#777]"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#333] tabular-nums">
                  {isCount ? raw : formatINR(raw)}
                </p>
                {key === "net_profit" && profitDelta !== null && (
                  <p className={`mt-1 text-xs font-semibold ${profitDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {profitDelta >= 0 ? "+" : ""}{profitDelta.toFixed(1)}% vs prev month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 12-month trend */}
      {trends.length > 0 && (
        <Card>
          <CardHeader><CardTitle>12-Month Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#777" }} />
                <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 11, fill: "#777" }} />
                <Tooltip formatter={(v: number) => formatINR(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }} />
                <Legend />
                <Line type="monotone" dataKey="revenue"  stroke="#7030A0" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#B180F8" strokeWidth={2.5} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#777" }} />
                <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 11, fill: "#777" }} />
                <Tooltip formatter={(v: number) => formatINR(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }} />
                <Bar dataKey="value" fill="#7030A0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Overdue Invoices</CardTitle></CardHeader>
          <CardContent>
            {data.overdue_invoices.length === 0 ? (
              <p className="text-sm text-[#777]">No overdue invoices.</p>
            ) : (
              <div className="space-y-3">
                {data.overdue_invoices.map((inv) => (
                  <div key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-[#ededed] p-3 hover:border-[#B180F8] transition-colors">
                    <div>
                      <div className="font-semibold text-[#333]">{inv.invoice_number}</div>
                      <div className="text-xs text-[#777]">{inv.client_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#7030A0] tabular-nums">{formatINR(inv.total)}</div>
                      <Badge variant="destructive" className="mt-1 text-xs">{inv.due_date}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
