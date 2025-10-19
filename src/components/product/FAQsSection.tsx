"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type FAQ } from "@/models/ProductDetail";

interface FAQsSectionProps {
  faqs: FAQ[];
}

export default function FAQsSection({ faqs }: FAQsSectionProps) {
  return (
    <section id="faqs" className="py-12 scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-6 bg-secondary/20 rounded-xl border border-border max-w-3xl">
          <h3 className="font-semibold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Can't find the answer you're looking for? Please chat with our
            friendly team.
          </p>
          <button className="text-sm text-primary font-medium hover:underline">
            Contact Support →
          </button>
        </div>
      </div>
    </section>
  );
}
