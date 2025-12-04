"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Truck, Shield, Star } from "lucide-react";
import {
  type Specification,
  type CareInstructions,
  type Warranty,
  type QualityPromiseItem,
} from "@/models/ProductDetail";

interface ProductDetailsProps {
  specifications: Specification;
  careInstructions: CareInstructions;
  warranty: Warranty;
  qualityPromises: QualityPromiseItem[];
  features?: Array<{ title: string; description: string }>;
}

const qualityIconMap = {
  "check-circle": CheckCircle2,
  truck: Truck,
  shield: Shield,
  star: Star,
};

export default function ProductDetails({
  specifications,
  careInstructions,
  warranty,
  qualityPromises,
  features,
}: ProductDetailsProps) {
  return (
    <section id="details" className="py-12 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Product Details
        </h2>

        {/* Features Accordion */}
        {features && features.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Features
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {features.map((feature, index) => (
                <AccordionItem key={index} value={`feature-${index}`}>
                  <AccordionTrigger className="text-left">
                    {feature.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Specifications Card */}
        <div className="bg-secondary/20 rounded-xl p-6 mb-8 border border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-6">
            Product specifications
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Dimensions</h4>
              <p className="text-muted-foreground">
                {specifications.dimensions}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Materials</h4>
              <p className="text-muted-foreground">
                {specifications.materials}
              </p>
            </div>
            {specifications.finish && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Finish</h4>
                <p className="text-muted-foreground">{specifications.finish}</p>
              </div>
            )}
            {specifications.weight && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Weight</h4>
                <p className="text-muted-foreground">{specifications.weight}</p>
              </div>
            )}
            {specifications.assembly && (
              <div className="md:col-span-2">
                <h4 className="font-semibold text-foreground mb-2">Assembly</h4>
                <p className="text-muted-foreground">
                  {specifications.assembly}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Care Instructions */}
        <div className="bg-background rounded-xl p-6 mb-8 border border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Care instructions
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {careInstructions.content}
          </p>
        </div>

        {/* Warranty */}
        <div className="bg-secondary/20 rounded-xl p-6 mb-8 border border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Warranty
          </h3>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {warranty.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {warranty.duration}
            </p>
            <p className="text-muted-foreground">{warranty.description}</p>
          </div>
        </div>

        {/* Quality Promise */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-6">
            Quality promise
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {qualityPromises.map((promise) => {
              const IconComponent =
                qualityIconMap[promise.icon as keyof typeof qualityIconMap] ||
                CheckCircle2;

              return (
                <div key={promise.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {promise.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {promise.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
