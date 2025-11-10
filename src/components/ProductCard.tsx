import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import type { Product } from "@/models/Product";
import { formatCurrency } from "@/utils/formatters";

export interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard - Displays a published product on the storefront
 *
 * Only renders if product.published === true
 * Sends consistent product data to cart and wishlist
 * Uses salePrice if available, otherwise priceEstimateMin
 */
const ProductCard = ({ product }: ProductCardProps) => {
  // Don't render unpublished products on the storefront
  if (!product.published) {
    return null;
  }

  const {
    id,
    slug,
    title,
    shortDescription,
    images,
    priceEstimateMin,
    priceEstimateMax,
    salePrice,
    originalPrice,
    tags,
    longDescription,
    category,
    materials,
    dimensions,
    leadTimeDays,
    isCustomAllowed,
    price, // This is computed by the schema (salePrice || priceEstimateMin)
  } = product;

  return (
    <div className="card-premium group hover-lift hover-glow">
      <div className="relative">
        <Link href={`/product/${slug}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
            <Image
              src={images[0]}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-background/90 backdrop-blur-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            <h3 className="exo-medium text-xl text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="craft-detail line-clamp-2">{shortDescription}</p>

            {/* Price Range with Sale Price */}
            <div className="space-y-1">
              {salePrice && originalPrice && salePrice < originalPrice ? (
                <>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(salePrice)}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">
                    Sale price
                  </div>
                </>
              ) : (
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatCurrency(priceEstimateMin)}
                  </span>
                  {priceEstimateMax > priceEstimateMin && (
                    <span className="text-sm text-muted-foreground">
                      - {formatCurrency(priceEstimateMax)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Interactive Elements */}
        <div className="absolute top-4 right-4">
          <WishlistButton
            product={{
              id,
              slug,
              title,
              shortDescription,
              longDescription,
              images,
              priceEstimateMin,
              priceEstimateMax,
              salePrice,
              originalPrice,
              tags,
              category,
              materials,
              dimensions,
              leadTimeDays,
              isCustomAllowed,
              offers: product.offers || [],
              published: product.published,
              featured: product.featured,
              price, // Consistent price passed from schema
            }}
            className="bg-background/80 backdrop-blur-sm hover:bg-background rounded-full p-2"
          />
        </div>

        <div className="p-6 pt-0">
          <AddToCartButton productId={id} className="w-full btn-premium" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
