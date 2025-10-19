"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Offer, type SizeVariant } from "@/models/ProductDetail";

interface ProductInfoProps {
  title: string;
  rating: number;
  reviewCount: number;
  salePrice: number;
  originalPrice: number;
  discount: number;
  savings: number;
  offers: Offer[];
  sizeVariants: SizeVariant[];
  defaultSizeId: string;
  onAddToCart: (quantity: number, sizeId: string) => void;
  onBuyNow?: (quantity: number, sizeId: string) => void;
}

export default function ProductInfo({
  title,
  rating,
  reviewCount,
  salePrice,
  originalPrice,
  discount,
  savings,
  offers,
  sizeVariants,
  defaultSizeId,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState(defaultSizeId);
  const [showAllOffers, setShowAllOffers] = useState(false);

  const selectedSize = sizeVariants.find((v) => v.id === selectedSizeId);
  const displayPrice = selectedSize?.price || salePrice;
  const displayOriginalPrice = selectedSize?.originalPrice || originalPrice;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const visibleOffers = showAllOffers ? offers : offers.slice(0, 1);
  const hasMoreOffers = offers.length > 1;

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {title}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : i < rating
                    ? "fill-yellow-200 text-yellow-400"
                    : "fill-none text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({reviewCount.toLocaleString("en-IN")} reviews)
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-4xl font-bold text-foreground">
          {formatINR(displayPrice)}
        </span>
        <span className="text-2xl text-muted-foreground line-through">
          {formatINR(displayOriginalPrice)}
        </span>
        <Badge variant="destructive" className="text-base px-3 py-1">
          {discount}% off
        </Badge>
      </div>
      <p className="text-sm text-green-600 font-medium">
        (Save {formatINR(savings)})
      </p>

      {/* Offers */}
      {offers.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-secondary/20">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Save Extra with Better Offers
          </h3>
          <div className="space-y-3">
            {visibleOffers.map((offer) => (
              <div key={offer.id} className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {offer.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {offer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {hasMoreOffers && (
            <button
              onClick={() => setShowAllOffers(!showAllOffers)}
              className="text-sm text-primary font-medium mt-3 flex items-center gap-1 hover:underline"
            >
              {showAllOffers ? (
                <>
                  View Less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  + View More ({offers.length - 1} more offers)
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Size and Quantity Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Qty
          </label>
          <div className="flex items-center border border-border rounded-lg w-fit">
            <button
              onClick={decrementQuantity}
              className="p-3 hover:bg-secondary/50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-6 py-3 font-medium">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="p-3 hover:bg-secondary/50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Size */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Size{" "}
            <span className="text-muted-foreground">
              ({sizeVariants.length} Standard Options)
            </span>
          </label>
          <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeVariants.map((variant) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                  disabled={!variant.available}
                >
                  {variant.label} | {variant.dimensions} | {variant.height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onAddToCart(quantity, selectedSizeId)}
          className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          size="lg"
        >
          ADD TO CART
        </Button>
        {onBuyNow && (
          <Button
            onClick={() => onBuyNow(quantity, selectedSizeId)}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            BUY NOW
          </Button>
        )}
      </div>
    </div>
  );
}
