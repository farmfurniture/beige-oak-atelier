/**
 * Simple admin authentication middleware
 * Checks if admin session exists in localStorage
 */

import { isAdminSessionValid } from "@/config/admin-config";

export function checkAdminAuth(): boolean {
  return isAdminSessionValid();
}

export function requireAdminAuth(redirectTo: string = "/admin/login"): void {
  if (typeof window === 'undefined') return;
  
  if (!checkAdminAuth()) {
    window.location.href = redirectTo;
  }
}
