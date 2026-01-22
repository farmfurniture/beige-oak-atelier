"use client";

// Force dynamic rendering for cart page
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotal, getItemCount, loading } =
    useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleProceedToCheckout = () => {
    if (authLoading) return;

    if (!user) {
      setShowLoginDialog(true);
    } else {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto" />
          <h1 className="exo-bold text-3xl text-foreground">
            Your Cart is Empty
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild size="lg" className="btn-premium">
            <Link href="/catalog">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="section-title text-foreground mb-4">Shopping Cart</h1>
          <p className="text-lg text-muted-foreground">
            {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              // Generate composite key for this item
              const itemKey = item.variantId
                ? `${item.id}-${item.variantId}`
                : item.id;

              return (
                <Card key={itemKey} className="p-6">
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/product/${item.slug}`}>
                            <h3 className="exo-medium text-xl text-foreground hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                          </Link>
                          {item.variantLabel && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Size: {item.variantLabel}
                            </p>
                          )}
                          <div className="mt-2">
                            {item.originalPrice &&
                              item.originalPrice > item.price ? (
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-primary">
                                  {formatCurrency(item.price)}
                                </p>
                                <p className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(item.originalPrice)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-semibold text-primary">
                                {formatCurrency(item.price)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(itemKey)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(itemKey, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(itemKey, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              <h2 className="exo-semibold text-2xl text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                className="w-full btn-premium"
                size="lg"
                disabled={authLoading}
              >
                Proceed to Checkout
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/catalog">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Login/Signup Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Sign in to Continue
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please sign in or create an account to proceed with your checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="w-full btn-premium"
            >
              <Link href="/sign-in" onClick={() => setShowLoginDialog(false)}>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Link href="/sign-up" onClick={() => setShowLoginDialog(false)}>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center pt-2">
            Your cart items will be saved
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

