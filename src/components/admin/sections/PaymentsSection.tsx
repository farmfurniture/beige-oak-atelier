"use client";

import { useMemo } from "react";
import { DownloadCloud } from "lucide-react";
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
import { getPaymentsData, type TransactionEntry } from "@/services/admin.service";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const statusStyles: Record<TransactionEntry["status"], string> = {
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Refunded: "bg-rose-100 text-rose-700 border-rose-200",
};

const gatewayStyles: Record<TransactionEntry["gateway"], string> = {
  Stripe: "bg-primary/10 text-primary border-primary/20",
  Square: "bg-sky-100 text-sky-700 border-sky-200",
  PayPal: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function PaymentsSection() {
  const { transactions } = useMemo(() => getPaymentsData(), []);

  return (
    <section>
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Payments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Settlement outlook across Stripe, Square, and bespoke partner gateways.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <DownloadCloud className="size-4" />
            Export report
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-inner shadow-primary/10">
            <p className="text-sm text-muted-foreground">
              Settlements trending on schedule. Monitor pending high-value orders for bespoke white-glove deliveries.
            </p>
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
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="bg-white/70">
                    <TableCell className="font-semibold text-foreground">{transaction.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{transaction.customer}</TableCell>
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
                    <TableCell className="text-xs font-mono text-muted-foreground">{transaction.reference}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(transaction.processedAt).toLocaleString("en-US", {
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
