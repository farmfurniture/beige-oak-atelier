import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CartIcon from "@/components/CartIcon";
import { getCartData } from "@/actions/cart.actions";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Catalog", path: "/catalog" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Header = async () => {
  // Get cart data on the server
  const { itemCount } = await getCartData();

  return (
    <header className="w-full bg-background border-b border-border relative">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="brand-name text-2xl md:text-3xl text-primary">
              FarmCraft
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
              <CartIcon itemCount={itemCount} />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <CartIcon itemCount={itemCount} />
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
