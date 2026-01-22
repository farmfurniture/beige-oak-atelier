import { z } from "zod";

// Custom size dimensions schema
export const CustomSizeDimensionsSchema = z.object({
  length: z.string(),
  width: z.string(),
  height: z.string(),
});

// Cart item schema
export const CartItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  image: z.string().url(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(), // Pre-discount price for showing savings
  quantity: z.number().int().positive(),
  slug: z.string().min(1),
  variantId: z.string().optional(), // Size/variant identifier
  variantLabel: z.string().optional(), // Human-readable variant (e.g., "Queen Size")
  polishType: z.string().optional(), // Polish type identifier
  polishTypeLabel: z.string().optional(), // Human-readable polish type (e.g., "Walnut Honey glossy finish")
  customSize: CustomSizeDimensionsSchema.optional(), // Custom size dimensions (L × W × H)
  // Product options (admin-configurable per product)
  selectedColor: z.string().optional(),
  selectedFibre: z.string().optional(),
  selectedSubCategory: z.string().optional(),
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});

// Add to cart payload schema
export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

// Update cart item schema
export const UpdateCartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

// TypeScript types
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type AddToCartPayload = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemPayload = z.infer<typeof UpdateCartItemSchema>;
