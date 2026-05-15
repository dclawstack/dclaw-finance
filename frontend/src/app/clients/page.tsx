"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientProfitability, type ClientScore } from "@/lib/api";
import { formatINR } from "@/lib/utils";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-100 text-emerald-700" :
    score >= 40 ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";
  return <Badge className={color}>{score}</Badge>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getClientProfitability()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading client scores…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Client Profitability</h1>
      <p className="text-sm text-slate-500">
        Clients ranked by composite score (revenue weight 70%, outstanding balance 30%).
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Ranked Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-500">No invoice data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c, i) => (
                  <>
                    <TableRow
                      key={c.client_name}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setExpanded(expanded === c.client_name ? null : c.client_name)}
                    >
                      <TableCell className="text-slate-400">{i + 1}</TableCell>
                      <TableCell className="font-medium">{c.client_name}</TableCell>
                      <TableCell className="text-right">{formatINR(c.total_revenue)}</TableCell>
                      <TableCell className="text-right">
                        {c.outstanding > 0 ? (
                          <span className="text-red-600">{formatINR(c.outstanding)}</span>
                        ) : (
                          <span className="text-emerald-600">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{c.invoice_count}</TableCell>
                      <TableCell className="text-center">
                        <ScoreBadge score={c.score} />
                      </TableCell>
                    </TableRow>
                    {expanded === c.client_name && c.ai_insight && (
                      <TableRow key={`${c.client_name}-insight`}>
                        <TableCell colSpan={6} className="bg-slate-50 text-sm text-slate-600 italic">
                          {c.ai_insight}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
