import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/models/Product";

const PRODUCTS_COLLECTION = "products";

export const firebaseProductsService = {
  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const querySnapshot = await getDocs(productsRef);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Add computed price field (salePrice if available, otherwise priceEstimateMin)
          price: data.salePrice || data.priceEstimateMin,
        };
      }) as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Get published products only
   */
  async getPublishedProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, where("published", "==", true));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Add computed price field (salePrice if available, otherwise priceEstimateMin)
          price: data.salePrice || data.priceEstimateMin,
        };
      }) as Product[];
    } catch (error) {
      console.error("Error fetching published products:", error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Add computed price field (salePrice if available, otherwise priceEstimateMin)
          price: data.salePrice || data.priceEstimateMin,
        } as Product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  /**
   * Get a product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Add computed price field (salePrice if available, otherwise priceEstimateMin)
          price: data.salePrice || data.priceEstimateMin,
        } as Product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: Omit<Product, "id">): Promise<string> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef,
        where("category", "==", category),
        where("published", "==", true)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Add computed price field (salePrice if available, otherwise priceEstimateMin)
          price: data.salePrice || data.priceEstimateMin,
        };
      }) as Product[];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  /**
   * Toggle product published status
   */
  async togglePublished(id: string, published: boolean): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        published,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error toggling published status:", error);
      throw error;
    }
  },

  /**
   * Toggle product featured status
   */
  async toggleFeatured(id: string, featured: boolean): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        featured,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  },
};
