"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, Printer, RefreshCw, ArrowUpRight, Plus, Eye } from "lucide-react";
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
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus, getOrderStatistics } from "@/services/firestore.service";
import { Order, OrderStatus, formatOrderStatus, getOrderStatusColor } from "@/types/firestore";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-sky-100 text-sky-700 border-sky-200",
  shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const statusFilters: Array<{ value: string; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function StatusSummaryCard({ label, count, trend, trendValue }: { label: string, count: number, trend: 'up' | 'down' | 'steady', trendValue: string }) {
  const trendColor = trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-rose-600" : "text-slate-500";
  const trendPrefix = trend === 'up' ? "+" : trend === 'down' ? "-" : "";

  return (
    <Card className="rounded-3xl border-none bg-white/70 shadow-lg shadow-primary/10 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{label}</CardTitle>
          <ArrowUpRight className="size-4 text-primary" strokeWidth={1.6} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-foreground">{count}</p>
        <p className={cn("text-sm font-medium", trendColor)}>
          {trendPrefix}{trendValue} vs last period
        </p>
      </CardContent>
    </Card>
  );
}

function OrdersTable({ orders, onStatusUpdate }: { orders: Order[], onStatusUpdate: (id: string, status: OrderStatus) => void }) {
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
              Items
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Payment
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Total
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Date
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId} className="bg-white/70">
              <TableCell className="font-semibold text-foreground">
                <Link href={`/orders/${order.orderId}`} className="hover:underline">
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{order.shippingAddress.fullName}</span>
                  <span className="text-xs text-muted-foreground">{order.userEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{order.items.length} items</span>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) => onStatusUpdate(order.orderId, value as OrderStatus)}
                >
                  <SelectTrigger className={cn("h-8 w-[130px] rounded-full border text-xs font-semibold", statusStyles[order.status])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters.filter(f => f.value !== 'all').map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase text-xs">
                  {order.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-foreground">{formatCurrency(order.pricing.total)}</TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {order.createdAt.toDate().toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/orders/${order.orderId}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        getAllOrders(),
        getOrderStatistics()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      // Optimistic update
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search) ||
        order.shippingAddress.fullName.toLowerCase().includes(search) ||
        order.userEmail.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusSummaryCard
          label="Total Orders"
          count={stats?.total || 0}
          trend="up"
          trendValue="12.5%"
        />
        <StatusSummaryCard
          label="Pending"
          count={stats?.pending || 0}
          trend="steady"
          trendValue="0%"
        />
        <StatusSummaryCard
          label="Delivered"
          count={stats?.delivered || 0}
          trend="up"
          trendValue="8.2%"
        />
        <StatusSummaryCard
          label="Revenue"
          count={formatCurrency(stats?.totalRevenue || 0) as any}
          trend="up"
          trendValue="15.3%"
        />
      </div>

      <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="gap-2">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <CardTitle className="text-xl font-semibold">Orders Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage customer orders
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
                onClick={loadData}
              >
                <RefreshCw className="size-4 mr-2" />
                Refresh
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
                placeholder="Search by Order #, Name, or Email..."
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
            </div>
          </div>

          <OrdersTable orders={filteredOrders} onStatusUpdate={handleStatusUpdate} />
        </CardContent>
      </Card>
    </section>
  );
}
