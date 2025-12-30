import { OrdersSection } from "@/components/admin/sections/OrdersSection";

export const metadata = {
  title: "Orders • FarmCraft Admin",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10 pb-16">
      <OrdersSection />
    </div>
  );
}
