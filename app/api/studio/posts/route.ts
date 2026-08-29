import { NextRequest, NextResponse } from "next/server";
import { adminCreatePost, adminListPosts } from "@/lib/worker-admin";

export async function GET() {
  try {
    const posts = await adminListPosts();
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  try {
    const post = await adminCreatePost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
