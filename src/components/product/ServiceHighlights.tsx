"use client";

import { Truck, Shield, CreditCard, RotateCcw } from "lucide-react";
import { type ServiceHighlight } from "@/models/ProductDetail";

const iconMap = {
  truck: Truck,
  shield: Shield,
  "credit-card": CreditCard,
  rotate: RotateCcw,
};

interface ServiceHighlightsProps {
  highlights: ServiceHighlight[];
}

export default function ServiceHighlights({
  highlights,
}: ServiceHighlightsProps) {
  return (
    <section className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlights.map((highlight) => {
          const IconComponent =
            iconMap[highlight.icon as keyof typeof iconMap] || Shield;

          return (
            <div
              key={highlight.id}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-secondary/20 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">
                {highlight.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
