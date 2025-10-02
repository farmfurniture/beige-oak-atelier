import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CustomOrder = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    description: "",
    dimensions: { width: "", height: "", depth: "" },
    material: "",
    budget: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quote request submitted! We'll contact you within 24 hours.");
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "",
      description: "",
      dimensions: { width: "", height: "", depth: "" },
      material: "",
      budget: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Custom Order</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Let's create something extraordinary together. Share your vision, and our master craftsmen 
            will bring it to life.
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { step: "1", title: "Share Your Vision", desc: "Describe your ideal piece or upload inspiration images" },
            { step: "2", title: "Get Expert Guidance", desc: "Our design team will consult with you on materials & dimensions" },
            { step: "3", title: "Receive Your Quote", desc: "Get a detailed quote within 48 hours, including lead time" },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                {item.step}
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-semibold text-foreground">Your Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-6 pt-8 border-t border-border">
              <h2 className="text-2xl font-serif font-semibold text-foreground">Project Details</h2>
              
              <div className="space-y-2">
                <Label htmlFor="category">Furniture Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="bed">Bed</SelectItem>
                    <SelectItem value="sofa">Sofa</SelectItem>
                    <SelectItem value="couch">Couch</SelectItem>
                    <SelectItem value="dining">Dining Set</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your ideal piece... What style are you envisioning? Any specific design elements?"
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Approximate Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Width"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="Height"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="Depth"
                    value={formData.dimensions.depth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, depth: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Preferred Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Select material preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="oak">Oak</SelectItem>
                    <SelectItem value="walnut">Walnut</SelectItem>
                    <SelectItem value="linen">Linen</SelectItem>
                    <SelectItem value="leather">Leather</SelectItem>
                    <SelectItem value="velvet">Velvet</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                    <SelectItem value="5000-8000">$5,000 - $8,000</SelectItem>
                    <SelectItem value="8000-12000">$8,000 - $12,000</SelectItem>
                    <SelectItem value="12000+">$12,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Inspiration Images (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button type="submit" className="w-full btn-premium text-base py-6">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Submit Quote Request
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                We'll review your request and get back to you within 48 hours with a detailed quote.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;
