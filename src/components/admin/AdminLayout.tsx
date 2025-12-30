"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import {
  BarChart3,
  CreditCard,
  FileChartColumnIncreasing,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAdminProfileAction } from "@/actions/admin-settings.actions";
import { useAdminAuth } from "@/context/AdminAuthContext";

type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Commerce",
    items: [
      { title: "Orders", href: "/admin", icon: ShoppingBag },
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
      { title: "Shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const allNavItems = navSections.flatMap((section) => section.items);

function findActiveItem(pathname: string) {
  return (
    allNavItems.find((item) => item.href === pathname) ??
    allNavItems.find(
      (item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`)
    ) ??
    allNavItems.find((item) => item.href === "/admin")
  );
}

type SidebarProps = {
  activePath: string;
  onNavigate?: () => void;
  onSignOut?: () => void;
  profilePictureUrl?: string;
  adminEmail?: string;
};

function Sidebar({ activePath, onNavigate, onSignOut, profilePictureUrl, adminEmail }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[rgba(255,255,255,0.85)] px-6 py-8 backdrop-blur-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
          <FileChartColumnIncreasing className="size-6" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">FarmCraft</p>
          <h1 className="text-xl font-semibold text-foreground">Admin Console</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activePath === item.href ||
                    (item.href !== "/admin" && activePath.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-white/40 text-muted-foreground hover:bg-white/70 hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20",
                            isActive && "bg-primary/20 text-primary-foreground"
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.6} />
                        </span>
                        <span className="text-sm font-medium">{item.title}</span>
                      </span>
                      {item.badge ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="my-6 border-white/40" />

      <div className="flex items-center gap-4 rounded-2xl bg-white/60 p-4 shadow-inner shadow-primary/10">
        <Avatar className="size-12 border border-primary/20">
          {profilePictureUrl && <AvatarImage src={profilePictureUrl} alt="Admin" />}
          <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
            AD
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">Administrator</p>
          <p className="truncate text-xs text-muted-foreground">{adminEmail || "admin@farmscraft.com"}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={onSignOut}
        >
          <LogOut className="size-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </div>
  );
}

export type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [profile, setProfile] = useState<{ email: string; profilePictureUrl?: string } | null>(null);

  useEffect(() => {
    getAdminProfileAction().then(setProfile).catch(console.error);
  }, []);

  const activeItem = useMemo(() => findActiveItem(pathname), [pathname]);
  const pageTitle = activeItem?.title ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-muted/60 via-white to-muted/80">
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 rounded-full bg-white/50 backdrop-blur lg:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] border-none bg-transparent p-0">
          <Sidebar
            activePath={pathname}
            onNavigate={() => setIsMobileNavOpen(false)}
            onSignOut={() => void logout()}
            profilePictureUrl={profile?.profilePictureUrl}
            adminEmail={profile?.email}
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden w-[320px] shrink-0 border-r border-white/30 lg:block">
        <Sidebar
          activePath={pathname}
          onSignOut={() => void logout()}
          profilePictureUrl={profile?.profilePictureUrl}
          adminEmail={profile?.email}
        />
      </aside>

      <div className="relative flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/40 bg-white/80 px-6 backdrop-blur-lg lg:px-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
                  <span className="relative inline-flex size-3 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Live
                </span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Monitoring showroom wellness experiences in real time
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-foreground lg:text-3xl">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-primary/20 bg-white/60 px-5 py-2 text-sm font-semibold text-primary shadow-sm shadow-primary/10 hover:bg-primary/10"
              onClick={() => {
                void logout();
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-12 pt-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
