import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const hasSession = Boolean(cookies().get("admin_session"));

  return (
    <AdminAuthProvider initialIsAuthenticated={hasSession}>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}
