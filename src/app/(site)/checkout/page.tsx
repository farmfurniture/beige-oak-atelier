"use client";

// Force dynamic rendering for checkout page
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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
import { Truck, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.id,
        productName: item.title,
        productSlug: item.slug,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image,
        variant: (item.variantId || item.polishType) ? {
          id: item.variantId,
          label: item.variantLabel,
          polishType: item.polishType,
        } : undefined
      }));

      // Prepare shipping address
      const shippingAddress = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        addressLine1: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pinCode: formData.zipCode,
        country: formData.country,
      };

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
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="exo-medium text-xl text-foreground">
                    Payment Method
                  </h2>
                </div>
                <div className="p-4 border rounded-lg bg-secondary/10 border-primary/20">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      checked
                      readOnly
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="cod" className="font-medium">Cash on Delivery (COD)</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-7">
                    Pay securely with cash when your order is delivered.
                  </p>
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
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order (COD)"}
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
