import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata = {
  title: "Bēige & Oak Atelier - Premium Handcrafted Furniture",
  description:
    "Premium furniture crafted by master artisans. Each piece tells a story of dedication, quality materials, and timeless design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </TooltipProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
