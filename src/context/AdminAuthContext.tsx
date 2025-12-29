"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { adminLogoutAction } from "@/actions/admin.actions";

type AdminAuthContextValue = {
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export type AdminAuthProviderProps = {
  children: ReactNode;
};

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await adminLogoutAction();
    router.replace("/admin/login");
  }, [router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      logout,
    }),
    [logout]
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
