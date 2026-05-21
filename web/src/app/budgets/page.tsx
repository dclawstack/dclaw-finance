"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listBudgets,
  createBudget,
  deleteBudget,
  getBudgetStatus,
  type Budget,
  type BudgetStatus,
} from "@/lib/api";
import { formatINR } from "@/lib/utils";

const CATEGORIES = ["office", "travel", "software", "marketing", "salary", "other"];

export default function BudgetsPage() {
  const today = new Date();
  const [year]  = useState(today.getFullYear());
  const [month] = useState(today.getMonth() + 1);

  const [budgets,       setBudgets]       = useState<Budget[]>([]);
  const [statuses,      setStatuses]      = useState<BudgetStatus[]>([]);
  const [newCategory,   setNewCategory]   = useState("");
  const [newLimit,      setNewLimit]      = useState("");
  const [loading,       setLoading]       = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [saving,        setSaving]        = useState(false);

  // Per-card inline edit state: category → draft limit string
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState("");

  const load = async () => {
    setLoading(true);
    setBudgets(await listBudgets(year, month));
    setLoading(false);
  };

  const loadStatus = async () => {
    setStatusLoading(true);
    setStatuses(await getBudgetStatus(year, month));
    setStatusLoading(false);
  };

  useEffect(() => { load().then(loadStatus); }, []);

  // Whether the selected category already has a budget this month
  const existingForCategory = newCategory
    ? budgets.find((b) => b.category === newCategory)
    : undefined;

  const handleSet = async () => {
    if (!newCategory || !newLimit) return;
    setSaving(true);
    try {
      // Backend upserts: creates or updates existing budget for this category/month
      await createBudget({ category: newCategory, monthly_limit: Number(newLimit), year, month });
      setNewCategory("");
      setNewLimit("");
      await load();
      await loadStatus();
    } catch (e: unknown) {
      alert(`Failed: ${e instanceof Error ? e.message : "error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineEdit = (budgetId: string, currentLimit: number) => {
    setEditingId(budgetId);
    setEditingLimit(String(currentLimit));
  };

  const handleInlineSave = async (b: Budget) => {
    if (!editingLimit) return;
    try {
      // Use POST (upsert) — same as create form
      await createBudget({ category: b.category, monthly_limit: Number(editingLimit), year, month });
      setEditingId(null);
      await load();
      await loadStatus();
    } catch (e: unknown) {
      alert(`Failed: ${e instanceof Error ? e.message : "error"}`);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
    setEditingId(null);
    await load();
    await loadStatus();
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#ededed] pb-4">
        <h1 className="text-3xl font-extrabold text-[#333]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Budgets — {monthName}
        </h1>
        <p className="mt-1 text-sm text-[#777]">Set monthly spend limits per category. Click Edit on any card to update.</p>
      </div>

      {/* Set / update budget form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {existingForCategory ? `Update ${existingForCategory.category.charAt(0).toUpperCase() + existingForCategory.category.slice(1)} Budget` : "Set New Budget"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <Label>Category</Label>
            <Select
              value={newCategory}
              onValueChange={(val) => {
                setNewCategory(val);
                const existing = budgets.find((b) => b.category === val);
                if (existing) setNewLimit(String(existing.monthly_limit));
                else setNewLimit("");
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                    {budgets.find((b) => b.category === c) ? " ✓" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Monthly Limit (₹)</Label>
            <Input
              type="number"
              className="w-40"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              min={0}
              placeholder="e.g. 20000000"
            />
            {newLimit && Number(newLimit) >= 100000 && (
              <p className="mt-1 text-xs text-[#7030A0]">{formatINR(Number(newLimit))}</p>
            )}
          </div>
          <Button onClick={handleSet} disabled={!newCategory || !newLimit || saving}>
            {saving ? "Saving…" : existingForCategory ? "Update Budget" : "Add Budget"}
          </Button>
        </CardContent>
      </Card>

      {/* Budget status cards */}
      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : statuses.length === 0 ? (
        <p className="text-sm text-[#777]">No budgets set for this month.</p>
      ) : (
        <div className="space-y-4">
          {statuses.map((s) => {
            const pct        = Math.min(s.utilization * 100, 100);
            const budget     = budgets.find((b) => b.id === s.budget_id);
            const isBreaching = s.utilization >= 0.8;
            const isEditing  = editingId === s.budget_id;

            return (
              <Card key={s.budget_id} className="overflow-hidden">
                <div
                  className="h-1 w-full"
                  style={{ background: isBreaching ? "#dc2626" : "#7030A0" }}
                />
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold capitalize text-[#333]">{s.category}</div>

                    {isEditing ? (
                      /* ── Inline edit mode ── */
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type="number"
                            className="w-40 pr-2"
                            value={editingLimit}
                            onChange={(e) => setEditingLimit(e.target.value)}
                            min={0}
                            autoFocus
                          />
                          {editingLimit && Number(editingLimit) >= 100000 && (
                            <p className="absolute -bottom-4 left-0 text-xs text-[#7030A0]">
                              {formatINR(Number(editingLimit))}
                            </p>
                          )}
                        </div>
                        <Button size="sm" onClick={() => budget && handleInlineSave(budget)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      /* ── Display mode ── */
                      <div className="flex items-center gap-2 text-sm text-[#777]">
                        <span className="tabular-nums">
                          {formatINR(s.actual_spend)}
                          <span className="mx-1 text-[#bbb]">/</span>
                          {formatINR(s.monthly_limit)}
                        </span>
                        {budget && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInlineEdit(s.budget_id, s.monthly_limit)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(budget.id)}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-[#f2f2f2]">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isBreaching ? "#dc2626" : "#7030A0",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#777]">
                    <span>{pct.toFixed(0)}% used</span>
                    {isBreaching && (
                      <span className="font-semibold text-red-600">⚠ Over 80% threshold</span>
                    )}
                  </div>

                  {s.ai_suggestion && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                      <span className="font-medium">AI Suggestion: </span>
                      {s.ai_suggestion}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
