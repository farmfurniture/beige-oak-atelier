"use server";

import { z } from "zod";

// Server-side validation schema for product creation/update
const ProductFormSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().optional(),

  // Pricing
  priceMin: z.string().min(1, "Minimum price is required"),
  priceMax: z.string().min(1, "Maximum price is required"),
  salePrice: z.string().optional(),
  originalPrice: z.string().optional(),
  discount: z.string().optional(),

  // Details
  materials: z.string().optional(),
  dimensionsW: z.string().optional(),
  dimensionsH: z.string().optional(),
  dimensionsD: z.string().optional(),
  weight: z.string().optional(),
  leadTimeDays: z.string().optional(),

  // Features
  isCustomAllowed: z.boolean().default(true),
  tags: z.string().optional(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),

  // Images
  images: z.array(z.string()).optional(),

  // Size Variants
  sizeVariants: z
    .array(
      z.object({
        label: z.string().optional(),
        dimensions: z.string().optional(),
        height: z.string().optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        available: z.boolean().default(true),
      })
    )
    .optional(),

  // Specifications
  finish: z.string().optional(),
  assembly: z.string().optional(),

  // Care & Warranty
  careInstructions: z.string().optional(),
  warrantyDuration: z.string().optional(),
  warrantyDescription: z.string().optional(),

  // Service Highlights
  serviceHighlights: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),

  // FAQs
  faqs: z
    .array(
      z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
      })
    )
    .optional(),

  // Offers
  offers: z
    .array(
      z.object({
        type: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        terms: z.string().optional(),
      })
    )
    .optional(),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

export type ProductActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  productId?: string;
};

/**
 * Add a new product
 * In a real app, this would save to a database
 */
export async function addProductAction(
  _prevState: ProductActionState,
  formData: ProductFormData
): Promise<ProductActionState> {
  const parsed = ProductFormSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat().filter(Boolean)[0];
    return { error: firstError || "Invalid product data" };
  }

  try {
    // TODO: In a real app, save to database here
    // For now, just validate and return success
    const productId = `prod_${Date.now()}`;

    return {
      success: true,
      message: "Product added successfully!",
      productId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add product",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState,
  formData: ProductFormData
): Promise<ProductActionState> {
  const parsed = ProductFormSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat().filter(Boolean)[0];
    return { error: firstError || "Invalid product data" };
  }

  try {
    // TODO: In a real app, update in database here
    return {
      success: true,
      message: "Product updated successfully!",
      productId,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProductAction(
  productId: string
): Promise<ProductActionState> {
  try {
    // TODO: In a real app, delete from database here
    return {
      success: true,
      message: "Product deleted successfully!",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

/**
 * Toggle product published state
 */
export async function toggleProductPublishedAction(
  productId: string,
  published: boolean
): Promise<ProductActionState> {
  try {
    // TODO: In a real app, update in database here
    return {
      success: true,
      message: `Product ${
        published ? "published" : "unpublished"
      } successfully!`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle published state",
    };
  }
}

/**
 * Toggle product featured state
 */
export async function toggleProductFeaturedAction(
  productId: string,
  featured: boolean
): Promise<ProductActionState> {
  try {
    // TODO: In a real app, update in database here
    return {
      success: true,
      message: `Product ${featured ? "featured" : "unfeatured"} successfully!`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle featured state",
    };
  }
}
