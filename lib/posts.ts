export type PostType = "article" | "link";
export type ExternalPlatform = "instagram" | "youtube" | null;

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  postType: PostType;
  externalUrl: string | null;
  externalPlatform: ExternalPlatform;
  published: boolean;
  date: string;
  updatedAt: string;
};

export const categories = [
  "Quick Capture",
  "Curhatan",
  "New Article",
  "Keiryuuzaki",
  "Komuniaktor",
  "Topics",
] as const;

function workerUrl(): string {
  const url = process.env.WORKER_URL;
  if (!url) {
    throw new Error(
      "WORKER_URL is not set. Deploy the Cloudflare Worker in workers/writing-api and set WORKER_URL in your environment."
    );
  }
  return url.replace(/\/$/, "");
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export async function getAllPosts(): Promise<(Post & { readingTime: string })[]> {
  try {
    const res = await fetch(`${workerUrl()}/api/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const posts = (await res.json()) as Post[];
    return posts.map((p) => ({ ...p, readingTime: readingTime(p.content) }));
  } catch {
    return [];
  }
}

export async function getPostBySlug(
  slug: string
): Promise<(Post & { readingTime: string }) | null> {
  try {
    const res = await fetch(`${workerUrl()}/api/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const post = (await res.json()) as Post;
    return { ...post, readingTime: readingTime(post.content) };
  } catch {
    return null;
  }
}
