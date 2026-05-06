"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [forecastMonths, setForecastMonths] = useState("12");
  const [results, setResults] = useState<{
    projectedRevenue: string;
    riskScore: number;
    breakEvenMonth: number;
  } | null>(null);

  const handleRunForecast = () => {
    const rev = parseFloat(revenue) || 0;
    const exp = parseFloat(expenses) || 0;
    const months = parseInt(forecastMonths) || 12;
    const projectedRevenue = rev * (1 + months * 0.02);
    const riskScore = Math.floor(Math.random() * 100) + 1;
    const breakEvenMonth = rev > exp ? Math.ceil(exp / (rev - exp)) : months;

    setResults({
      projectedRevenue: projectedRevenue.toFixed(2),
      riskScore,
      breakEvenMonth,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-[#059669]" />
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Model Inputs
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Revenue
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="e.g. 100000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expenses
                </label>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  placeholder="e.g. 75000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Forecast Months
                </label>
                <input
                  type="number"
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(e.target.value)}
                  placeholder="e.g. 12"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>
              <button
                onClick={handleRunForecast}
                className="inline-flex w-full justify-center rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Run Forecast
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Forecast Results
            </h2>
            {results ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Projected Revenue</p>
                  <p className="text-2xl font-bold text-[#059669]">
                    ${results.projectedRevenue}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="text-2xl font-bold text-[#059669]">
                    {results.riskScore}/100
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Break-even Month</p>
                  <p className="text-2xl font-bold text-[#059669]">
                    Month {results.breakEvenMonth}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Enter inputs and click Run Forecast to see results.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
