"use client";

import "client-only";
import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/models/Cart";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: {
      id: string;
      title: string;
      image: string;
      priceEstimateMin: number;
      salePrice?: number;
      originalPrice?: number;
      slug: string;
      variantId?: string;
      variantLabel?: string;
    },
    quantity?: number
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Helper function to generate composite key
  const getItemKey = (item: CartItem | { id: string; variantId?: string }) => {
    return item.variantId ? `${item.id}-${item.variantId}` : item.id;
  };

  const addToCart = (
    product: {
      id: string;
      title: string;
      image: string;
      priceEstimateMin: number;
      salePrice?: number;
      originalPrice?: number;
      slug: string;
      variantId?: string;
      variantLabel?: string;
    },
    quantity: number = 1
  ) => {
    setItems((prev) => {
      // Create a composite key for matching: productId + variantId
      const itemKey = product.variantId
        ? `${product.id}-${product.variantId}`
        : product.id;

      // Find existing item by composite key
      const existing = prev.find((item) => {
        const existingKey = item.variantId
          ? `${item.id}-${item.variantId}`
          : item.id;
        return existingKey === itemKey;
      });

      if (existing) {
        const variantText = product.variantLabel
          ? ` (${product.variantLabel})`
          : "";
        toast.success(
          quantity > 1
            ? `Added ${quantity} more items to cart${variantText}`
            : `Updated quantity in cart${variantText}`
        );
        return prev.map((item) => {
          const existingKey = item.variantId
            ? `${item.id}-${item.variantId}`
            : item.id;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }

      // Use sale price if available, otherwise min estimate
      const price = product.salePrice ?? product.priceEstimateMin;
      const originalPrice =
        product.salePrice && product.originalPrice
          ? product.originalPrice
          : undefined;

      const variantText = product.variantLabel
        ? ` (${product.variantLabel})`
        : "";
      toast.success(
        quantity > 1
          ? `Added ${quantity} items to cart${variantText}`
          : `Added to cart${variantText}`
      );
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          image: product.image,
          price: price,
          originalPrice: originalPrice,
          quantity: quantity,
          slug: product.slug,
          variantId: product.variantId,
          variantLabel: product.variantLabel,
        },
      ];
    });
  };

  const removeFromCart = (compositeId: string) => {
    setItems((prev) => prev.filter((item) => getItemKey(item) !== compositeId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (compositeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(compositeId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        getItemKey(item) === compositeId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
