import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminSession = Boolean(request.cookies.get("admin_session"));
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === ADMIN_LOGIN_PATH;

  if (isAdminRoute && !isAuthRoute && !hasAdminSession) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasAdminSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
  );
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
