"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Layers3, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  getProductIntelligence,
  type InventorySku,
  type LowStockAlert,
  type TopSeller,
} from "@/services/admin.service";
import { toast } from "sonner";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const inventoryStatusStyles: Record<InventorySku["status"], string> = {
  Healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Low: "bg-amber-100 text-amber-700 border-amber-200",
  Reorder: "bg-rose-100 text-rose-700 border-rose-200",
};

function LowStockCard({ alert }: { alert: LowStockAlert }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-rose-200/60 bg-rose-50/80 px-4 py-3">
      <div className="flex items-center gap-3 text-rose-700">
        <AlertTriangle className="size-5" />
        <div>
          <p className="text-sm font-semibold">{alert.product}</p>
          <p className="text-xs text-rose-600/80">Threshold {alert.threshold} units</p>
        </div>
      </div>
      <Badge className="rounded-full border-rose-200 bg-white px-3 py-1 text-sm font-semibold text-rose-700">
        {alert.stock} in stock
      </Badge>
    </div>
  );
}

function TopSellerRow({ product }: { product: TopSeller }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-primary/10">
      <div>
        <p className="text-sm font-semibold text-foreground">{product.product}</p>
        <p className="text-xs text-muted-foreground">{product.unitsSold} units</p>
      </div>
      <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
        {currency.format(product.revenue)}
      </Badge>
    </div>
  );
}

function InventoryRow({ sku }: { sku: InventorySku }) {
  return (
    <div className="grid items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-primary/10 sm:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <p className="text-sm font-semibold text-foreground">{sku.product}</p>
        <p className="text-xs text-muted-foreground">{sku.sku}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={cn("rounded-full border text-xs font-semibold", inventoryStatusStyles[sku.status])}>
          {sku.status}
        </Badge>
        <p className="text-sm font-medium text-slate-600">{sku.stock} units</p>
      </div>
      <div className="flex items-center justify-end">
        {sku.incoming ? (
          <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {sku.incoming} inbound
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No incoming transfers</span>
        )}
      </div>
    </div>
  );
}

export function ProductsSection() {
  const { lowStock, topSellers, inventory } = useMemo(() => getProductIntelligence(), []);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  
  // Product form state
  const [productForm, setProductForm] = useState({
    // Basic Info
    title: "",
    slug: "",
    category: "beds",
    shortDescription: "",
    longDescription: "",
    
    // Pricing
    priceMin: "",
    priceMax: "",
    salePrice: "",
    originalPrice: "",
    discount: "",
    
    // Details
    materials: "",
    dimensionsW: "",
    dimensionsH: "",
    dimensionsD: "",
    weight: "",
    leadTimeDays: "",
    
    // Features
    isCustomAllowed: true,
    tags: "",
    
    // Images
    images: ["", "", "", "", ""],
    
    // Size Variants
    sizeVariants: [
      { label: "", dimensions: "", height: "", price: "", originalPrice: "", available: true }
    ],
    
    // Specifications
    finish: "",
    assembly: "",
    
    // Care & Warranty
    careInstructions: "",
    warrantyDuration: "",
    warrantyDescription: "",
    
    // Service Highlights
    serviceHighlights: [
      { title: "", description: "" }
    ],
    
    // FAQs
    faqs: [
      { question: "", answer: "" }
    ],
    
    // Offers
    offers: [
      { type: "bank", title: "", description: "", terms: "" }
    ]
  });

  const handleAddProduct = () => {
    // Validate required fields
    if (!productForm.title || !productForm.slug || !productForm.shortDescription) {
      toast.error("Please fill in all required fields in Basic Info");
      setCurrentTab("basic");
      return;
    }

    if (!productForm.priceMin || !productForm.priceMax) {
      toast.error("Please fill in pricing information");
      setCurrentTab("pricing");
      return;
    }

    // Here you would typically call an API to save the product
    toast.success("Product added successfully!");
    setIsAddProductOpen(false);
    
    // Reset form (you might want to keep this in a separate function)
  };

  const addSizeVariant = () => {
    setProductForm({
      ...productForm,
      sizeVariants: [
        ...productForm.sizeVariants,
        { label: "", dimensions: "", height: "", price: "", originalPrice: "", available: true }
      ]
    });
  };

  const removeSizeVariant = (index: number) => {
    setProductForm({
      ...productForm,
      sizeVariants: productForm.sizeVariants.filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    setProductForm({
      ...productForm,
      faqs: [...productForm.faqs, { question: "", answer: "" }]
    });
  };

  const removeFAQ = (index: number) => {
    setProductForm({
      ...productForm,
      faqs: productForm.faqs.filter((_, i) => i !== index)
    });
  };

  const addOffer = () => {
    setProductForm({
      ...productForm,
      offers: [...productForm.offers, { type: "bank", title: "", description: "", terms: "" }]
    });
  };

  const removeOffer = (index: number) => {
    setProductForm({
      ...productForm,
      offers: productForm.offers.filter((_, i) => i !== index)
    });
  };

  return (
    <section className="space-y-6">
      {/* Add Product Button */}
      <div className="flex justify-end">
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary px-6 text-sm font-medium">
              <Plus className="size-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in all the details to add a new furniture product to your catalog
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="Royal Upholstered Bed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      placeholder="royal-upholstered-bed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beds">Beds</SelectItem>
                      <SelectItem value="sofas">Sofas</SelectItem>
                      <SelectItem value="couches">Couches</SelectItem>
                      <SelectItem value="tables">Tables</SelectItem>
                      <SelectItem value="chairs">Chairs</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Short Description *</Label>
                  <Textarea
                    id="shortDesc"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    placeholder="Brief product description (1-2 lines)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDesc">Long Description</Label>
                  <Textarea
                    id="longDesc"
                    value={productForm.longDescription}
                    onChange={(e) => setProductForm({ ...productForm, longDescription: e.target.value })}
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Images (URLs)</Label>
                  {productForm.images.map((img, index) => (
                    <Input
                      key={index}
                      value={img}
                      onChange={(e) => {
                        const newImages = [...productForm.images];
                        newImages[index] = e.target.value;
                        setProductForm({ ...productForm, images: newImages });
                      }}
                      placeholder={`Image ${index + 1} URL`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="customAllowed"
                    checked={productForm.isCustomAllowed}
                    onCheckedChange={(checked) => setProductForm({ ...productForm, isCustomAllowed: checked })}
                  />
                  <Label htmlFor="customAllowed">Allow custom orders</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="Bestseller, Custom-Made, Premium"
                  />
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceMin">Minimum Price *</Label>
                    <Input
                      id="priceMin"
                      type="number"
                      value={productForm.priceMin}
                      onChange={(e) => setProductForm({ ...productForm, priceMin: e.target.value })}
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceMax">Maximum Price *</Label>
                    <Input
                      id="priceMax"
                      type="number"
                      value={productForm.priceMax}
                      onChange={(e) => setProductForm({ ...productForm, priceMax: e.target.value })}
                      placeholder="4200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      placeholder="4200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    placeholder="40"
                  />
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials (comma-separated)</Label>
                  <Input
                    id="materials"
                    value={productForm.materials}
                    onChange={(e) => setProductForm({ ...productForm, materials: e.target.value })}
                    placeholder="Solid Oak Frame, Premium Linen, High-Density Foam"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dimW">Width (cm)</Label>
                    <Input
                      id="dimW"
                      type="number"
                      value={productForm.dimensionsW}
                      onChange={(e) => setProductForm({ ...productForm, dimensionsW: e.target.value })}
                      placeholder="180"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimH">Height (cm)</Label>
                    <Input
                      id="dimH"
                      type="number"
                      value={productForm.dimensionsH}
                      onChange={(e) => setProductForm({ ...productForm, dimensionsH: e.target.value })}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimD">Depth (cm)</Label>
                    <Input
                      id="dimD"
                      type="number"
                      value={productForm.dimensionsD}
                      onChange={(e) => setProductForm({ ...productForm, dimensionsD: e.target.value })}
                      placeholder="210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="85"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time (days)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      value={productForm.leadTimeDays}
                      onChange={(e) => setProductForm({ ...productForm, leadTimeDays: e.target.value })}
                      placeholder="28"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finish">Finish</Label>
                  <Input
                    id="finish"
                    value={productForm.finish}
                    onChange={(e) => setProductForm({ ...productForm, finish: e.target.value })}
                    placeholder="Natural Oak with Premium Upholstery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assembly">Assembly Instructions</Label>
                  <Textarea
                    id="assembly"
                    value={productForm.assembly}
                    onChange={(e) => setProductForm({ ...productForm, assembly: e.target.value })}
                    placeholder="Professional installation included. Assembly time: 1-2 hours"
                    rows={2}
                  />
                </div>
              </TabsContent>

              {/* Size Variants Tab */}
              <TabsContent value="variants" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label>Size Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSizeVariant}>
                    <Plus className="size-4" />
                    Add Variant
                  </Button>
                </div>

                {productForm.sizeVariants.map((variant, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Variant {index + 1}</Label>
                        {productForm.sizeVariants.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSizeVariant(index)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Label (e.g., Queen)"
                          value={variant.label}
                          onChange={(e) => {
                            const newVariants = [...productForm.sizeVariants];
                            newVariants[index].label = e.target.value;
                            setProductForm({ ...productForm, sizeVariants: newVariants });
                          }}
                        />
                        <Input
                          placeholder="Dimensions (e.g., 150 X 190)"
                          value={variant.dimensions}
                          onChange={(e) => {
                            const newVariants = [...productForm.sizeVariants];
                            newVariants[index].dimensions = e.target.value;
                            setProductForm({ ...productForm, sizeVariants: newVariants });
                          }}
                        />
                        <Input
                          placeholder="Height (e.g., 5 inches)"
                          value={variant.height}
                          onChange={(e) => {
                            const newVariants = [...productForm.sizeVariants];
                            newVariants[index].height = e.target.value;
                            setProductForm({ ...productForm, sizeVariants: newVariants });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...productForm.sizeVariants];
                            newVariants[index].price = e.target.value;
                            setProductForm({ ...productForm, sizeVariants: newVariants });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Original Price"
                          value={variant.originalPrice}
                          onChange={(e) => {
                            const newVariants = [...productForm.sizeVariants];
                            newVariants[index].originalPrice = e.target.value;
                            setProductForm({ ...productForm, sizeVariants: newVariants });
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={variant.available}
                            onCheckedChange={(checked) => {
                              const newVariants = [...productForm.sizeVariants];
                              newVariants[index].available = checked;
                              setProductForm({ ...productForm, sizeVariants: newVariants });
                            }}
                          />
                          <Label>Available</Label>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Content Tab (FAQs, Care, Warranty) */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="care">Care Instructions</Label>
                  <Textarea
                    id="care"
                    value={productForm.careInstructions}
                    onChange={(e) => setProductForm({ ...productForm, careInstructions: e.target.value })}
                    placeholder="Detailed care instructions..."
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                    <Input
                      id="warrantyDuration"
                      value={productForm.warrantyDuration}
                      onChange={(e) => setProductForm({ ...productForm, warrantyDuration: e.target.value })}
                      placeholder="1 year manufacturing warranty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyDesc">Warranty Description</Label>
                    <Textarea
                      id="warrantyDesc"
                      value={productForm.warrantyDescription}
                      onChange={(e) => setProductForm({ ...productForm, warrantyDescription: e.target.value })}
                      placeholder="What the warranty covers..."
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>FAQs</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
                      <Plus className="size-4" />
                      Add FAQ
                    </Button>
                  </div>

                  {productForm.faqs.map((faq, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>FAQ {index + 1}</Label>
                          {productForm.faqs.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFAQ(index)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...productForm.faqs];
                            newFaqs[index].question = e.target.value;
                            setProductForm({ ...productForm, faqs: newFaqs });
                          }}
                        />
                        <Textarea
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...productForm.faqs];
                            newFaqs[index].answer = e.target.value;
                            setProductForm({ ...productForm, faqs: newFaqs });
                          }}
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Extras Tab (Offers, Service Highlights) */}
              <TabsContent value="extras" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Special Offers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOffer}>
                      <Plus className="size-4" />
                      Add Offer
                    </Button>
                  </div>

                  {productForm.offers.map((offer, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Offer {index + 1}</Label>
                          {productForm.offers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOffer(index)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <Select
                          value={offer.type}
                          onValueChange={(value) => {
                            const newOffers = [...productForm.offers];
                            newOffers[index].type = value;
                            setProductForm({ ...productForm, offers: newOffers });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Bank Offer</SelectItem>
                            <SelectItem value="emi">EMI Offer</SelectItem>
                            <SelectItem value="exchange">Exchange Offer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Title"
                          value={offer.title}
                          onChange={(e) => {
                            const newOffers = [...productForm.offers];
                            newOffers[index].title = e.target.value;
                            setProductForm({ ...productForm, offers: newOffers });
                          }}
                        />
                        <Textarea
                          placeholder="Description"
                          value={offer.description}
                          onChange={(e) => {
                            const newOffers = [...productForm.offers];
                            newOffers[index].description = e.target.value;
                            setProductForm({ ...productForm, offers: newOffers });
                          }}
                          rows={2}
                        />
                        <Input
                          placeholder="Terms & Conditions"
                          value={offer.terms}
                          onChange={(e) => {
                            const newOffers = [...productForm.offers];
                            newOffers[index].terms = e.target.value;
                            setProductForm({ ...productForm, offers: newOffers });
                          }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Low stock alerts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ensure wellness suites stay prepared with replenishment signals.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((alert) => (
              <LowStockCard key={alert.sku} alert={alert} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Top sellers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revenue leaders from sanctuaries and digital ateliers.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSellers.map((product) => (
              <TopSellerRow key={product.sku} product={product} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Inventory by SKU</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monitor craftsmanship cycles and on-hand sanctuary essentials.
            </p>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary shadow-sm">
            <Layers3 className="mr-1 size-3" />
            {inventory.length} tracked
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventory.map((sku) => (
            <InventoryRow key={sku.sku} sku={sku} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
