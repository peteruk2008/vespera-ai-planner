import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!session) { const u = new URL("/login", request.url); u.searchParams.set("next", pathname); return NextResponse.redirect(u); }
    if (session.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if ((pathname.startsWith("/planner") || pathname.startsWith("/dashboard")) && !session) {
    const u = new URL("/login", request.url); u.searchParams.set("next", pathname); return NextResponse.redirect(u);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/planner/:path*", "/dashboard/:path*"] };
