import "server-only";
import { Product, ProductSchema } from "@/models/Product";

/**
 * Server-side Firebase service using REST API
 * Safe to use in server actions and components without browser dependencies
 */

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_DATABASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Validate configuration
if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
  console.error(
    "Firebase configuration missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_API_KEY are required"
  );
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, any>;
  createTime: string;
  updateTime: string;
}

/**
 * Convert Firestore REST API field format to JavaScript object
 */
function convertFirestoreFields(fields: Record<string, any>): any {
  const result: any = {};

  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;

    // Handle different Firestore field types
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = parseInt(value.integerValue);
    } else if (value.doubleValue !== undefined) {
      result[key] = value.doubleValue;
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.arrayValue?.values) {
      result[key] = value.arrayValue.values.map((item: any) => {
        if (item.stringValue !== undefined) return item.stringValue;
        if (item.integerValue !== undefined) return parseInt(item.integerValue);
        if (item.doubleValue !== undefined) return item.doubleValue;
        if (item.mapValue?.fields)
          return convertFirestoreFields(item.mapValue.fields);
        return null;
      });
    } else if (value.mapValue?.fields) {
      result[key] = convertFirestoreFields(value.mapValue.fields);
    } else if (value.nullValue !== undefined) {
      result[key] = null;
    }
  }

  return result;
}

/**
 * Get product by ID from Firestore using REST API
 * This is safe to use in server actions - no browser dependencies
 */
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    // Append API key for authentication
    const url = `${FIREBASE_DATABASE_URL}/products/${productId}?key=${FIREBASE_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache to ensure fresh pricing data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      // Log detailed error for debugging
      const errorBody = await response.text();
      console.error(`Firebase REST API error (${response.status}):`, errorBody);

      if (response.status === 403) {
        console.error(
          "Permission denied. Check Firebase security rules and API key."
        );
      }

      throw new Error(
        `Failed to fetch product: ${response.status} ${response.statusText}`
      );
    }

    const doc: FirestoreDocument = await response.json();
    const rawData = convertFirestoreFields(doc.fields);

    // Add the product ID from the document name
    // Document name format: projects/{project}/databases/{database}/documents/products/{productId}
    const documentPath = doc.name.split("/");
    const docId = documentPath[documentPath.length - 1];

    // Combine with ID before validation
    const dataWithId = {
      ...rawData,
      id: docId,
    };

    // Validate and transform the data
    const result = ProductSchema.safeParse(dataWithId);

    if (!result.success) {
      console.error("Product validation failed:", result.error);
      return null;
    }

    // Type assertion is safe here since validation succeeded and id is guaranteed
    return result.data as Product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

/**
 * Get multiple products by IDs
 * Useful for cart operations that need to validate multiple items
 */
export async function getProductsByIds(
  productIds: string[]
): Promise<Product[]> {
  try {
    const products = await Promise.all(
      productIds.map((id) => getProductById(id))
    );

    return products.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
}
