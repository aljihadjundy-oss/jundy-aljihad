import type { Metadata } from "next";
import Link from "next/link";
import { adminListPosts } from "@/lib/worker-admin";
import StudioLogoutButton from "@/components/StudioLogoutButton";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StudioDashboard() {
  const posts = await adminListPosts().catch(() => []);

  return (
    <div className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted">Writing room</span>
            <h1 className="font-display mt-2 text-3xl font-bold text-white">
              Tulisan kamu
            </h1>
          </div>
          <StudioLogoutButton />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted">{posts.length} post</p>
          <Link
            href="/studio/new"
            data-cursor-hover
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:scale-[1.02]"
          >
            + Tulisan baru
          </Link>
        </div>

        <div className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/studio/edit/${post.slug}`}
              data-cursor-hover
              className="flex items-center justify-between gap-4 py-5 hover:bg-white/[0.02]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-white">
                    {post.title}
                  </h2>
                  {!post.published && (
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-amber-300">
                      Draft
                    </span>
                  )}
                  {post.postType === "link" && (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-white/70">
                      Link
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {post.category} · {post.date}
                </p>
              </div>
              <span className="text-sm text-muted">Edit →</span>
            </Link>
          ))}

          {posts.length === 0 && (
            <p className="py-8 text-sm text-muted">Belum ada tulisan. Mulai yang pertama.</p>
          )}
        </div>
      </div>
    </div>
  );
}
