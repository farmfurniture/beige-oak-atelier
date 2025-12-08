"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, Printer, RefreshCw, ArrowUpRight, Plus, Eye, Calendar, Download } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Order, OrderStatus, PaymentStatus, formatOrderStatus, formatPaymentStatus, getOrderStatusColor } from "@/types/firestore";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/services/admin-api.service";

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
  { value: "failed", label: "Failed" },
];

const paymentFilters: Array<{ value: string; label: string }> = [
  { value: "all", label: "All payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const dateRangeFilters: Array<{ value: string; label: string }> = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
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
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No orders found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
      <div className="overflow-x-auto">
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
                  <Link href={`/admin/orders/${order.orderId}`} className="hover:underline">
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
                  <Badge className={cn("text-xs font-semibold", statusStyles[order.status])}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="uppercase text-xs w-fit">
                      {order.paymentMethod}
                    </Badge>
                    <span className={cn("text-xs", order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600')}>
                      {formatPaymentStatus(order.paymentStatus)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-foreground">{formatCurrency(order.pricing.total)}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {order.createdAt.toDate().toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/orders/${order.orderId}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading orders via admin API...');

      const ordersData = await fetchAdminOrders();

      console.log('Orders loaded:', ordersData.length);

      setOrders(ordersData);

      // Calculate stats from orders
      const statsData = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'pending').length,
        confirmed: ordersData.filter(o => o.status === 'confirmed').length,
        processing: ordersData.filter(o => o.status === 'processing').length,
        shipped: ordersData.filter(o => o.status === 'shipped').length,
        delivered: ordersData.filter(o => o.status === 'delivered').length,
        cancelled: ordersData.filter(o => o.status === 'cancelled').length,
        failed: ordersData.filter(o => o.status === 'failed').length,
        totalRevenue: ordersData
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + o.pricing.total, 0),
      };

      console.log('Stats calculated:', statsData);
      setStats(statsData);

      if (ordersData.length === 0) {
        toast.info("No orders found in database");
      }
    } catch (error: any) {
      console.error("Error loading orders:", error);
      console.error("Error message:", error?.message);

      if (error?.message?.includes('Unauthorized')) {
        toast.error("Session expired. Please login again.");
        window.location.href = '/admin/login';
      } else {
        toast.error("Failed to load orders: " + (error?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
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
      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      // Payment filter
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;

      // Search filter
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search) ||
        order.shippingAddress.fullName.toLowerCase().includes(search) ||
        order.userEmail.toLowerCase().includes(search);

      // Date range filter
      let matchesDate = true;
      const orderDate = order.createdAt.toDate();
      const now = new Date();

      if (dateRangeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchesDate = orderDate >= today;
      } else if (dateRangeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= weekAgo;
      } else if (dateRangeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        matchesDate = orderDate >= monthAgo;
      } else if (dateRangeFilter === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        matchesDate = orderDate >= start && orderDate <= end;
      }

      return matchesStatus && matchesPayment && matchesSearch && matchesDate;
    });
  }, [orders, statusFilter, paymentFilter, searchTerm, dateRangeFilter, startDate, endDate]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  // Show helpful message if no orders
  if (orders.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              There are no orders in the database yet, or you don't have permission to view them.
            </p>

            <div className="space-y-2">
              <p className="font-semibold">Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>No orders have been placed yet</li>
                <li>You are not set up as an admin user</li>
                <li>Firestore security rules are not deployed</li>
                <li>There's a permission issue</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="size-4 mr-2" />
                Retry Loading
              </Button>
              <Button onClick={() => window.location.href = '/admin/setup'}>
                Check Admin Setup
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Quick Fix:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to <a href="/admin/setup" className="text-primary hover:underline">/admin/setup</a></li>
                <li>Click "Create Admin Access"</li>
                <li>Come back to this page</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="flex flex-1 items-center rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-inner shadow-white/40">
              <Search className="mr-2 size-4 text-muted-foreground" />
              <Input
                className="border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search by Order #, Name, or Email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full border-white/60 bg-white/70 text-sm font-medium text-muted-foreground shadow-inner shadow-white/40">
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

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full border-white/60 bg-white/70 text-sm font-medium text-muted-foreground shadow-inner shadow-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full border-white/60 bg-white/70 text-sm font-medium text-muted-foreground shadow-inner shadow-white/40">
                  <Calendar className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dateRangeFilter === "custom" && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[150px] rounded-full border-white/60 bg-white/70 text-sm"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[150px] rounded-full border-white/60 bg-white/70 text-sm"
                  />
                </div>
              )}

              {(statusFilter !== "all" || paymentFilter !== "all" || dateRangeFilter !== "all" || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setPaymentFilter("all");
                    setDateRangeFilter("all");
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          <OrdersTable orders={filteredOrders} onStatusUpdate={handleStatusUpdate} />
        </CardContent>
      </Card>
    </section>
  );
}
