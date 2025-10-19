"use client";

import ProductCard from "@/components/ProductCard";
import { type Product } from "@/models/Product";

interface SimilarProductsProps {
  products: Product[];
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="similar" className="py-12 bg-secondary/10 scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Similar Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              price={product.priceEstimateMin}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
