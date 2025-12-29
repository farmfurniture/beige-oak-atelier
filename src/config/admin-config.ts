/**
 * Simple Static Admin Configuration
 * Change these credentials to your desired admin login
 */

export const ADMIN_CONFIG = {
  // Change these to your desired credentials
  email: "admin@farmscraft.com",
  password: "admin123",
};

/**
 * Check if provided credentials match admin credentials
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password;
}

/**
 * Check if admin is logged in (simple check)
 */
export function isAdminSessionValid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem('admin_logged_in') === 'true';
}

/**
 * Create admin session (simple)
 */
export function createAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_logged_in', 'true');
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_logged_in');
}

