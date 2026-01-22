import { z } from "zod";

// Zod schemas for validation
export const ProductDimensionsSchema = z.object({
  w: z.number().positive(),
  h: z.number().positive(),
  d: z.number().positive(),
});

// Offer Schema
export const OfferSchema = z.object({
  id: z.string(),
  type: z.enum(["bank", "coupon", "exchange", "emi"]),
  title: z.string(),
  description: z.string(),
  terms: z.string().optional(),
});

export const ProductSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    shortDescription: z.string().min(1),
    longDescription: z.string().min(1),
    category: z.string().min(1),
    images: z.array(z.string().min(1)).min(1), // Accept any non-empty string (URLs or relative paths)
    priceEstimateMin: z.number().positive(),
    priceEstimateMax: z.number().positive(),
    salePrice: z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    materials: z.array(z.string()).min(1),
    dimensions: ProductDimensionsSchema,
    leadTimeDays: z.number().positive(),
    isCustomAllowed: z.boolean(),
    tags: z.array(z.string()),
    offers: z.array(OfferSchema).default([]),
    // Admin publication controls
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    // Dynamic product options (admin-configurable)
    colorOptions: z.array(z.string()).default([]),
    fibreOptions: z.array(z.string()).default([]),
    subCategoryOptions: z.array(z.string()).default([]),
  })
  .transform((data) => ({
    ...data,
    // Set price to salePrice if available, otherwise priceEstimateMin for compatibility with wishlist
    price: data.salePrice || data.priceEstimateMin,
  }));

export const ProductsSchema = z.array(ProductSchema);

// TypeScript types derived from schemas
export type ProductDimensions = z.infer<typeof ProductDimensionsSchema>;
export type Offer = z.infer<typeof OfferSchema>;

// Base product type before transform
type ProductBase = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  images: string[];
  priceEstimateMin: number;
  priceEstimateMax: number;
  salePrice?: number;
  originalPrice?: number;
  materials: string[];
  dimensions: ProductDimensions;
  leadTimeDays: number;
  isCustomAllowed: boolean;
  tags: string[];
  offers: Offer[];
  published: boolean;
  featured: boolean;
  // Dynamic product options (admin-configurable)
  colorOptions: string[];
  fibreOptions: string[];
  subCategoryOptions: string[];
};

// Product type with transformed price field
export type Product = ProductBase & {
  price: number;
};

export type Products = Product[];

// Category enum for better type safety
export const ProductCategory = {
  BEDS: "beds",
  SOFAS: "sofas",
  COUCHES: "couches",
  CUSTOM: "custom",
} as const;

export type ProductCategoryType =
  (typeof ProductCategory)[keyof typeof ProductCategory];
