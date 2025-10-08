import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/models/Product";

type ProductCardProps = Omit<
  Product,
  "longDescription" | "category" | "materials" | "dimensions" | "leadTimeDays"
>;

const ProductCard = ({
  id,
  slug,
  title,
  shortDescription,
  images,
  priceEstimateMin,
  priceEstimateMax,
  tags,
}: ProductCardProps) => {
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
            <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {shortDescription}
            </p>

            {/* Price Range */}
            <div className="flex items-baseline space-x-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-lg font-semibold text-primary">
                ${priceEstimateMin.toLocaleString()}
              </span>
              {priceEstimateMax > priceEstimateMin && (
                <span className="text-sm text-muted-foreground">
                  - ${priceEstimateMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Interactive Elements */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 pt-0">
          <AddToCartButton productSlug={slug} className="w-full btn-premium" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
