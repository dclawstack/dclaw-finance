"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getForecast, type ForecastPoint } from "@/lib/api";
import { formatINR, inrAxisTick } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ForecastPage() {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForecast()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading forecast…</div>;
  if (error)   return <div className="text-red-500">{error}</div>;

  const chartData = data.map((p) => ({
    month:      p.month,
    Revenue:    p.projected_revenue,
    Expenses:   p.projected_expenses,
    Profit:     p.projected_profit,
    "Band Low":  p.confidence_band_low,
    "Band High": p.confidence_band_high,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          3-Month Cash Flow Forecast
        </h1>
        <p className="mt-1 text-sm text-[#777]">
          Based on trailing 6 complete months · exponential smoothing α=0.3 · growth capped ±20%
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.map((p) => (
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

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projected Profit with Confidence Band</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area type="monotone" dataKey="Band High" stroke="transparent" fill="url(#bandGrad)" name="Confidence High" />
              <Area type="monotone" dataKey="Band Low"  stroke="transparent" fill="transparent"    name="Confidence Low" />
              <Area type="monotone" dataKey="Profit"   stroke="#7030A0" strokeWidth={2} fill="url(#bandGrad)" />
              <Area type="monotone" dataKey="Revenue"  stroke="#18d26e" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
