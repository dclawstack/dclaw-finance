"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoice, updateInvoice, deleteInvoice, draftReminder, type Invoice } from "@/lib/api";
import { formatINR } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSubject, setReminderSubject] = useState("");
  const [reminderBody, setReminderBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getInvoice(id)
      .then(setInvoice)
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (status: string) => {
    if (!invoice) return;
    try {
      const updated = await updateInvoice(invoice.id, { status });
      setInvoice(updated);
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoice(invoice.id);
      router.push("/invoices");
    } catch {
      alert("Failed to delete invoice.");
    }
  };

  const handleDraftReminder = async () => {
    if (!invoice) return;
    setReminderLoading(true);
    setReminderOpen(true);
    try {
      const draft = await draftReminder(invoice.id);
      setReminderSubject(draft.subject);
      setReminderBody(draft.body);
    } catch {
      alert("Failed to generate reminder draft.");
      setReminderOpen(false);
    } finally {
      setReminderLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${reminderSubject}\n\n${reminderBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (!invoice) return <div className="text-red-500">Invoice not found.</div>;

  const canDraftReminder = invoice.status === "overdue" || invoice.status === "sent";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <Badge className={statusColors[invoice.status] || ""}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <Button variant="outline" onClick={() => changeStatus("sent")}>
              Mark Sent
            </Button>
          )}
          {invoice.status === "sent" && (
            <Button variant="outline" onClick={() => changeStatus("paid")}>
              Mark Paid
            </Button>
          )}
          {canDraftReminder && (
            <Button variant="outline" onClick={handleDraftReminder}>
              Draft Reminder
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-slate-500">Client</div>
            <div className="font-medium">{invoice.client_name}</div>
            <div className="text-sm text-slate-500">{invoice.client_email}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Issue Date</div>
            <div className="font-medium">{invoice.issue_date}</div>
            <div className="text-sm text-slate-500">Due Date</div>
            <div className="font-medium">{invoice.due_date}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(item.unit_price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-right text-sm text-[#777] tabular-nums">
            <div>Subtotal: {formatINR(invoice.subtotal)}</div>
            <div>Tax ({invoice.tax_rate}%): {formatINR(invoice.tax_amount)}</div>
            <div className="text-lg font-bold text-[#333]">
              Total: {formatINR(invoice.total)}
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <Link href="/invoices" className="text-sm text-emerald-700 hover:underline">
          ← Back to invoices
        </Link>
      </div>

      {/* Reminder Draft Dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Reminder Draft</DialogTitle>
          </DialogHeader>
          {reminderLoading ? (
            <div className="py-8 text-center text-slate-500">Drafting reminder…</div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                />
              </div>
              <div>
                <Label>Body</Label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={8}
                  value={reminderBody}
                  onChange={(e) => setReminderBody(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReminderOpen(false)}>
                  Close
                </Button>
                <Button onClick={copyToClipboard}>
                  {copied ? "Copied!" : "Copy to clipboard"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
