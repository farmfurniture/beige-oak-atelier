"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, Zap, Tag } from "lucide-react";
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
    <div className="w-full max-w-full space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-secondary/30 px-2 py-1 rounded-md">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold ml-1">{rating.toFixed(1)}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer underline decoration-dotted">
            {reviewCount.toLocaleString("en-IN")} Reviews
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-2 bg-secondary/10 p-4 md:p-6 rounded-2xl border border-border/50">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
            {formatINR(displayPrice)}
          </span>
          <span className="text-xl text-muted-foreground line-through decoration-2 decoration-muted-foreground/50">
            {formatINR(displayOriginalPrice)}
          </span>
          <Badge variant="destructive" className="text-sm px-2.5 py-0.5 font-semibold uppercase tracking-wide">
            {discount}% OFF
          </Badge>
        </div>
        <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
          <Tag className="h-4 w-4" />
          You save {formatINR(savings)} on this purchase
        </p>
      </div>

      {/* Offers Section */}
      {offers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Available Offers</span>
          </div>
          <div className="grid gap-2">
            {visibleOffers.map((offer) => (
              <div
                key={offer.id}
                className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="mt-1 p-1.5 rounded-full bg-primary/10 text-primary">
                  <Tag className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {offer.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {offer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {hasMoreOffers && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllOffers(!showAllOffers)}
              className="text-xs font-medium text-muted-foreground hover:text-primary h-auto p-0 hover:bg-transparent"
            >
              {showAllOffers ? (
                <span className="flex items-center gap-1">Show Less <ChevronUp className="h-3 w-3" /></span>
              ) : (
                <span className="flex items-center gap-1">+{offers.length - 1} More Offers <ChevronDown className="h-3 w-3" /></span>
              )}
            </Button>
          )}
        </div>
      )}

      <div className="h-px bg-border" />

      {/* Configuration Section */}
      <div className="flex flex-col md:flex-row gap-5 md:items-end">
        {/* Quantity Selector */}
        <div className="space-y-3 w-full md:w-auto">
          <label className="text-sm font-medium text-foreground block">
            Quantity
          </label>
          <div className="flex items-center border border-border rounded-xl bg-background shadow-sm">
            <button
              onClick={decrementQuantity}
              className="w-12 h-12 flex items-center justify-center hover:bg-secondary/50 hover:text-primary transition-colors rounded-l-xl disabled:opacity-50"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="w-12 h-12 flex items-center justify-center border-x border-border font-semibold text-lg">
              {quantity}
            </div>
            <button
              onClick={incrementQuantity}
              className="w-12 h-12 flex items-center justify-center hover:bg-secondary/50 hover:text-primary transition-colors rounded-r-xl"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-3 flex-1">
          <label className="text-sm font-medium text-foreground block">
            Select Size
          </label>
          <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
            <SelectTrigger className="w-full h-12 rounded-xl border-border bg-background hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeVariants.map((variant) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                  disabled={!variant.available}
                  className="py-3"
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="font-medium">{variant.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {variant.dimensions} | {variant.height}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={() => onAddToCart(quantity, selectedSizeId)}
          className="w-full flex-1 h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          size="lg"
          variant="default"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        {onBuyNow && (
          <Button
            onClick={() => onBuyNow(quantity, selectedSizeId)}
            variant="outline"
            className="w-full flex-1 h-14 text-base font-semibold rounded-xl border-2 hover:bg-secondary/50 transition-all"
            size="lg"
          >
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );
}
