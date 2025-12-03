/**
 * Simple Static Admin Configuration
 * Change these credentials to your desired admin login
 */

export const ADMIN_CONFIG = {
  // Change these to your desired credentials
  email: "admin@farmscraft.com",
  password: "admin123", // Change this to a secure password
  
  // Session settings
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

/**
 * Check if provided credentials match admin credentials
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password;
}

/**
 * Check if admin session is valid
 */
export function isAdminSessionValid(): boolean {
  if (typeof window === 'undefined') {
    console.log('[Admin Auth] Running on server, returning false');
    return false;
  }
  
  const session = localStorage.getItem('admin_session');
  if (!session) {
    console.log('[Admin Auth] No session found in localStorage');
    return false;
  }
  
  try {
    const { timestamp } = JSON.parse(session);
    const now = Date.now();
    const isValid = (now - timestamp) < ADMIN_CONFIG.sessionDuration;
    const timeLeft = ADMIN_CONFIG.sessionDuration - (now - timestamp);
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    
    console.log('[Admin Auth] Session valid:', isValid, '| Time left:', hoursLeft, 'hours');
    return isValid;
  } catch (error) {
    console.error('[Admin Auth] Error parsing session:', error);
    return false;
  }
}

/**
 * Create admin session
 */
export function createAdminSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('admin_session', JSON.stringify({
    timestamp: Date.now(),
    isAdmin: true,
  }));
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
}
