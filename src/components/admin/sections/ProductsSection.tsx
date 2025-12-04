"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Layers3,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { firebaseProductsService } from "@/services/firebase-products.service";

type LowStockAlert = {
  sku: string;
  product: string;
  stock: number;
  threshold: number;
};
type TopSeller = {
  sku: string;
  product: string;
  unitsSold: number;
  revenue: number;
};
type InventorySku = {
  sku: string;
  product: string;
  status: "Healthy" | "Low" | "Reorder";
  stock: number;
  incoming?: number;
};

function getProductIntelligence() {
  return {
    lowStock: [
      { sku: "SKU001", product: "Royal Bed", stock: 3, threshold: 5 },
    ] as LowStockAlert[],
    topSellers: [
      {
        sku: "SKU003",
        product: "Dining Table",
        unitsSold: 156,
        revenue: 46800,
      },
    ] as TopSeller[],
    inventory: [
      {
        sku: "SKU001",
        product: "Royal Bed",
        status: "Healthy" as const,
        stock: 45,
        incoming: 20,
      },
    ] as InventorySku[],
  };
}

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
          <p className="text-xs text-rose-600/80">
            Threshold {alert.threshold} units
          </p>
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
        <p className="text-sm font-semibold text-foreground">
          {product.product}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.unitsSold} units
        </p>
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
        <Badge
          className={cn(
            "rounded-full border text-xs font-semibold",
            inventoryStatusStyles[sku.status]
          )}
        >
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
          <span className="text-xs text-muted-foreground">No incoming</span>
        )}
      </div>
    </div>
  );
}

function AdminProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-primary/10 grid-cols-[1.5fr_1fr_1.5fr_1fr]">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{product.title}</p>
        <p className="text-xs text-muted-foreground">{product.slug}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {product.tags &&
            (Array.isArray(product.tags)
              ? product.tags
              : product.tags.split(",").map((t: string) => t.trim())
            ).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Price</p>
        {product.salePrice ? (
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              ${product.salePrice}
            </p>
            <p className="text-xs line-through text-muted-foreground">
              ${product.originalPrice}
            </p>
          </div>
        ) : (
          <p className="text-sm font-semibold">
            ${product.priceEstimateMin || product.priceMin}-$
            {product.priceEstimateMax || product.priceMax}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Details</p>
        <div className="flex gap-1 flex-nowrap overflow-hidden">
          {product.images && product.images.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {product.images.length} img
            </Badge>
          )}
          {product.faqs && product.faqs.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {product.faqs.length} FAQ
            </Badge>
          )}
          {product.isCustomAllowed && (
            <Badge variant="secondary" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProductsSection() {
  const { lowStock, topSellers, inventory } = useMemo(
    () => getProductIntelligence(),
    []
  );
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState<any>({
    title: "",
    slug: "",
    category: "beds",
    shortDescription: "",
    longDescription: "",
    priceMin: "",
    priceMax: "",
    salePrice: "",
    originalPrice: "",
    materials: "",
    dimensionsW: "",
    dimensionsH: "",
    dimensionsD: "",
    weight: "",
    leadTimeDays: "",
    tags: "",
    images: [],
    offers: [],
    isCustomAllowed: true,
    faqs: [{ question: "", answer: "" }],
    published: true,
    featured: false,
  });

  // Load products from Firebase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log("Loading products from Firebase...");
      const fetchedProducts = await firebaseProductsService.getAllProducts();
      console.log("Fetched products:", fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.title || !productForm.shortDescription) {
      toast.error("Fill in Title and Description");
      return;
    }

    // Auto-generate slug from title if not provided
    const slug =
      productForm.slug ||
      productForm.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!slug) {
      toast.error("Title is required to generate slug");
      return;
    }
    if (!productForm.priceMin || !productForm.priceMax) {
      toast.error("Fill in pricing");
      return;
    }
    if (!productForm.images || productForm.images.length === 0) {
      toast.error("Add at least one product image");
      return;
    }
    if (!productForm.materials || productForm.materials.trim() === "") {
      toast.error("Add product materials");
      return;
    }
    if (
      !productForm.dimensionsW ||
      !productForm.dimensionsH ||
      !productForm.dimensionsD
    ) {
      toast.error("Fill in all dimensions (Width, Height, Depth)");
      return;
    }
    if (!productForm.leadTimeDays) {
      toast.error("Fill in lead time");
      return;
    }

    const newProduct = {
      ...productForm,
      slug: slug,
      priceEstimateMin: Number(productForm.priceMin),
      priceEstimateMax: Number(productForm.priceMax),
      salePrice: productForm.salePrice
        ? Number(productForm.salePrice)
        : undefined,
      originalPrice: productForm.originalPrice
        ? Number(productForm.originalPrice)
        : undefined,
      materials:
        typeof productForm.materials === "string"
          ? productForm.materials
              .split(",")
              .map((m: string) => m.trim())
              .filter(Boolean)
          : productForm.materials,
      dimensions: {
        w: Number(productForm.dimensionsW),
        h: Number(productForm.dimensionsH),
        d: Number(productForm.dimensionsD),
      },
      leadTimeDays: Number(productForm.leadTimeDays),
      weight: productForm.weight ? Number(productForm.weight) : undefined,
      tags:
        typeof productForm.tags === "string"
          ? productForm.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : productForm.tags,
      images: productForm.images,
      offers: productForm.offers || [],
      faqs: productForm.faqs.filter(
        (faq: any) => faq.question.trim() !== "" && faq.answer.trim() !== ""
      ),
    };

    try {
      if (editingProduct) {
        // Update existing product in Firebase
        await firebaseProductsService.updateProduct(
          editingProduct.id,
          newProduct
        );
        toast.success("Product updated!");
      } else {
        // Create new product in Firebase
        await firebaseProductsService.createProduct(newProduct);
        toast.success("Product added!");
      }

      // Reload products from Firebase
      await loadProducts();

      setIsAddProductOpen(false);
      setProductForm({
        title: "",
        slug: "",
        category: "beds",
        shortDescription: "",
        longDescription: "",
        priceMin: "",
        priceMax: "",
        salePrice: "",
        originalPrice: "",
        materials: "",
        dimensionsW: "",
        dimensionsH: "",
        dimensionsD: "",
        weight: "",
        leadTimeDays: "",
        tags: "",
        images: [],
        offers: [],
        isCustomAllowed: true,
        faqs: [{ question: "", answer: "" }],
        published: true,
        featured: false,
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      priceMin: product.priceEstimateMin || product.priceMin || "",
      priceMax: product.priceEstimateMax || product.priceMax || "",
      materials: Array.isArray(product.materials)
        ? product.materials.join(", ")
        : product.materials || "",
      dimensionsW: product.dimensions?.w || product.dimensionsW || "",
      dimensionsH: product.dimensions?.h || product.dimensionsH || "",
      dimensionsD: product.dimensions?.d || product.dimensionsD || "",
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags || "",
      images:
        product.images && product.images.length > 0 ? product.images : [""],
      offers: product.offers && product.offers.length > 0 ? product.offers : [],
      faqs:
        product.faqs && product.faqs.length > 0
          ? product.faqs
          : [{ question: "", answer: "" }],
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await firebaseProductsService.deleteProduct(id);
      toast.success("Product deleted");
      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Helper function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const previewSlug = generateSlug(productForm.title);

  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary px-6">
              <Plus className="size-4 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update product details"
                  : "Fill in all fields"}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 px-6 pb-2 space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 w-full">
                    <Label className="text-xs">Title *</Label>
                    <Input
                      className="w-full"
                      value={productForm.title}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Product title"
                    />
                  </div>
                  <div className="space-y-1 w-full">
                    <Label className="text-xs">URL Slug (auto-generated)</Label>
                    <div className="px-3 py-2 border border-border rounded-md bg-muted text-sm text-muted-foreground flex items-center justify-between">
                      <span>{previewSlug || "(generated from title)"}</span>
                      {previewSlug && (
                        <code className="text-xs bg-background px-2 py-1 rounded ml-2">
                          /product/{previewSlug}
                        </code>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(v) =>
                      setProductForm({ ...productForm, category: v })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beds">Beds</SelectItem>
                      <SelectItem value="sofas">Sofas</SelectItem>
                      <SelectItem value="couches">Couches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Short Description *</Label>
                  <Textarea
                    value={productForm.shortDescription}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="1-2 line description"
                    rows={2}
                    className="w-full resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Long Description</Label>
                  <Textarea
                    value={productForm.longDescription}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        longDescription: e.target.value,
                      })
                    }
                    placeholder="Detailed description"
                    rows={2}
                    className="w-full resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tags (comma-separated)</Label>
                  <Input
                    className="w-full"
                    value={productForm.tags}
                    onChange={(e) =>
                      setProductForm({ ...productForm, tags: e.target.value })
                    }
                    placeholder="Bestseller, Premium, Limited Edition"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Product Images *</Label>
                  <ImageUpload
                    images={productForm.images}
                    onChange={(images) =>
                      setProductForm({ ...productForm, images })
                    }
                    maxImages={10}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Pricing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Min Price *</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.priceMin}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          priceMin: e.target.value,
                        })
                      }
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Price *</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.priceMax}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          priceMax: e.target.value,
                        })
                      }
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sale Price</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.salePrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          salePrice: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Original Price</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Details</h3>
                <div className="space-y-1">
                  <Label className="text-xs">Materials (comma-separated)</Label>
                  <Input
                    className="w-full"
                    value={productForm.materials}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        materials: e.target.value,
                      })
                    }
                    placeholder="Solid Oak Frame, Premium Linen, High-Density Foam"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width (cm)</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.dimensionsW}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          dimensionsW: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height (cm)</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.dimensionsH}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          dimensionsH: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Depth (cm)</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.dimensionsD}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          dimensionsD: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.weight}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          weight: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lead Time (days)</Label>
                    <Input
                      className="w-full"
                      type="number"
                      value={productForm.leadTimeDays}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          leadTimeDays: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="customAllowed"
                    checked={productForm.isCustomAllowed}
                    onCheckedChange={(c) =>
                      setProductForm({ ...productForm, isCustomAllowed: c })
                    }
                  />
                  <Label
                    htmlFor="customAllowed"
                    className="text-xs font-normal"
                  >
                    Allow Custom Orders
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Offers</h3>
                <p className="text-xs text-muted-foreground">
                  Add special offers like bank discounts, EMI, exchange offers
                </p>
                {productForm.offers.map((offer: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-semibold">
                        Offer {index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOffers = productForm.offers.filter(
                            (_: any, i: number) => i !== index
                          );
                          setProductForm({ ...productForm, offers: newOffers });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Offer Type</Label>
                      <Select
                        value={offer.type}
                        onValueChange={(value) => {
                          const newOffers = [...productForm.offers];
                          newOffers[index].type = value;
                          setProductForm({ ...productForm, offers: newOffers });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select offer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Offer</SelectItem>
                          <SelectItem value="emi">No Cost EMI</SelectItem>
                          <SelectItem value="exchange">
                            Exchange Offer
                          </SelectItem>
                          <SelectItem value="coupon">Coupon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input
                        className="w-full"
                        value={offer.title}
                        onChange={(e) => {
                          const newOffers = [...productForm.offers];
                          newOffers[index].title = e.target.value;
                          setProductForm({ ...productForm, offers: newOffers });
                        }}
                        placeholder="e.g., Bank Offer"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={offer.description}
                        onChange={(e) => {
                          const newOffers = [...productForm.offers];
                          newOffers[index].description = e.target.value;
                          setProductForm({ ...productForm, offers: newOffers });
                        }}
                        placeholder="e.g., 10% off for set in all purchases over ₹899 selected partner banks"
                        rows={2}
                        className="w-full resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Terms (Optional)</Label>
                      <Input
                        className="w-full"
                        value={offer.terms || ""}
                        onChange={(e) => {
                          const newOffers = [...productForm.offers];
                          newOffers[index].terms = e.target.value;
                          setProductForm({ ...productForm, offers: newOffers });
                        }}
                        placeholder="e.g., T&C apply"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setProductForm({
                      ...productForm,
                      offers: [
                        ...productForm.offers,
                        {
                          id: `offer-${Date.now()}`,
                          type: "bank",
                          title: "",
                          description: "",
                          terms: "",
                        },
                      ],
                    })
                  }
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  Add Offer
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">FAQs</h3>
                {productForm.faqs.map((faq: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-semibold">
                        FAQ {index + 1}
                      </Label>
                      {productForm.faqs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFaqs = productForm.faqs.filter(
                              (_: any, i: number) => i !== index
                            );
                            setProductForm({ ...productForm, faqs: newFaqs });
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Question</Label>
                      <Input
                        className="w-full"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...productForm.faqs];
                          newFaqs[index].question = e.target.value;
                          setProductForm({ ...productForm, faqs: newFaqs });
                        }}
                        placeholder="e.g., Is installation included?"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Answer</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...productForm.faqs];
                          newFaqs[index].answer = e.target.value;
                          setProductForm({ ...productForm, faqs: newFaqs });
                        }}
                        placeholder="Provide detailed answer..."
                        rows={3}
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setProductForm({
                      ...productForm,
                      faqs: [...productForm.faqs, { question: "", answer: "" }],
                    })
                  }
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Visibility</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={productForm.published}
                    onCheckedChange={(c) =>
                      setProductForm({ ...productForm, published: c })
                    }
                  />
                  <Label htmlFor="published" className="text-xs font-normal">
                    Published (shows on storefront)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={productForm.featured}
                    onCheckedChange={(c) =>
                      setProductForm({ ...productForm, featured: c })
                    }
                  />
                  <Label htmlFor="featured" className="text-xs font-normal">
                    Featured (highlighted)
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background">
              <Button
                variant="outline"
                onClick={() => setIsAddProductOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Catalog ({products.length} products)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No products yet. Click "Add New Product" to get started.
            </p>
          ) : (
            products.map((p) => (
              <AdminProductRow
                key={p.id}
                product={p}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((alert) => (
              <LowStockCard key={alert.sku} alert={alert} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="size-4 text-primary" />
              Top Sellers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSellers.map((seller) => (
              <TopSellerRow key={seller.sku} product={seller} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle>Inventory by SKU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((sku) => (
              <InventoryRow key={sku.sku} sku={sku} />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
