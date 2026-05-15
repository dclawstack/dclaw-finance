"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense, categorizeExpense, ocrReceipt } from "@/lib/api";

const CATEGORIES = ["office", "travel", "software", "marketing", "salary", "other"];

export default function NewExpensePage() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const triggerCategorize = useCallback(
    (desc: string, vend: string) => {
      if (!desc && !vend) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await categorizeExpense(desc, vend);
          setAiCategory(res.suggested_category);
          setAiConfidence(res.confidence);
          if (!category) setCategory(res.suggested_category);
        } catch {
          // silent — categorization is best-effort
        }
      }, 600);
    },
    [category]
  );

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    triggerCategorize(val, vendor);
  };

  const handleVendorChange = (val: string) => {
    setVendor(val);
    triggerCategorize(description, val);
  };

  const handleFile = async (file: File) => {
    setOcrLoading(true);
    try {
      const result = await ocrReceipt(file);
      if (result.vendor) setVendor(result.vendor);
      if (result.amount) setAmount(String(result.amount));
      if (result.date) setDate(result.date);
      if (result.description) setDescription(result.description);
      if (result.suggested_category) {
        setAiCategory(result.suggested_category);
        setCategory(result.suggested_category);
      }
    } catch {
      alert("Failed to read receipt.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createExpense({
        category,
        description,
        amount: Number(amount),
        date,
        vendor: vendor || null,
        receipt_url: null,
      });
      router.push("/expenses");
    } catch {
      alert("Failed to create expense.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Add Expense</h1>

      {/* Receipt OCR dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Receipt (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors ${
              dragOver ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {ocrLoading ? (
              <span className="text-slate-500">Reading receipt…</span>
            ) : (
              <>
                <span className="text-slate-500">Drag & drop a receipt image, or</span>
                <label className="mt-2 cursor-pointer text-emerald-600 underline">
                  browse
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vendor</Label>
              <Input value={vendor} onChange={(e) => handleVendorChange(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input required value={description} onChange={(e) => handleDescriptionChange(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                {aiCategory && (
                  <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">
                    AI: {aiCategory} {aiConfidence ? `(${Math.round(aiConfidence * 100)}%)` : ""}
                  </Badge>
                )}
              </div>
              <Select value={category} onValueChange={(val) => setCategory(val || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/expenses")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
}
