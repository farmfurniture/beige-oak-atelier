"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  navLinks: Array<{ name: string; path: string }>;
}

export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Auto-close menu when viewport crosses desktop breakpoint (1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Lock page scroll (and horizontal overflow) while the menu is open
  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      html.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      html.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer (right) */}
          <aside
            className="
              absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-background
              transition-transform duration-300 will-change-transform
              translate-x-0 shadow-[-20px_0_40px_-24px_rgba(34,16,20,0.65)]
            "
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="brand-name text-xl text-primary">FarmCraft</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <nav className="flex flex-col p-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive(link.path)
                        ? "text-white bg-primary shadow-md"
                        : "text-foreground hover:bg-accent hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-8 pt-6 border-t border-border space-y-1">
                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all"
                >
                  <Search className="h-5 w-5" />
                  <span>Search Products</span>
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>My Account</span>
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
