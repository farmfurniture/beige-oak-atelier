import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_FORGOT_PASSWORD_PATH = "/admin/forgot-password";
const ADMIN_RESET_PASSWORD_PATH = "/admin/reset-password";

// Simple static session token - must match the one in admin.actions.ts
const ADMIN_SESSION_TOKEN = "admin_authenticated_session_2024";

/**
 * Verifies the admin session cookie.
 * Simple check - just validates the token value matches.
 */
function verifyAdminSessionCookie(cookieValue: string): boolean {
  return cookieValue === ADMIN_SESSION_TOKEN;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSessionCookie = request.cookies.get("admin_session")?.value;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === ADMIN_LOGIN_PATH ||
    pathname === ADMIN_FORGOT_PASSWORD_PATH ||
    pathname.startsWith(ADMIN_RESET_PASSWORD_PATH);

  // Check if trying to access a protected admin route
  if (isAdminRoute && !isAuthRoute) {
    // Verify the session token
    const isValidSession = adminSessionCookie && verifyAdminSessionCookie(adminSessionCookie);

    if (!isValidSession) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated, redirect from login page to dashboard
  if (pathname === ADMIN_LOGIN_PATH && adminSessionCookie) {
    const isValidSession = verifyAdminSessionCookie(adminSessionCookie);
    if (isValidSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  const response = NextResponse.next();

  const cspDirectives = [
    "default-src 'self'",
    [
      "script-src",
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      "https://www.gstatic.com",
      "https://www.google.com",
      "https://www.googletagmanager.com",
      "https://www.recaptcha.net",
    ].join(" "),
    ["style-src", "'self'", "'unsafe-inline'", "https://fonts.googleapis.com"].join(
      " "
    ),
    ["img-src", "'self'", "data:", "https:"].join(" "),
    ["font-src", "'self'", "data:", "https://fonts.gstatic.com"].join(" "),
    [
      "connect-src",
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "https://www.google-analytics.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://www.recaptcha.net",
      "ws:",
      "wss:",
    ].join(" "),
    [
      "frame-src",
      "'self'",
      "https://www.google.com",
      "https://recaptcha.google.com",
      "https://www.recaptcha.net",
    ].join(" "),
    [
      "child-src",
      "'self'",
      "https://www.google.com",
      "https://recaptcha.google.com",
      "https://www.recaptcha.net",
    ].join(" "),
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
