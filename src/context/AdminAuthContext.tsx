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
  initialIsAuthenticated?: boolean;
};

export function AdminAuthProvider({
  children,
  initialIsAuthenticated = false,
}: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isValid = isAdminSessionValid();
      setIsAuthenticated(isValid);
      
      if (!isValid && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        router.replace("/admin/login");
      }
    };

    checkAuth();
    
    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    
    return () => clearInterval(interval);
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

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}
