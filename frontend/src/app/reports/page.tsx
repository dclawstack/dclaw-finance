"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMonthlyReport } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function ReportsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    top_categories: Record<string, number>;
    summary: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (year < 2000 || year > 2099) {
      alert("Year must be between 2000 and 2099.");
      return;
    }
    if (month < 1 || month > 12) {
      alert("Month must be between 1 and 12.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateMonthlyReport(year, month);
      setReport(result);
    } catch (e: unknown) {
      alert(`Failed to generate report: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              className="w-28"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2099}
            />
          </div>
          <div>
            <Label>Month</Label>
            <Input
              type="number"
              className="w-20"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              min={1}
              max={12}
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">
                  {formatINR(report.revenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatINR(report.expenses)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {formatINR(report.profit)}
                </div>
              </CardContent>
            </Card>
          </div>

          {Object.keys(report.top_categories).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Cost Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(report.top_categories).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="capitalize text-slate-600">{cat}</span>
                      <span className="font-medium">{formatINR(amt as number)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary — {report.period}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                {report.summary}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
