"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// Import components
import StickyNavigation from "@/components/product/StickyNavigation";
import BreadcrumbNavigation from "@/components/product/BreadcrumbNavigation";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import DeliveryChecker from "@/components/product/DeliveryChecker";
import ServiceHighlights from "@/components/product/ServiceHighlights";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewsSection from "@/components/product/ReviewsSection";
import FAQsSection from "@/components/product/FAQsSection";
import SimilarProducts from "@/components/product/SimilarProducts";

// Import data
import productDetailsData from "@/data/product-details.json";
import { type ProductDetail } from "@/models/ProductDetail";
import { firebaseProductsService } from "@/services/firebase-products.service";
import type { Product } from "@/models/Product";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [basicProduct, setBasicProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  // Fetch product from Firebase
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        // Only fetch published products on the public storefront
        const product = await firebaseProductsService.getProductBySlug(
          slug,
          true
        );
        setBasicProduct(product);

        // Load similar products if product was found
        if (product) {
          const similar = await firebaseProductsService.getProductsByCategory(
            product.category
          );
          // Filter out current product and limit to 3
          const filtered = similar
            .filter((p) => p.id !== product.id)
            .slice(0, 3);
          setSimilarProducts(filtered);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  // Get detailed product info from product-details.json
  const productDetail = productDetailsData[
    slug as keyof typeof productDetailsData
  ] as ProductDetail | undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!basicProduct || !basicProduct.published) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Product not found
          </h1>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // If detailed product data is not available, use basic product info
  const product: any = productDetail || {
    ...basicProduct,
    salePrice: basicProduct.priceEstimateMin,
    originalPrice: basicProduct.priceEstimateMax,
    discount: Math.round(
      ((basicProduct.priceEstimateMax - basicProduct.priceEstimateMin) /
        basicProduct.priceEstimateMax) *
        100
    ),
    savings: basicProduct.priceEstimateMax - basicProduct.priceEstimateMin,
    reviews: [],
    reviewSummary: {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    faqs: [],
    offers: [],
    sizeVariants: [
      {
        id: "default",
        label: "Standard Size",
        dimensions: `${basicProduct.dimensions.w} x ${basicProduct.dimensions.d}`,
        height: `${basicProduct.dimensions.h}cm`,
        price: basicProduct.priceEstimateMin,
        originalPrice: basicProduct.priceEstimateMax,
        available: true,
      },
    ],
    defaultSizeId: "default",
    specifications: {
      dimensions: `${basicProduct.dimensions.w} × ${basicProduct.dimensions.h} × ${basicProduct.dimensions.d} cm`,
      materials: basicProduct.materials.join(", "),
    },
    careInstructions: {
      title: "Care Instructions",
      content: "Please follow standard furniture care guidelines.",
    },
    warranty: {
      title: "Warranty",
      duration: "1 year",
      description: "Manufacturer's warranty included.",
    },
    serviceHighlights: [
      {
        id: "service-001",
        icon: "truck",
        title: "Free delivery",
        description: "Across major cities",
      },
      {
        id: "service-002",
        icon: "shield",
        title: "Warranty",
        description: "Up to 2 years",
      },
    ],
    qualityPromises: [
      {
        id: "quality-001",
        icon: "check-circle",
        title: "Quality Assurance",
        description: "Rigorous quality checks",
      },
      {
        id: "quality-002",
        icon: "truck",
        title: "Fast Delivery",
        description: "Quick and safe delivery",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      {
        label: basicProduct.category,
        href: `/catalog?category=${basicProduct.category}`,
      },
      { label: basicProduct.title, href: `/product/${basicProduct.slug}` },
    ] as Array<{ label: string; href: string }>,
  };

  // Check if product is in wishlist
  const isWishlisted = isInWishlist(basicProduct.id);

  // Handlers
  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(basicProduct.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        ...basicProduct,
        price: basicProduct.priceEstimateMin,
      });
      toast.success("Added to wishlist");
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleAddToCart = (quantity: number, sizeId: string) => {
    const selectedSize = product.sizeVariants.find((v) => v.id === sizeId);
    addToCart(
      {
        id: basicProduct.id,
        title: basicProduct.title,
        image: basicProduct.images[0],
        priceEstimateMin: selectedSize?.price || basicProduct.priceEstimateMin,
        slug: basicProduct.slug,
        variantId: sizeId,
        variantLabel: selectedSize?.label,
      },
      quantity
    );
  };

  const handleBuyNow = (quantity: number, sizeId: string) => {
    handleAddToCart(quantity, sizeId);
    // Redirect to checkout
    window.location.href = "/checkout";
  };

  const handleDeliveryCheck = async (pincode: string) => {
    // Mock delivery check - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate delivery availability
    const available = parseInt(pincode) % 2 === 0;

    return {
      available,
      message: available
        ? "Delivery available"
        : "Delivery not available in this area",
      estimatedDays: available ? 7 : undefined,
    };
  };

  const handleSubmitReview = (reviewData: any) => {
    // Handle review submission - replace with actual API call
    toast.success("Thank you for your review!");
    console.log("Review submitted:", reviewData);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Sticky Navigation */}
      <StickyNavigation />

      {/* Hero/Product Overview Section */}
      <section id="product" className="bg-background py-8 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumbs */}
          <BreadcrumbNavigation items={product.breadcrumbs} />

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Image Gallery */}
            <ProductImageGallery
              images={product.images}
              productTitle={product.title}
              onWishlistClick={handleWishlistClick}
              onShareClick={handleShareClick}
              isWishlisted={isWishlisted}
            />

            {/* Right Column: Product Info */}
            <div className="space-y-6">
              <ProductInfo
                title={product.title}
                rating={product.reviewSummary.averageRating}
                reviewCount={product.reviewSummary.totalReviews}
                salePrice={product.salePrice}
                originalPrice={product.originalPrice}
                discount={product.discount}
                savings={product.savings}
                offers={product.offers}
                sizeVariants={product.sizeVariants}
                defaultSizeId={product.defaultSizeId}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />

              {/* Delivery Checker */}
              <DeliveryChecker onCheck={handleDeliveryCheck} />
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="bg-background py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <ServiceHighlights highlights={product.serviceHighlights} />
        </div>
      </section>

      {/* Product Details Section */}
      <ProductDetails
        specifications={product.specifications}
        careInstructions={product.careInstructions}
        warranty={product.warranty}
        qualityPromises={product.qualityPromises}
      />

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <ReviewsSection
          reviews={product.reviews}
          reviewSummary={product.reviewSummary}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* FAQs Section */}
      {product.faqs.length > 0 && <FAQsSection faqs={product.faqs} />}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <SimilarProducts products={similarProducts} />
      )}
    </div>
  );
}
