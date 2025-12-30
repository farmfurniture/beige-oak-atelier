import { NextRequest } from 'next/server';

// Simple static session token - must match the one in admin.actions.ts and middleware.ts
const ADMIN_SESSION_TOKEN = "admin_authenticated_session_2024";

/**
 * Validates the admin session cookie
 * Returns true if valid, false otherwise
 */
export function validateAdminSession(request: NextRequest): boolean {
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (!sessionCookie) {
        return false;
    }

    return sessionCookie === ADMIN_SESSION_TOKEN;
}
