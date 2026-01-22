"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, Zap, Tag, Ruler } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { type Offer, type SizeVariant } from "@/models/ProductDetail";
import { useCart } from "@/context/CartContext";

// Polish Type Options
const POLISH_TYPES = [
  { id: "walnut-honey-glossy", label: "Walnut Honey glossy finish" },
  { id: "walnut-honey-matte", label: "Walnut Honey matte finish" },
  { id: "walnut-natural-glossy", label: "Walnut Natural gloss finish" },
  { id: "walnut-natural-matte", label: "Walnut Natural matte finish" },
];

// Custom Size Option ID
const CUSTOM_SIZE_ID = "custom-size";

interface CustomSizeDimensions {
  length: string;
  width: string;
  height: string;
}

interface ProductInfoProps {
  productId: string;
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
  colorOptions?: string[];
  fibreOptions?: string[];
  subCategoryOptions?: string[];
  onAddToCart: (quantity: number, sizeId: string, polishType: string, customSize?: CustomSizeDimensions, selectedOptions?: { color?: string; fibre?: string; subCategory?: string }) => void;
  onBuyNow?: (quantity: number, sizeId: string, polishType: string, customSize?: CustomSizeDimensions, selectedOptions?: { color?: string; fibre?: string; subCategory?: string }) => void;
}

export default function ProductInfo({
  productId,
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
  colorOptions = [],
  fibreOptions = [],
  subCategoryOptions = [],
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const { isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState(defaultSizeId);
  const [selectedPolishType, setSelectedPolishType] = useState(POLISH_TYPES[0].id);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [customSize, setCustomSize] = useState<CustomSizeDimensions>({
    length: "",
    width: "",
    height: "",
  });
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");
  const [selectedFibre, setSelectedFibre] = useState(fibreOptions[0] || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState(subCategoryOptions[0] || "");

  const isCustomSizeSelected = selectedSizeId === CUSTOM_SIZE_ID;
  const selectedSize = sizeVariants.find((v) => v.id === selectedSizeId);
  const displayPrice = isCustomSizeSelected ? salePrice : (selectedSize?.price || salePrice);
  const displayOriginalPrice = isCustomSizeSelected ? originalPrice : (selectedSize?.originalPrice || originalPrice);

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
      <div className="flex flex-col gap-5">
        {/* First Row: Quantity and Size */}
        <div className="flex flex-col md:flex-row gap-5 md:items-end">
          {/* Quantity Selector */}
          <div className="space-y-3 w-full md:w-auto">
            <label className="text-sm font-medium text-foreground block">
              Quantity
            </label>
            <div className="flex items-center border border-border rounded-xl bg-background shadow-sm">
              <button
                onClick={decrementQuantity}
                className="w-6 h-12 flex items-center justify-center hover:bg-secondary/50 hover:text-primary transition-colors rounded-l-xl disabled:opacity-50"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-6 h-6 flex items-center justify-center border-x border-border font-semibold text-lg">
                {quantity}
              </div>
              <button
                onClick={incrementQuantity}
                className="w-6 h-6 flex items-center justify-center hover:bg-secondary/50 hover:text-primary transition-colors rounded-r-xl"
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
                {/* Custom Size Option */}
                <SelectItem
                  key={CUSTOM_SIZE_ID}
                  value={CUSTOM_SIZE_ID}
                  className="py-3"
                >
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Custom Size</span>
                    <span className="text-muted-foreground text-xs">Enter your dimensions</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Size Input Fields */}
          {isCustomSizeSelected && (
            <div className="w-full mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Enter Custom Dimensions (in cm)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Length</label>
                  <Input
                    type="number"
                    placeholder="L"
                    value={customSize.length}
                    onChange={(e) => setCustomSize({ ...customSize, length: e.target.value })}
                    className="h-10 rounded-lg text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Width</label>
                  <Input
                    type="number"
                    placeholder="W"
                    value={customSize.width}
                    onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                    className="h-10 rounded-lg text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Height</label>
                  <Input
                    type="number"
                    placeholder="H"
                    value={customSize.height}
                    onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                    className="h-10 rounded-lg text-center"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Final price will be confirmed after reviewing custom dimensions
              </p>
            </div>
          )}

          {/* Polish Type Selector */}
          <div className="space-y-3 flex-1">
            <label className="text-sm font-medium text-foreground block">
              Polish Type
            </label>
            <Select value={selectedPolishType} onValueChange={setSelectedPolishType}>
              <SelectTrigger className="w-full h-12 rounded-xl border-border bg-background hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLISH_TYPES.map((polishType) => (
                  <SelectItem
                    key={polishType.id}
                    value={polishType.id}
                    className="py-3"
                  >
                    <span className="font-medium">{polishType.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row: Color, Fibre, SubCategory (only if options exist) */}
        {(colorOptions.length > 0 || fibreOptions.length > 0 || subCategoryOptions.length > 0) && (
          <div className="flex flex-col md:flex-row gap-5 md:items-end">
            {/* Color Selector */}
            {colorOptions.length > 0 && (
              <div className="space-y-3 flex-1">
                <label className="text-sm font-medium text-foreground block">
                  Color
                </label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-border bg-background hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color} className="py-3">
                        <span className="font-medium">{color}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fibre Selector */}
            {fibreOptions.length > 0 && (
              <div className="space-y-3 flex-1">
                <label className="text-sm font-medium text-foreground block">
                  Fibre
                </label>
                <Select value={selectedFibre} onValueChange={setSelectedFibre}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-border bg-background hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select Fibre" />
                  </SelectTrigger>
                  <SelectContent>
                    {fibreOptions.map((fibre) => (
                      <SelectItem key={fibre} value={fibre} className="py-3">
                        <span className="font-medium">{fibre}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* SubCategory Selector */}
            {subCategoryOptions.length > 0 && (
              <div className="space-y-3 flex-1">
                <label className="text-sm font-medium text-foreground block">
                  Type
                </label>
                <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-border bg-background hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategoryOptions.map((subCat) => (
                      <SelectItem key={subCat} value={subCat} className="py-3">
                        <span className="font-medium">{subCat}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 pt-4">
        {isInCart(productId) ? (
          <Button
            onClick={() => onBuyNow?.(quantity, selectedSizeId, selectedPolishType, isCustomSizeSelected ? customSize : undefined, { color: selectedColor || undefined, fibre: selectedFibre || undefined, subCategory: selectedSubCategory || undefined })}
            className="w-full flex-1 min-h-[48px] py-4 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            size="lg"
            variant="default"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Buy Now
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onAddToCart(quantity, selectedSizeId, selectedPolishType, isCustomSizeSelected ? customSize : undefined, { color: selectedColor || undefined, fibre: selectedFibre || undefined, subCategory: selectedSubCategory || undefined })}
              className="w-full flex-1 min-h-[48px] py-4 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              size="lg"
              variant="default"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            {onBuyNow && (
              <Button
                onClick={() => onBuyNow(quantity, selectedSizeId, selectedPolishType, isCustomSizeSelected ? customSize : undefined, { color: selectedColor || undefined, fibre: selectedFibre || undefined, subCategory: selectedSubCategory || undefined })}
                variant="outline"
                className="w-full flex-1 min-h-[48px] py-4 text-base font-semibold rounded-xl border-2 hover:bg-secondary/50 transition-all"
                size="lg"
              >
                Buy Now
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

