"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart.actions";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
}

export default function AddToCartButton({
  productId,
  className,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        // Only send product ID - server fetches trusted pricing
        const result = await addToCart(productId);

        if (result.success) {
          toast.success("Added to cart!");
        } else {
          // Handle error case - TypeScript should narrow this correctly
          toast.error(
            "error" in result ? result.error : "Failed to add to cart"
          );
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error("Failed to add to cart");
      }
    });
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
