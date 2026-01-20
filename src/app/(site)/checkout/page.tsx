"use client";

// Force dynamic rendering for checkout page
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { createOrder } from "@/services/firestore.service";
import { CreateOrderInput, OrderItem } from "@/types/firestore";
import { Timestamp } from "firebase/firestore";
import { Truck, MapPin, Phone, User, CreditCard } from "lucide-react";
import Image from "next/image";
import { clientEnv } from "@/config/client-env";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    country: "India",
  });

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setProcessingPayment(true);

    try {
      const subtotal = getTotal();
      const shippingCost = 0;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + shippingCost + tax;

      // Create order in Firestore first (with pending payment status)
      const orderItems: OrderItem[] = items.map(item => {
        const orderItem: OrderItem = {
          productId: item.id,
          productName: item.title,
          productSlug: item.slug,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image,
        };

        // Only add variant if we have valid variant data
        if (item.variantId || item.polishType) {
          const variant: any = {};
          if (item.variantId) variant.id = item.variantId;
          if (item.variantLabel) variant.label = item.variantLabel;
          if (item.polishType) variant.polishType = item.polishType;
          
          // Only add variant if it has at least one property
          if (Object.keys(variant).length > 0) {
            orderItem.variant = variant;
          }
        }

        return orderItem;
      });

      const shippingAddress: any = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        addressLine1: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.zipCode,
        country: formData.country,
      };

      // Only include addressLine2 if it has a value
      if (formData.addressLine2 && formData.addressLine2.trim()) {
        shippingAddress.addressLine2 = formData.addressLine2.trim();
      }

      const orderInput: CreateOrderInput = {
        userId: user.uid,
        userEmail: formData.email,
        userPhone: formData.phone,
        status: 'pending',
        paymentMethod: 'online',
        paymentStatus: 'pending',
        items: orderItems,
        pricing: {
          subtotal,
          tax,
          shippingCost,
          discount: 0,
          total
        },
        shippingAddress,
        billingAddress: shippingAddress,
        timeline: {
          placedAt: Timestamp.now()
        }
      };

      const orderId = await createOrder(orderInput);

      // Create Razorpay order
      const response = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          receipt: `order_${orderId}`,
          notes: {
            orderId: orderId,
            userId: user.uid,
          },
        }),
      });

      const razorpayOrder = await response.json();

      if (!response.ok) {
        throw new Error(razorpayOrder.error || 'Failed to create payment order');
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      // Initialize Razorpay checkout
      const options = {
        key: clientEnv.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Farm Craft',
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // Verify payment on server
          const verifyResponse = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            toast.success("Payment successful!");
            await clearCart();
            router.push(`/orders/${orderId}`);
          } else {
            toast.error("Payment verification failed");
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000', // Match your brand color
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessingPayment(false);
      });

    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      return;
    }

    if (!user) {
      toast.error("Please login to place an order");
      // Ideally redirect to login with return url
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const subtotal = getTotal();
      const shippingCost = 0; // Free shipping logic can be added here
      const tax = Math.round(subtotal * 0.05); // 5% tax
      const total = subtotal + shippingCost + tax;

      // Prepare order items with polishType included in variant
      const orderItems: OrderItem[] = items.map(item => {
        const orderItem: OrderItem = {
          productId: item.id,
          productName: item.title,
          productSlug: item.slug,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image,
        };

        // Only add variant if we have valid variant data
        if (item.variantId || item.polishType) {
          const variant: any = {};
          if (item.variantId) variant.id = item.variantId;
          if (item.variantLabel) variant.label = item.variantLabel;
          if (item.polishType) variant.polishType = item.polishType;
          
          // Only add variant if it has at least one property
          if (Object.keys(variant).length > 0) {
            orderItem.variant = variant;
          }
        }

        return orderItem;
      });

      // Prepare shipping address
      const shippingAddress: any = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        addressLine1: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.zipCode,
        country: formData.country,
      };

      // Only include addressLine2 if it has a value
      if (formData.addressLine2 && formData.addressLine2.trim()) {
        shippingAddress.addressLine2 = formData.addressLine2.trim();
      }

      const orderInput: CreateOrderInput = {
        userId: user.uid,
        userEmail: formData.email,
        userPhone: formData.phone,
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        items: orderItems,
        pricing: {
          subtotal,
          tax,
          shippingCost,
          discount: 0,
          total
        },
        shippingAddress,
        billingAddress: shippingAddress, // Same for now
        timeline: {
          placedAt: Timestamp.now()
        }
      };

      const orderId = await createOrder(orderInput);

      toast.success("Order placed successfully!");
      await clearCart();
      router.push(`/orders/${orderId}`);

    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = getTotal();
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Razorpay SDK loaded');
        }}
      />
      
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="section-title text-foreground mb-4">
            Checkout
          </h1>
          <p className="text-lg text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="exo-medium text-xl text-foreground">
                    Contact Information
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      disabled={!!user?.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 98765 43210"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="exo-medium text-xl text-foreground">
                    Shipping Address
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address Line 1 *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Street address, P.O. box, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">PIN Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        placeholder="110001"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="exo-medium text-xl text-foreground">
                    Payment Method
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-secondary/10 border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="cod" className="font-medium cursor-pointer">Cash on Delivery (COD)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-7">
                      Pay securely with cash when your order is delivered.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-secondary/10 border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="razorpay"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="razorpay" className="font-medium cursor-pointer">Pay Online (Razorpay)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-7">
                      Pay securely using UPI, Cards, Net Banking, or Wallets.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 space-y-4">
                <h2 className="exo-medium text-xl text-foreground">
                  Order Summary
                </h2>

                <Separator />

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-premium"
                  size="lg"
                  disabled={loading || processingPayment}
                >
                  {processingPayment 
                    ? "Processing Payment..." 
                    : paymentMethod === 'razorpay'
                    ? "Pay Now"
                    : loading 
                    ? "Placing Order..." 
                    : "Place Order (COD)"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
