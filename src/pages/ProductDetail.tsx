import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Heart, Ruler, Package, Shield, ArrowLeft, CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import seedData from "@/data/seed-data.json";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = seedData.products.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold">Product not found</h2>
          <Button asChild className="btn-premium">
            <Link to="/catalog">Back to Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = seedData.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/catalog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Link>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary/20">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-transparent hover:border-muted"
                    }`}
                  >
                    <img src={img} alt={`${product.title} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                    {product.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-4">
                  <Heart className="h-6 w-6" />
                </Button>
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="py-6 border-y border-border">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-primary">
                  ${product.priceEstimateMin.toLocaleString()}
                </span>
                {product.priceEstimateMax > product.priceEstimateMin && (
                  <span className="text-xl text-muted-foreground">
                    - ${product.priceEstimateMax.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated price range. Final quote based on your customization choices.
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-lg">
                <Ruler className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Dimensions</p>
                  <p className="text-sm text-muted-foreground">
                    {product.dimensions.w} × {product.dimensions.h} × {product.dimensions.d} cm
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-lg">
                <Package className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Lead Time</p>
                  <p className="text-sm text-muted-foreground">{product.leadTimeDays} days</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full btn-premium text-base py-6"
                onClick={() => addToCart({ 
                  id: product.id, 
                  slug: product.slug, 
                  title: product.title, 
                  image: product.images[0], 
                  priceEstimateMin: product.priceEstimateMin 
                })}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - ${product.priceEstimateMin.toLocaleString()}
              </Button>
              <Button asChild variant="outline" className="w-full btn-outline-premium text-base py-6">
                <Link to="/custom-order" state={{ product }}>
                  Request Custom Quote
                </Link>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Free Consultation</p>
                  <p className="text-xs text-muted-foreground">Expert design guidance</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Lifetime Warranty</p>
                  <p className="text-xs text-muted-foreground">Craftsmanship guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="materials"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Materials
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Delivery & Care
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8 space-y-4">
              <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
              {product.isCustomAllowed && (
                <div className="mt-6 p-6 bg-accent/10 rounded-xl border border-accent/20">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Customization Available</h3>
                  <p className="text-sm text-muted-foreground">
                    This piece can be fully customized to your specifications. Choose from our range of premium 
                    materials, adjust dimensions, or work with our design team to create something truly unique.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="mt-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Premium Materials Used</h3>
                <ul className="space-y-3">
                  {product.materials.map((material, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Delivery</h3>
                <p className="text-muted-foreground">
                  White-glove delivery and installation included. Our team will coordinate with you to schedule 
                  delivery and ensure your piece is perfectly positioned in your space.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Care Instructions</h3>
                <p className="text-muted-foreground">
                  Each piece comes with detailed care instructions specific to the materials used. Regular 
                  maintenance will ensure your furniture remains beautiful for years to come.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className="card-premium group hover-lift"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">From ${item.priceEstimateMin.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
