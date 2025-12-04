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
    <div className="w-full max-w-full grid grid-cols-2 gap-2 md:gap-3">
      {highlights.map((highlight) => {
        const IconComponent =
          iconMap[highlight.icon as keyof typeof iconMap] || Shield;

        return (
          <div
            key={highlight.id}
            className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl bg-secondary/10 border border-border/50 hover:border-primary/20 hover:bg-secondary/20 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center mb-2 text-primary">
              <IconComponent className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground text-xs mb-0.5">
              {highlight.title}
            </h4>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {highlight.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
