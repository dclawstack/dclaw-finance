"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getForecast, type ForecastPoint, type HistoricalPoint } from "@/lib/api";
import { formatINR, inrAxisTick } from "@/lib/utils";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ForecastPage() {
  const [projected, setProjected] = useState<ForecastPoint[]>([]);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForecast()
      .then((res) => { setProjected(res.projected); setHistorical(res.historical); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading forecast…</div>;
  if (error)   return <div className="text-red-500">{error}</div>;

  // Merge historical actuals + projected into one timeline for the chart
  const chartData = [
    ...historical.map((h) => ({
      month: h.month,
      "Actual Revenue":   h.actual_revenue,
      "Actual Expenses":  h.actual_expenses,
      "Actual Profit":    h.actual_profit,
    })),
    ...projected.map((p) => ({
      month: p.month,
      "Projected Revenue":  p.projected_revenue,
      "Projected Expenses": p.projected_expenses,
      "Projected Profit":   p.projected_profit,
      "Band Low":           p.confidence_band_low,
      "Band High":          p.confidence_band_high,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          3-Month Cash Flow Forecast
        </h1>
        <p className="mt-1 text-sm text-[#777]">
          Trailing 3 months actual · projected 3 months ahead via exponential smoothing α=0.3 · growth capped ±20%
        </p>
      </div>

      {/* Actual vs Projected comparison chart */}
      <Card>
        <CardHeader>
          <CardTitle>Actual vs Projected — Revenue, Expenses & Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7030A0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7030A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#777" }} />
              <YAxis tickFormatter={inrAxisTick} tick={{ fontSize: 11, fill: "#777" }} />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #ededed" }}
              />
              <Legend />
              {/* Actuals (solid lines) */}
              <Line type="monotone" dataKey="Actual Revenue"  stroke="#18d26e" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="Actual Expenses" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="Actual Profit"   stroke="#7030A0" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              {/* Projected (dashed lines) */}
              <Line type="monotone" dataKey="Projected Revenue"  stroke="#18d26e" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
              <Line type="monotone" dataKey="Projected Expenses" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
              <Line type="monotone" dataKey="Projected Profit"   stroke="#7030A0" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
              {/* Confidence band */}
              <Area type="monotone" dataKey="Band High" stroke="transparent" fill="url(#bandGrad)" name="Confidence Band" connectNulls />
              <Area type="monotone" dataKey="Band Low"  stroke="transparent" fill="transparent" legendType="none" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-[#999]">Solid lines = actuals · Dashed lines = projected · Shaded band = confidence range</p>
        </CardContent>
      </Card>

      {/* Projected summary cards */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Projected Months
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {projected.map((p) => (
            <Card key={p.month} className="overflow-hidden">
              <div className="h-1 w-full" style={{ background: "#7030A0" }} />
              <CardContent className="p-5 space-y-2 text-sm">
                <div className="font-semibold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {p.month}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">Revenue</span>
                  <span className="font-semibold text-[#7030A0] tabular-nums">{formatINR(p.projected_revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">Expenses</span>
                  <span className="font-semibold text-red-600 tabular-nums">{formatINR(p.projected_expenses)}</span>
                </div>
                <div className="flex justify-between border-t border-[#ededed] pt-2">
                  <span className="font-medium text-[#333]">Profit</span>
                  <span className={`font-bold tabular-nums ${p.projected_profit >= 0 ? "text-[#18d26e]" : "text-red-600"}`}>
                    {formatINR(p.projected_profit)}
                  </span>
                </div>
                <div className="text-xs text-[#999] tabular-nums">
                  Range: {formatINR(p.confidence_band_low)} – {formatINR(p.confidence_band_high)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Historical actuals for reference */}
      {historical.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Recent Actuals
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {historical.map((h) => (
              <Card key={h.month} className="overflow-hidden opacity-80">
                <div className="h-1 w-full bg-slate-300" />
                <CardContent className="p-5 space-y-2 text-sm">
                  <div className="font-semibold text-[#555]">{h.month}</div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">Revenue</span>
                    <span className="tabular-nums text-[#555]">{formatINR(h.actual_revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">Expenses</span>
                    <span className="tabular-nums text-[#555]">{formatINR(h.actual_expenses)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#ededed] pt-2">
                    <span className="font-medium text-[#555]">Profit</span>
                    <span className={`font-bold tabular-nums ${h.actual_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatINR(h.actual_profit)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
