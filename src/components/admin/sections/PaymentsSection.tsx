"use client";

import { useEffect, useState } from "react";
import { DownloadCloud, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransactionEntry = {
  id: string;
  customer: string;
  amount: number;
  status: "Completed" | "Pending" | "Refunded";
  processedAt: string;
  gateway: "Razorpay";
  reference: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const statusStyles: Record<TransactionEntry["status"], string> = {
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Refunded: "bg-rose-100 text-rose-700 border-rose-200",
};

const gatewayStyles: Record<TransactionEntry["gateway"], string> = {
  Razorpay: "bg-primary/10 text-primary border-primary/20",
};

export function PaymentsSection() {
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const res = await fetch("/api/admin/payments");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load payments");
      }
      const data = await res.json();
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const handleRefresh = () => {
    void loadPayments(true);
  };

  const handleExportCsv = () => {
    if (!transactions.length) return;

    const headers = [
      "Transaction ID",
      "Customer",
      "Gateway",
      "Status",
      "Reference",
      "Processed At",
      "Amount (INR)",
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.customer || "",
      t.gateway,
      t.status,
      t.reference,
      new Date(t.processedAt).toISOString(),
      t.amount.toString(),
    ]);

    const escapeCell = (value: string) => {
      const needsQuotes = /[",\n]/.test(value);
      const escaped = value.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => escapeCell(cell)).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Payments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Live settlement overview across payment gateways.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={loading || !transactions.length}
              className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <DownloadCloud className="size-4" />
              Export report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-inner shadow-primary/10">
            {error ? (
              <p className="text-sm text-destructive">
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading latest payment activity..."
                  : "Monitor completed, pending, and refunded payments in real-time."}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-xl shadow-primary/10">
            <Table className="[&_tr]:border-white/40">
              <TableHeader className="bg-white/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Transaction
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Gateway
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Reference
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Processed
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No payments found yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="bg-white/70">
                      <TableCell className="font-semibold text-foreground">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {transaction.customer || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full border text-xs font-semibold uppercase tracking-widest",
                            gatewayStyles[transaction.gateway],
                          )}
                        >
                          {transaction.gateway}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full border text-xs font-semibold uppercase tracking-widest",
                            statusStyles[transaction.status],
                          )}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {transaction.reference}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(transaction.processedAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {currency.format(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
