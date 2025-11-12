import { z } from "zod";
import { ProductSchema, ProductDimensionsSchema } from "./Product";

// Review Schema
export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  authorInitial: z.string().length(1),
  rating: z.number().min(1).max(5),
  date: z.string(),
  title: z.string(),
  content: z.string(),
  verified: z.boolean().default(false),
  helpful: z.number().default(0),
});

// Rating Distribution
export const RatingDistributionSchema = z.object({
  5: z.number(),
  4: z.number(),
  3: z.number(),
  2: z.number(),
  1: z.number(),
});

// Review Summary
export const ReviewSummarySchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number(),
  distribution: RatingDistributionSchema,
});

// FAQ Schema
export const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

// Offer Schema
export const OfferSchema = z.object({
  id: z.string(),
  type: z.enum(["bank", "coupon", "exchange", "emi"]),
  title: z.string(),
  description: z.string(),
  terms: z.string().optional(),
});

// Size Variant Schema
export const SizeVariantSchema = z.object({
  id: z.string(),
  label: z.string(),
  dimensions: z.string(), // e.g., "150 X 190 (1.50 m x 1.90 m)"
  height: z.string(), // e.g., "5\" (12.7cm)"
  price: z.number(),
  originalPrice: z.number(),
  available: z.boolean().default(true),
});

// Specification Schema
export const SpecificationSchema = z.object({
  dimensions: z.string(),
  materials: z.string(),
  finish: z.string().optional(),
  weight: z.string().optional(),
  assembly: z.string().optional(),
});

// Care Instructions Schema
export const CareInstructionsSchema = z.object({
  title: z.string(),
  content: z.string(),
});

// Warranty Schema
export const WarrantySchema = z.object({
  title: z.string(),
  duration: z.string(),
  description: z.string(),
});

// Quality Promise Item
export const QualityPromiseItemSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

// Service Highlight Schema
export const ServiceHighlightSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

// Enhanced Product Detail Schema
export const ProductDetailSchema = z.object({
  // Base product fields
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  category: z.string().min(1),
  images: z.array(z.string().min(1)).min(1),
  materials: z.array(z.string()).min(1),
  dimensions: ProductDimensionsSchema,
  leadTimeDays: z.number().positive(),
  isCustomAllowed: z.boolean(),
  tags: z.array(z.string()),

  // Pricing
  priceEstimateMin: z.number().positive(),
  priceEstimateMax: z.number().positive(),
  salePrice: z.number().positive(),
  originalPrice: z.number().positive(),
  discount: z.number().min(0).max(100),
  savings: z.number(),

  // Reviews
  reviews: z.array(ReviewSchema),
  reviewSummary: ReviewSummarySchema,

  // FAQs
  faqs: z.array(FAQSchema),

  // Offers
  offers: z.array(OfferSchema),

  // Size variants
  sizeVariants: z.array(SizeVariantSchema),
  defaultSizeId: z.string(),

  // Specifications
  specifications: SpecificationSchema,
  careInstructions: CareInstructionsSchema,
  warranty: WarrantySchema,

  // Service highlights
  serviceHighlights: z.array(ServiceHighlightSchema),
  qualityPromises: z.array(QualityPromiseItemSchema),

  // Additional metadata
  breadcrumbs: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
    })
  ),

  // Video shopping (optional)
  videoShopping: z
    .object({
      thumbnail: z.string(),
      title: z.string(),
      duration: z.string(),
    })
    .optional(),
});

// TypeScript types
export type Review = z.infer<typeof ReviewSchema>;
export type RatingDistribution = z.infer<typeof RatingDistributionSchema>;
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type SizeVariant = z.infer<typeof SizeVariantSchema>;
export type Specification = z.infer<typeof SpecificationSchema>;
export type CareInstructions = z.infer<typeof CareInstructionsSchema>;
export type Warranty = z.infer<typeof WarrantySchema>;
export type QualityPromiseItem = z.infer<typeof QualityPromiseItemSchema>;
export type ServiceHighlight = z.infer<typeof ServiceHighlightSchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
