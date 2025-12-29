"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAdminSessionValid, clearAdminSession } from "@/config/admin-config";

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export type AdminAuthProviderProps = {
  children: ReactNode;
};

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication once on mount
  useEffect(() => {
    const storedValue = localStorage.getItem('admin_logged_in');
    console.log('[AdminAuthContext] Mount - localStorage value:', storedValue);

    const isValid = isAdminSessionValid();
    console.log('[AdminAuthContext] isAdminSessionValid():', isValid);

    setIsAuthenticated(isValid);
    setIsLoading(false);

    // If not valid and on admin page (not login/setup), redirect
    const pathname = window.location.pathname;
    console.log('[AdminAuthContext] Current pathname:', pathname);

    if (!isValid && pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/setup') {
      console.log('[AdminAuthContext] Not authenticated, redirecting to login');
      router.replace("/admin/login");
    } else {
      console.log('[AdminAuthContext] Auth check passed, not redirecting');
    }
  }, [router]);

  const logout = useCallback(() => {
    clearAdminSession();
    setIsAuthenticated(false);
    router.replace("/admin/login");
  }, [router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated,
      logout,
    }),
    [isAuthenticated, logout]
  );

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}
