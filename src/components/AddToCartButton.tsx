"use client";

import { ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const { addToCart, isInCart } = useCart();
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const productInCart = isInCart(product.id);

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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/cart");
  };

  if (productInCart) {
    return (
      <Button
        onClick={handleBuyNow}
        className={className}
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Buy Now
      </Button>
    );
  }

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

