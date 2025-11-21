import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "@/app/providers";
import "./globals.css";

// Force dynamic rendering since Header uses cookies
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Farm Craft - Premium Handcrafted Furniture",
  description:
    "Premium furniture crafted by master artisans. Each piece tells a story of dedication, quality materials, and timeless design.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
