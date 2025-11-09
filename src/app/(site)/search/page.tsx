"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { firebaseProductsService } from "@/services/firebase-products.service";
import type { Product } from "@/models/Product";

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const products = await firebaseProductsService.getPublishedProducts();
        setAllProducts(products);
        setResults(products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.materials.some((m) =>
            m.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setResults(filtered);
    } else {
      setResults(allProducts);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="section-title text-foreground mb-6">Search</h1>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for furniture, materials, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {searchQuery.trim() && !loading && (
          <div className="mb-8">
            <p className="text-lg text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} for
              "{searchQuery}"
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Loading products...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="exo-semibold text-2xl text-foreground mb-2">
              No Results Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse our catalog
            </p>
            <Button asChild className="btn-premium">
              <a href="/catalog">Browse Catalog</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
