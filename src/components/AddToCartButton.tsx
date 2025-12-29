"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    image: string;
    priceEstimateMin: number;
    salePrice?: number;
    originalPrice?: number;
    slug: string;
  };
  className?: string;
}

export default function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isPending, setIsPending] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPending(true);
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        image: product.image,
        priceEstimateMin: product.priceEstimateMin,
        salePrice: product.salePrice,
        originalPrice: product.originalPrice,
        slug: product.slug,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isPending}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}

