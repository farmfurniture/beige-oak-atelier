"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: "product", label: "Product", href: "#product" },
  { id: "details", label: "Details", href: "#details" },
  { id: "reviews", label: "Reviews", href: "#reviews" },
  { id: "faqs", label: "FAQs", href: "#faqs" },
  { id: "similar", label: "Similar", href: "#similar" },
];

export default function StickyNavigation() {
  const [activeSection, setActiveSection] = useState("product");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navigation only when scrolled past 400px (after main header and hero)
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 400);

      // Determine active section based on scroll position
      const sections = navItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          // Check if section is in the viewport (with offset for sticky nav)
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for sticky navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 w-full transition-all duration-300 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="container mx-auto px-0 md:px-4">
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide py-3 px-4 md:px-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.href)}
              className={cn(
                "px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0",
                "hover:bg-secondary/50",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
