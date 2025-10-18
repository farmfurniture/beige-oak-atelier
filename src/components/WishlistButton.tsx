"use client";

import { Product } from "@/models/Product";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export default function WishlistButton({ product, className }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);

  const toggleWishlist = () => {
    if (isFavorited) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={cn(
        "transition-colors duration-200 hover:text-primary focus:outline-none",
        isFavorited ? "text-primary" : "text-muted-foreground",
        className
      )}
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn("h-6 w-6", isFavorited ? "fill-current" : "")}
      />
    </button>
  );
}
