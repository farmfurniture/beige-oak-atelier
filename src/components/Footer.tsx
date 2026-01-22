import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaPinterest } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-primary/20">
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="brand-name text-2xl text-white">
              FarmsCraft
            </h3>
            <p className="tagline text-white/70">
              Made by hand. Loved for years.
            </p>
            {/* Social media links - Add your real social media URLs here 
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#E4405F] hover:text-[#E4405F] hover:bg-white/10"
                asChild
              >
                <a href="https://instagram.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#1877F2] hover:text-[#1877F2] hover:bg-white/10"
                asChild
              >
                <a href="https://facebook.com/YOUR_PAGE" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#1DA1F2] hover:text-[#1DA1F2] hover:bg-white/10"
                asChild
              >
                <a href="https://twitter.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#E60023] hover:text-[#E60023] hover:bg-white/10"
                asChild
              >
                <a href="https://pinterest.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer">
                  <FaPinterest className="h-4 w-4" />
                </a>
              </Button>
            </div>
            */}
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/catalog?category=beds"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Beds
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=sofas"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Sofas
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=couches"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Couches
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Visit Showroom
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Stay Connected
            </h4>
            <p className="craft-detail text-white/70 mb-4">
              Subscribe for exclusive offers and design inspiration.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Your email" className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              <Button className="bg-white text-primary hover:bg-white/90 px-6">Join</Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-white/70">
            © {currentYear} FarmsCraft. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/privacy"
              className="text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
