"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getOrder } from "@/services/firestore.service";
import { Order, orderToDisplay, formatOrderStatus, getOrderStatusColor, formatPaymentStatus } from "@/types/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Truck, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
import Image from "next/image";

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrder = async () => {
            if (!user && !authLoading) {
                // Redirect to login if not authenticated
                // router.push("/auth/sign-in");
                // For now, we'll let it try to load, but the service might fail or return null if rules enforce auth
                return;
            }

            if (authLoading) return;

            try {
                setLoading(true);
                const orderData = await getOrder(orderId);

                if (!orderData) {
                    setError("Order not found");
                    return;
                }

                // Security check: ensure user owns the order
                if (user && orderData.userId !== user.uid) {
                    setError("You don't have permission to view this order");
                    return;
                }

                setOrder(orderData);
            } catch (err) {
                console.error("Error loading order:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId, user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-muted-foreground">{error || "Order not found"}</p>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        );
    }

    const displayOrder = orderToDisplay(order);

    // Helper to get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 className="h-5 w-5" />;
            case 'shipped': return <Truck className="h-5 w-5" />;
            case 'processing': return <Package className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Order #{order.orderNumber}
                        </h1>
                        <p className="text-muted-foreground">
                            Placed on {displayOrder.createdAt.toLocaleDateString()} at {displayOrder.createdAt.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/catalog">Continue Shopping</Link>
                        </Button>
                        {/* <Button variant="outline">Download Invoice</Button> */}
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Status Card */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-full bg-${getOrderStatusColor(order.status)}-100 text-${getOrderStatusColor(order.status)}-600`}>
                                {getStatusIcon(order.status)}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Order Status: {formatOrderStatus(order.status)}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {order.status === 'pending' && "We've received your order and will confirm it shortly."}
                                    {order.status === 'confirmed' && "Your order has been confirmed and is being prepared."}
                                    {order.status === 'processing' && "We are packing your items."}
                                    {order.status === 'shipped' && "Your order is on the way!"}
                                    {order.status === 'delivered' && "Package delivered. Enjoy!"}
                                </p>
                            </div>
                        </div>

                        {/* Timeline (Simplified) */}
                        <div className="relative pl-8 border-l-2 border-muted space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[39px] bg-background p-1">
                                    <div className="h-4 w-4 rounded-full bg-primary" />
                                </div>
                                <p className="font-medium">Order Placed</p>
                                <p className="text-sm text-muted-foreground">
                                    {displayOrder.timeline.placedAt.toLocaleString()}
                                </p>
                            </div>

                            {displayOrder.timeline.confirmedAt && (
                                <div className="relative">
                                    <div className="absolute -left-[39px] bg-background p-1">
                                        <div className="h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                    <p className="font-medium">Order Confirmed</p>
                                    <p className="text-sm text-muted-foreground">
                                        {displayOrder.timeline.confirmedAt.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {displayOrder.timeline.shippedAt && (
                                <div className="relative">
                                    <div className="absolute -left-[39px] bg-background p-1">
                                        <div className="h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                    <p className="font-medium">Shipped</p>
                                    <p className="text-sm text-muted-foreground">
                                        {displayOrder.timeline.shippedAt.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Order Items */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 py-4 border-b last:border-0">
                                    <div className="relative h-20 w-20 flex-shrink-0 bg-secondary/20 rounded-md overflow-hidden">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{item.productName}</h3>
                                                {item.variant && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Variant: {item.variant.label || Object.values(item.variant).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Shipping & Billing */}
                        <Card className="p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="uppercase">
                                        {order.paymentMethod}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Status: <span className="font-medium text-foreground">{formatPaymentStatus(order.paymentStatus)}</span>
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Order Summary */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(order.pricing.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatCurrency(order.pricing.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{formatCurrency(order.pricing.tax)}</span>
                                </div>
                                {order.pricing.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(order.pricing.discount)}</span>
                                    </div>
                                )}

                                <Separator className="my-2" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(order.pricing.total)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
