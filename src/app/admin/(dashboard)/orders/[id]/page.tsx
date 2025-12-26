"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getOrder, updateOrderStatus, updateOrderTracking } from "@/services/firestore.service";
import { Order, OrderStatus, PaymentStatus, formatOrderStatus, formatPaymentStatus, getOrderStatusColor, getPaymentStatusColor, canUpdateOrderStatus } from "@/types/firestore";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
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

const paymentStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("pending");
  const [adminNote, setAdminNote] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await getOrder(orderId);
      if (orderData) {
        setOrder(orderData);
        setNewStatus(orderData.status);
        setNewPaymentStatus(orderData.paymentStatus);
        setAdminNote(orderData.notes?.adminNote || "");
        setTrackingCarrier(orderData.tracking?.carrier || "");
        setTrackingNumber(orderData.tracking?.trackingNumber || "");
        setTrackingUrl(orderData.tracking?.trackingUrl || "");
      } else {
        toast.error("Order not found");
        router.push("/admin/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    if (!canUpdateOrderStatus(order.status, newStatus)) {
      toast.error(`Cannot change status from ${order.status} to ${newStatus}`);
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(orderId, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        adminNote: adminNote || undefined,
      });
      toast.success("Order status updated successfully");
      await loadOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingCarrier || !trackingNumber) {
      toast.error("Please provide carrier and tracking number");
      return;
    }

    try {
      setUpdating(true);
      await updateOrderTracking(orderId, {
        carrier: trackingCarrier,
        trackingNumber: trackingNumber,
        trackingUrl: trackingUrl || undefined,
      });
      toast.success("Tracking information updated");
      await loadOrder();
    } catch (error) {
      console.error("Error updating tracking:", error);
      toast.error("Failed to update tracking");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {order.createdAt.toDate().toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("text-sm px-4 py-1", statusStyles[order.status])}>
            {formatOrderStatus(order.status)}
          </Badge>
          <Badge className={cn("text-sm px-4 py-1", paymentStatusStyles[order.paymentStatus])}>
            {formatPaymentStatus(order.paymentStatus)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productName}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(", ")}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Pricing Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.pricing.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.pricing.shippingCost)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.pricing.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.pricing.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping Info */}
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Customer & Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {order.userEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.userPhone}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-muted-foreground">Landmark: {order.shippingAddress.landmark}</p>
                  )}
                  <p className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm uppercase">{order.paymentMethod}</span>
                </div>
              </div>

              {order.notes?.customerNote && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Customer Note</h4>
                    <p className="text-sm text-muted-foreground">{order.notes.customerNote}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={newPaymentStatus} onValueChange={(value) => setNewPaymentStatus(value as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Note</Label>
                <Textarea
                  placeholder="Add internal notes..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={updating || (newStatus === order.status && newPaymentStatus === order.paymentStatus && adminNote === (order.notes?.adminNote || ""))}
                className="w-full"
              >
                {updating ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input
                  placeholder="e.g., Delhivery, Blue Dart"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tracking URL (Optional)</Label>
                <Input
                  placeholder="https://..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdateTracking}
                disabled={updating || !trackingCarrier || !trackingNumber}
                className="w-full"
                variant="outline"
              >
                {updating ? "Updating..." : "Update Tracking"}
              </Button>

              {order.tracking?.trackingUrl && (
                <Button
                  asChild
                  variant="link"
                  className="w-full"
                >
                  <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer">
                    View Tracking
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={<Package className="h-4 w-4" />}
                  label="Order Placed"
                  date={order.timeline.placedAt.toDate()}
                  completed
                />
                {order.timeline.confirmedAt && (
                  <TimelineItem
                    icon={<CheckCircle className="h-4 w-4" />}
                    label="Confirmed"
                    date={order.timeline.confirmedAt.toDate()}
                    completed
                  />
                )}
                {order.timeline.shippedAt && (
                  <TimelineItem
                    icon={<Truck className="h-4 w-4" />}
                    label="Shipped"
                    date={order.timeline.shippedAt.toDate()}
                    completed
                  />
                )}
                {order.timeline.deliveredAt && (
                  <TimelineItem
                    icon={<CheckCircle className="h-4 w-4" />}
                    label="Delivered"
                    date={order.timeline.deliveredAt.toDate()}
                    completed
                  />
                )}
                {order.timeline.cancelledAt && (
                  <TimelineItem
                    icon={<XCircle className="h-4 w-4" />}
                    label="Cancelled"
                    date={order.timeline.cancelledAt.toDate()}
                    completed
                    cancelled
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon,
  label,
  date,
  completed,
  cancelled = false,
}: {
  icon: React.ReactNode;
  label: string;
  date: Date;
  completed: boolean;
  cancelled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        completed ? (cancelled ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600") : "bg-gray-100 text-gray-400"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{date.toLocaleString()}</p>
      </div>
    </div>
  );
}
