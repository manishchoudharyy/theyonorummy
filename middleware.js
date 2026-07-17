import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/adminAuth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
