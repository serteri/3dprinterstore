import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminToken,
  isAdminTokenValid,
} from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await isAdminTokenValid(token))) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Sliding session window: valid activity refreshes expiry, idle >5 minutes expires.
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: await createAdminToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
