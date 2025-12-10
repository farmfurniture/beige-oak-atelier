"use client";

import "client-only";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/models/Cart";
import { useAuth } from "@/context/AuthContext";
import * as firestoreService from "@/services/firestore.service";

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
      polishType?: string;
      polishTypeLabel?: string;
    },
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to generate composite key
  const getItemKey = (item: CartItem | { id: string; variantId?: string }) => {
    return item.variantId ? `${item.id}-${item.variantId}` : item.id;
  };

  // Load cart from Firestore when user logs in, or localStorage for guests
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        setLoading(true);
        try {
          const firestoreCart = await firestoreService.getCart(user.uid);
          if (firestoreCart) {
            const mappedItems: CartItem[] = firestoreCart.items.map((item) => ({
              id: item.productId,
              title: item.productName,
              image: item.imageUrl,
              price: item.price,
              quantity: item.quantity,
              slug: item.productSlug,
              variantId: item.variant?.id,
              variantLabel: item.variant?.label,
              polishType: item.variant?.polishType,
              polishTypeLabel: item.variant?.polishType,
            }));
            setItems(mappedItems);
          } else {
            setItems([]);
          }
        } catch (error) {
          console.error("Error loading cart from Firestore:", error);
          setItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from local storage for guest users
        try {
          const savedCart = localStorage.getItem('guest_cart');
          if (savedCart) {
            setItems(JSON.parse(savedCart));
          } else {
            setItems([]);
          }
        } catch (error) {
          console.error("Error loading cart from localStorage:", error);
          setItems([]);
        }
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  const addToCart = async (
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
      polishType?: string;
      polishTypeLabel?: string;
    },
    quantity: number = 1
  ) => {
    // Use sale price if available, otherwise min estimate
    const price = product.salePrice ?? product.priceEstimateMin;
    const originalPrice =
      product.salePrice && product.originalPrice
        ? product.originalPrice
        : undefined;

    const newItem: CartItem = {
      id: product.id,
      title: product.title,
      image: product.image,
      price: price,
      originalPrice: originalPrice,
      quantity: quantity,
      slug: product.slug,
      variantId: product.variantId,
      variantLabel: product.variantLabel,
      polishType: product.polishType,
      polishTypeLabel: product.polishTypeLabel,
    };

    const updatedItems = (() => {
      const itemKey = getItemKey(newItem);
      const existingIndex = items.findIndex((item) => getItemKey(item) === itemKey);

      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...items, newItem];
    })();

    setItems(updatedItems);

    const variantText = product.variantLabel ? ` (${product.variantLabel})` : "";
    toast.success(
      quantity > 1
        ? `Added ${quantity} items to cart${variantText}`
        : `Added to cart${variantText}`
    );

    // Sync with Firestore if logged in, or localStorage if guest
    if (user) {
      try {
        await firestoreService.addToCart(user.uid, {
          productId: product.id,
          productName: product.title,
          productSlug: product.slug,
          quantity: quantity,
          price: price,
          imageUrl: product.image,
          variant: product.variantId ? {
            id: product.variantId,
            label: product.variantLabel,
            polishType: product.polishTypeLabel || product.polishType,
          } : (product.polishType ? {
            polishType: product.polishTypeLabel || product.polishType,
          } : undefined),
        });
      } catch (error) {
        console.error("Error syncing cart to Firestore:", error);
      }
    } else {
      // Save to localStorage for guest users
      try {
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  const removeFromCart = async (compositeId: string) => {
    const itemToRemove = items.find((item) => getItemKey(item) === compositeId);
    const updatedItems = items.filter((item) => getItemKey(item) !== compositeId);

    setItems(updatedItems);
    toast.success("Removed from cart");

    if (user && itemToRemove) {
      try {
        await firestoreService.removeFromCart(
          user.uid,
          itemToRemove.id,
          itemToRemove.variantId ? { id: itemToRemove.variantId, label: itemToRemove.variantLabel } : undefined
        );
      } catch (error) {
        console.error("Error removing from Firestore:", error);
      }
    } else {
      try {
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  const updateQuantity = async (compositeId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(compositeId);
      return;
    }

    const itemToUpdate = items.find((item) => getItemKey(item) === compositeId);
    const updatedItems = items.map((item) =>
      getItemKey(item) === compositeId ? { ...item, quantity } : item
    );

    setItems(updatedItems);

    if (user && itemToUpdate) {
      try {
        await firestoreService.updateCartItemQuantity(
          user.uid,
          itemToUpdate.id,
          quantity,
          itemToUpdate.variantId ? { id: itemToUpdate.variantId, label: itemToUpdate.variantLabel } : undefined
        );
      } catch (error) {
        console.error("Error updating quantity in Firestore:", error);
      }
    } else {
      try {
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);

    if (user) {
      try {
        await firestoreService.clearCart(user.uid);
      } catch (error) {
        console.error("Error clearing Firestore cart:", error);
      }
    } else {
      try {
        localStorage.removeItem('guest_cart');
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
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
        loading
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
