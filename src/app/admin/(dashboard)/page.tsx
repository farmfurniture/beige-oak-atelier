import { SalesOverviewSection } from "@/components/admin/sections/SalesOverviewSection";
import { OrdersSection } from "@/components/admin/sections/OrdersSection";
import { CustomersSection } from "@/components/admin/sections/CustomersSection";
import { ProductsSection } from "@/components/admin/sections/ProductsSection";
import { AnalyticsSection } from "@/components/admin/sections/AnalyticsSection";
import { PaymentsSection } from "@/components/admin/sections/PaymentsSection";
import { ShippingSection } from "@/components/admin/sections/ShippingSection";

export const metadata = {
  title: "Admin Dashboard • Beige Oak Atelier",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10 pb-16">
      <SalesOverviewSection />
      <OrdersSection />
      <CustomersSection />
      <ProductsSection />
      <AnalyticsSection />
      <PaymentsSection />
      <ShippingSection />
    </div>
  );
}
