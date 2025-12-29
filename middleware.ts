import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Admin auth is handled client-side with localStorage
  // No server-side auth checks needed for admin routes

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
