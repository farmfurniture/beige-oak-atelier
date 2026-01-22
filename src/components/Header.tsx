import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CartIcon from "@/components/CartIcon";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Catalog", path: "/catalog" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border relative">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="brand-name text-xl sm:text-2xl md:text-3xl text-primary">
              FarmsCraft
            </h1>
          </Link>

          {/* Desktop Navigation + Icons - All on Right */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="nav-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Action Icons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <Link href="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <CartIcon />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <CartIcon />
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

