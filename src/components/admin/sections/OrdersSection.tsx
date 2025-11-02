"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Printer, RefreshCw, ArrowUpRight, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getOrders, type OrderEntry, type OrderStatusSummary, type TrendDirection } from "@/services/admin.service";
import { toast } from "sonner";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusStyles: Record<OrderEntry["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Processing: "bg-sky-100 text-sky-700 border-sky-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Delayed: "bg-rose-100 text-rose-700 border-rose-200",
};

const trendStyles: Record<TrendDirection, { className: string; prefix: "+" | "-" | "" }> = {
  up: { className: "text-emerald-600", prefix: "+" },
  down: { className: "text-rose-600", prefix: "-" },
  steady: { className: "text-slate-500", prefix: "" },
};

const statusFilters: Array<{ value: string; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Delayed", label: "Delayed" },
];

const channelFilters: Array<{ value: string; label: string }> = [
  { value: "all", label: "All channels" },
  { value: "Online", label: "Online" },
  { value: "Showroom", label: "Showroom" },
  { value: "Wellness Partners", label: "Wellness Partners" },
];

function StatusSummaryCard({ summary }: { summary: OrderStatusSummary }) {
  const trend = trendStyles[summary.trend];
  return (
    <Card className="rounded-3xl border-none bg-white/70 shadow-lg shadow-primary/10 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{summary.label}</CardTitle>
          <ArrowUpRight className="size-4 text-primary" strokeWidth={1.6} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-foreground">{summary.count}</p>
        <p className={cn("text-sm font-medium", trend.className)}>
          {trend.prefix}
          {summary.change.toFixed(1)}% vs last period
        </p>
      </CardContent>
    </Card>
  );
}

function OrdersTable({ orders }: { orders: OrderEntry[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
      <Table className="[&_tr]:border-white/40">
        <TableHeader className="bg-white/40">
          <TableRow>
            <TableHead className="py-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Order ID
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Customer
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Channel
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Fulfillment
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Total
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Placed
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="bg-white/70">
              <TableCell className="font-semibold text-foreground">{order.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{order.customer}</span>
                  {order.note ? (
                    <span className="text-xs text-muted-foreground">{order.note}</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="rounded-full border-primary/10 bg-primary/10 text-xs font-semibold text-primary">
                  {order.channel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn("rounded-full border text-xs font-semibold", statusStyles[order.status])}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
                  {order.fulfillmentEta}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-foreground">{currency.format(order.total)}</TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {new Date(order.orderedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrdersSection() {
  const { summary, entries } = useMemo(() => getOrders(), []);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    email: "",
    phone: "",
    channel: "Online",
    status: "Pending",
    items: "",
    total: "",
    note: "",
  });

  const filteredOrders = useMemo(() => {
    return entries.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesChannel = channelFilter === "all" || order.channel === channelFilter;
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        order.id.toLowerCase().includes(search) ||
        order.customer.toLowerCase().includes(search) ||
        order.channel.toLowerCase().includes(search);
      return matchesStatus && matchesChannel && matchesSearch;
    });
  }, [channelFilter, entries, statusFilter, searchTerm]);

  const handleCreateOrder = () => {
    // Validate required fields
    if (!newOrder.customer || !newOrder.email || !newOrder.total) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here you would typically call an API to create the order
    toast.success("Order created successfully!");
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewOrder({
      customer: "",
      email: "",
      phone: "",
      channel: "Online",
      status: "Pending",
      items: "",
      total: "",
      note: "",
    });
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <StatusSummaryCard key={item.id} summary={item} />
        ))}
      </div>

      <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="gap-2">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <CardTitle className="text-xl font-semibold">Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track fulfillment velocity across digital and experiential retail channels.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="size-4" />
                    Create Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                      Add a new order manually from the admin panel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer Name *</Label>
                        <Input
                          id="customer"
                          value={newOrder.customer}
                          onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newOrder.email}
                          onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newOrder.phone}
                          onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total">Total Amount *</Label>
                        <Input
                          id="total"
                          type="number"
                          value={newOrder.total}
                          onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
                          placeholder="1299.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="channel">Channel</Label>
                        <Select value={newOrder.channel} onValueChange={(value) => setNewOrder({ ...newOrder, channel: value })}>
                          <SelectTrigger id="channel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Showroom">Showroom</SelectItem>
                            <SelectItem value="Wellness Partners">Wellness Partners</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={newOrder.status} onValueChange={(value) => setNewOrder({ ...newOrder, status: value })}>
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Delayed">Delayed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="items">Order Items</Label>
                      <Textarea
                        id="items"
                        value={newOrder.items}
                        onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                        placeholder="e.g., 1x Beige Oak Bed Frame, 2x Premium Pillows"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Order Note</Label>
                      <Textarea
                        id="note"
                        value={newOrder.note}
                        onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })}
                        placeholder="Any special instructions or notes..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOrder}>
                      Create Order
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <RefreshCw className="size-4" />
                Update status
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <Printer className="size-4" />
                Print docs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-inner shadow-white/40">
              <Search className="mr-2 size-4 text-muted-foreground" />
              <Input
                className="border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search orders, guests, or channels..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full min-w-[180px] rounded-full border-white/60 bg-white/70 text-sm font-medium text-muted-foreground shadow-inner shadow-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-full min-w-[200px] rounded-full border-white/60 bg-white/70 text-sm font-medium text-muted-foreground shadow-inner shadow-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                className="rounded-full border border-dashed border-white/50 bg-white/70 px-4 text-sm font-medium text-muted-foreground hover:bg-white"
              >
                <SlidersHorizontal className="size-4" />
                Advanced
              </Button>
            </div>
          </div>

          <OrdersTable orders={filteredOrders} />
        </CardContent>
      </Card>
    </section>
  );
}
