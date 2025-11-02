"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { adminLogoutAction } from "@/actions/admin.actions";

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export type AdminAuthProviderProps = {
  children: ReactNode;
  initialIsAuthenticated?: boolean;
};

export function AdminAuthProvider({
  children,
  initialIsAuthenticated = false,
}: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const router = useRouter();

  const logout = useCallback(async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
    router.replace("/admin/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated,
      logout,
    }),
    [isAuthenticated, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}
