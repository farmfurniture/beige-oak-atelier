"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbNavigationProps {
  items: Breadcrumb[];
}

export default function BreadcrumbNavigation({
  items,
}: BreadcrumbNavigationProps) {
  return (
    <nav className="w-full flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium truncate">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors truncate"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
