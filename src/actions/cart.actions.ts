"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItem,
  type AddToCartPayload,
  type UpdateCartItemPayload,
} from "@/models/Cart";
import { getProductById } from "@/services/firebase-server.service";

// Cookie configuration
const CART_COOKIE_NAME = "shopping_cart";
const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// Helper to get cart from cookies
async function getCartFromCookies(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);

  if (!cartCookie?.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value);
  } catch {
    return [];
  }
}

// Helper to save cart to cookies
async function saveCartToCookies(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), CART_COOKIE_OPTIONS);
}

// Generic action result type
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Add product to cart action
 * SECURE: Fetches product data from server to prevent price manipulation
 * Only accepts product ID from client - all pricing is fetched server-side
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<ActionResult<{ itemCount: number }>> {
  try {
    // Validate quantity
    if (quantity < 1) {
      return {
        success: false,
        error: "Quantity must be at least 1.",
      };
    }

    // Validate product ID
    if (!productId || typeof productId !== "string") {
      return {
        success: false,
        error: "Invalid product ID.",
      };
    }

    // SECURITY: Fetch product from authoritative source (Firestore via REST API)
    // This prevents client from manipulating prices
    const product = await getProductById(productId);

    if (!product) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    // Check if product is published
    if (!product.published) {
      return {
        success: false,
        error: "Product is not available.",
      };
    }

    // Get current cart
    const currentCart = await getCartFromCookies();

    // Check if item already exists
    const existingItemIndex = currentCart.findIndex(
      (item) => item.id === product.id
    );

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Update quantity
      updatedCart = currentCart.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item - use TRUSTED pricing from server
      const price = product.salePrice ?? product.priceEstimateMin;
      const originalPrice =
        product.salePrice && product.originalPrice
          ? product.originalPrice
          : undefined;

      const newItem: CartItem = {
        id: product.id,
        title: product.title,
        image: product.images[0],
        price: price,
        originalPrice: originalPrice,
        quantity: quantity,
        slug: product.slug,
      };
      updatedCart = [...currentCart, newItem];
    }

    // Save to cookies
    await saveCartToCookies(updatedCart);

    // Calculate total item count
    const itemCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

    // Revalidate pages that show cart
    revalidatePath("/cart");
    revalidatePath("/", "layout"); // Revalidate layout for cart count in header

    return {
      success: true,
      data: { itemCount },
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      error: "Failed to add item to cart.",
    };
  }
}

/**
 * Update cart item quantity action
 */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<ActionResult<{ itemCount: number }>> {
  try {
    // Validate input
    const validatedData = UpdateCartItemSchema.safeParse({
      id: itemId,
      quantity,
    });

    if (!validatedData.success) {
      return {
        success: false,
        error: "Invalid input.",
      };
    }

    // Get current cart
    const currentCart = await getCartFromCookies();

    let updatedCart: CartItem[];

    if (quantity === 0) {
      // Remove item
      updatedCart = currentCart.filter((item) => item.id !== itemId);
    } else {
      // Update quantity
      updatedCart = currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    }

    // Save to cookies
    await saveCartToCookies(updatedCart);

    // Calculate total item count
    const itemCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

    // Revalidate pages
    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { itemCount },
    };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      success: false,
      error: "Failed to update cart item.",
    };
  }
}

/**
 * Remove item from cart action
 */
export async function removeFromCart(
  itemId: string
): Promise<ActionResult<{ itemCount: number }>> {
  return updateCartItemQuantity(itemId, 0);
}

/**
 * Clear entire cart action
 */
export async function clearCart(): Promise<ActionResult> {
  try {
    // Clear cookies
    await saveCartToCookies([]);

    // Revalidate pages
    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      success: false,
      error: "Failed to clear cart.",
    };
  }
}

/**
 * Get cart data (for server components)
 */
export async function getCartData(): Promise<{
  items: CartItem[];
  total: number;
  itemCount: number;
}> {
  try {
    const items = await getCartFromCookies();
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  } catch (error) {
    console.error("Get cart data error:", error);
    return { items: [], total: 0, itemCount: 0 };
  }
}
