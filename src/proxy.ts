import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session");

  // Define protected routes (Any route that requires a specific client context will be handled in UI or via refined middleware later)
  // For now, protect everything under main app flow
  const isProtected = 
    request.nextUrl.pathname.startsWith("/home") ||
    request.nextUrl.pathname.startsWith("/funnel") || 
    request.nextUrl.pathname.startsWith("/creation") ||
    request.nextUrl.pathname.startsWith("/stats") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/clients");

  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Define public routes (login, register, portal)
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");
  const isRegisterRoute = request.nextUrl.pathname.startsWith("/register");

  // 1. Protect Dashboard and API routes
  if ((isProtected || isApiRoute) && !session) {
    // If it's an API route, return 401
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect authenticated users away from login/register
  if ((isLoginRoute || isRegisterRoute) && session) {
    return NextResponse.redirect(new URL("/clients", request.url));
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
