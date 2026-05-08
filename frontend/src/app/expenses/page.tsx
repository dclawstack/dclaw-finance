"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listExpenses, type Expense } from "@/lib/api";

const categoryColors: Record<string, string> = {
  office: "bg-slate-100 text-slate-700",
  travel: "bg-blue-100 text-blue-700",
  software: "bg-emerald-100 text-emerald-700",
  marketing: "bg-purple-100 text-purple-700",
  salary: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-500",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listExpenses(category || undefined)
      .then(setExpenses)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.vendor && exp.vendor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link href="/expenses/new">
          <Button>Add Expense</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={category} onValueChange={(val) => setCategory(val || "")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.date}</TableCell>
                      <TableCell>
                        <Badge className={categoryColors[exp.category] || ""}>
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.description}</TableCell>
                      <TableCell>{exp.vendor || "—"}</TableCell>
                      <TableCell className="text-right">
                        ${exp.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
