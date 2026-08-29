import { NextRequest, NextResponse } from "next/server";
import { STUDIO_COOKIE, verifySessionToken } from "@/lib/studio-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/studio/login";
  const isLoginApi = pathname === "/api/studio/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(STUDIO_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (!authed) {
    if (pathname.startsWith("/api/studio")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/studio/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
