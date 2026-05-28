"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createInvoice, suggestLineItems } from "@/lib/api";
import { formatINR } from "@/lib/utils";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Suggestion {
  description: string;
  typical_unit_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    setSuggestions([]);
  };

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);

    // Trigger suggestions when first item description is typed
    if (idx === 0 && field === "description" && clientName && String(value).length > 3) {
      setSuggestLoading(true);
      suggestLineItems(clientName, String(value))
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false));
    }
  };

  const applySuggestion = (s: Suggestion) => {
    setItems([...items, { description: s.description, quantity: 1, unit_price: s.typical_unit_price }]);
    setSuggestions((prev) => prev.filter((x) => x.description !== s.description));
  };

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((it) => !it.description.trim())) {
      alert("All line items must have a description.");
      return;
    }
    setSaving(true);
    try {
      await createInvoice({
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail,
        issue_date: issueDate,
        due_date: dueDate,
        status: "draft",
        tax_rate: taxRate,
        notes: notes || null,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      });
      router.push("/invoices");
    } catch {
      alert("Failed to create invoice.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Invoice Number</Label>
              <Input required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <Label>Client Name</Label>
              <Input required value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label>Client Email</Label>
              <Input type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div>
              <Label>Tax Rate (%)</Label>
              <Input type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input
                    required
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="w-32">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                  />
                </div>
                <div className="w-24 pb-2 text-right text-sm text-slate-600">
                  {formatINR(item.quantity * item.unit_price)}
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="outline" onClick={() => removeItem(idx)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}>
              + Add Item
            </Button>

            {/* AI Suggested line items */}
            {(suggestLoading || suggestions.length > 0) && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <span>AI Suggested Items</span>
                  {suggestLoading && <span className="text-xs text-emerald-600">Loading…</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      + {s.description} ({formatINR(s.typical_unit_price)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="space-y-1 text-sm text-slate-600">
              <div>Subtotal: {formatINR(subtotal)}</div>
              <div>Tax: {formatINR(taxAmount)}</div>
            </div>
            <div className="text-xl font-bold">Total: {formatINR(total)}</div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
