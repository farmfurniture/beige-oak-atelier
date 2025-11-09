import "server-only";
import { cache } from "react";
import { Product } from "@/models/Product";
import { Testimonial, TestimonialsSchema } from "@/models/Common";
import seedData from "@/data/seed-data.json";
import { firebaseProductsService } from "@/services/firebase-products.service";

// Cache tags for revalidation
export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  TESTIMONIALS: "testimonials",
} as const;

/**
 * Get all published products from Firebase with caching
 * Uses React cache() for deduplication during the request lifecycle
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    // Fetch published products from Firebase
    const products = await firebaseProductsService.getPublishedProducts();
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
});

/**
 * Get products by category with caching
 */
export const getProductsByCategory = cache(
  async (category: string): Promise<Product[]> => {
    try {
      const products = await getProducts();
      return products.filter((product) => product.category === category);
    } catch (error) {
      console.error(
        `Failed to fetch products for category ${category}:`,
        error
      );
      throw new Error(`Failed to fetch products for category ${category}`);
    }
  }
);

/**
 * Get featured products from Firebase
 * Returns products marked as featured in the admin panel
 */
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    // Filter products marked as featured, or return first 4 if none are marked
    const featured = products.filter((product) => product.featured);
    return featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
});

/**
 * Get bestseller products from Firebase
 * Returns products tagged as "Bestseller"
 */
export const getBestsellerProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    const bestsellers = products.filter((product) =>
      product.tags.some((tag) => tag.toLowerCase() === "bestseller")
    );
    return bestsellers.slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch bestseller products:", error);
    return [];
  }
});

/**
 * Get single product by slug from Firebase
 * Only returns published products for the public storefront
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      // Only fetch published products on the public storefront
      const product = await firebaseProductsService.getProductBySlug(
        slug,
        true
      );
      return product;
    } catch (error) {
      console.error(`Failed to fetch product with slug ${slug}:`, error);
      return null;
    }
  }
);

/**
 * Search products by query
 */
export const searchProducts = cache(
  async (query: string): Promise<Product[]> => {
    try {
      const products = await getProducts();
      const lowercaseQuery = query.toLowerCase();

      return products.filter(
        (product) =>
          product.title.toLowerCase().includes(lowercaseQuery) ||
          product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
          product.longDescription.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          product.materials.some((material) =>
            material.toLowerCase().includes(lowercaseQuery)
          ) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error(`Failed to search products with query "${query}":`, error);
      throw new Error("Failed to search products");
    }
  }
);

/**
 * Get testimonials with caching
 */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    // Validate testimonials from seed data
    const validatedTestimonials = TestimonialsSchema.parse(
      seedData.testimonials
    );

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 50));

    return validatedTestimonials;
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    throw new Error("Failed to fetch testimonials");
  }
});

/**
 * Get product categories with counts
 */
export const getProductCategories = cache(async () => {
  try {
    const products = await getProducts();
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "Beds", slug: "beds", count: categoryCount.beds || 0 },
      { name: "Sofas", slug: "sofas", count: categoryCount.sofas || 0 },
      { name: "Couches", slug: "couches", count: categoryCount.couches || 0 },
      { name: "Custom", slug: "custom", count: categoryCount.custom || 0 },
    ];
  } catch (error) {
    console.error("Failed to fetch product categories:", error);
    throw new Error("Failed to fetch product categories");
  }
});
