import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  images: string[];
  priceEstimateMin: number;
  priceEstimateMax: number;
  tags: string[];
  isCustomAllowed: boolean;
}

const ProductCard = ({
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
      <Link to={`/product/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic
            }}
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-background/90 backdrop-blur-sm">
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
          <p className="text-sm text-muted-foreground line-clamp-2">{shortDescription}</p>
          
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

          {/* CTA */}
          <Button className="w-full btn-outline-premium mt-4">
            Request Quote
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
