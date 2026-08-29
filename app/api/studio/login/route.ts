import { NextRequest, NextResponse } from "next/server";
import { STUDIO_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/studio-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "STUDIO_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDIO_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
