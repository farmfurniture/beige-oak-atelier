import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Verifies the admin session cookie.
 * Returns true only if the cookie is a valid admin token with the admin flag set.
 * This prevents privilege escalation from other JWT tokens that use the same secret.
 */
async function verifyAdminSessionCookie(cookieValue: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      return false;
    }

    const encodedSecret = new TextEncoder().encode(secret);
    const verified = await jwtVerify(cookieValue, encodedSecret);

    // Ensure the token has the admin flag set to true
    if (verified.payload.admin !== true) {
      return false;
    }

    return true;
  } catch (error) {
    // Token is invalid, expired, or couldn't be verified
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSessionCookie = request.cookies.get("admin_session")?.value;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === ADMIN_LOGIN_PATH;

  // Check if trying to access a protected admin route
  if (isAdminRoute && !isAuthRoute) {
    // Verify the session token
    const isValidSession =
      adminSessionCookie &&
      (await verifyAdminSessionCookie(adminSessionCookie));

    if (!isValidSession) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated, redirect from login page to dashboard
  if (isAuthRoute && adminSessionCookie) {
    const isValidSession = await verifyAdminSessionCookie(adminSessionCookie);
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
