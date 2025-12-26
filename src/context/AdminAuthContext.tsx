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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize with actual session state
    if (typeof window !== 'undefined') {
      return isAdminSessionValid();
    }
    return initialIsAuthenticated;
  });
  const router = useRouter();

  // Check authentication on mount and periodically
  useEffect(() => {
    // Only check and redirect if we're on an admin page (not login)
    const isAdminPage = typeof window !== 'undefined' && 
                        window.location.pathname.startsWith('/admin') && 
                        window.location.pathname !== '/admin/login' &&
                        window.location.pathname !== '/admin/setup';

    const checkAuth = () => {
      const isValid = isAdminSessionValid();
      setIsAuthenticated(isValid);
      
      // Only redirect if on admin page and not authenticated
      if (!isValid && isAdminPage) {
        router.replace("/admin/login");
      }
    };

    // Initial check after a small delay to ensure session is set
    const initialTimeout = setTimeout(checkAuth, 100);
    
    // Check every 5 minutes (not every minute to reduce checks)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
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
