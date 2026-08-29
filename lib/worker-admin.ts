import type { Post } from "@/lib/posts";

function base(): string {
  const url = process.env.WORKER_URL;
  if (!url) throw new Error("WORKER_URL is not set.");
  return url.replace(/\/$/, "");
}

function token(): string {
  const value = process.env.WORKER_ADMIN_TOKEN;
  if (!value) throw new Error("WORKER_ADMIN_TOKEN is not set.");
  return value;
}

async function call(path: string, init?: RequestInit) {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers || {}),
      authorization: `Bearer ${token()}`,
      "content-type": "application/json",
    },
  });
  return res;
}

export async function adminListPosts(): Promise<Post[]> {
  const res = await call("/api/admin/posts");
  if (!res.ok) throw new Error(`Failed to list posts (${res.status})`);
  return res.json();
}

export async function adminGetPost(slug: string): Promise<Post | null> {
  const res = await call(`/api/admin/posts/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return res.json();
}

export async function adminCreatePost(body: Record<string, unknown>) {
  const res = await call("/api/admin/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create post (${res.status})`);
  }
  return res.json();
}

export async function adminUpdatePost(slug: string, body: Record<string, unknown>) {
  const res = await call(`/api/admin/posts/${slug}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update post (${res.status})`);
  }
  return res.json();
}

export async function adminDeletePost(slug: string) {
  const res = await call(`/api/admin/posts/${slug}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete post (${res.status})`);
  return res.json();
}
