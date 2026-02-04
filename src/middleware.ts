import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  // Define protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Define public routes (login, register, portal)
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");
  const isRegisterRoute = request.nextUrl.pathname.startsWith("/register");
  const isPortalRoute = request.nextUrl.pathname.startsWith("/portal");

  // 1. Protect Dashboard and API routes
  if ((isDashboardRoute || isApiRoute) && !session) {
    // If it's an API route, return 401
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect authenticated users away from login/register
  if ((isLoginRoute || isRegisterRoute) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
