import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}
