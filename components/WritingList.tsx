"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { PostMeta } from "@/lib/mdx";

export default function WritingList({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            data-cursor-hover
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              active === cat
                ? "bg-white text-black"
                : "glass text-muted hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {filtered.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.06}>
            <Link
              href={`/writing/${post.slug}`}
              data-cursor-hover
              className="group block h-full rounded-3xl border border-white/10 p-7 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="glass rounded-full px-3 py-1">{post.category}</span>
                <span>{post.readingTime}</span>
              </div>
              <h3 className="font-display mt-4 text-xl font-bold text-white">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-white/80">
                Baca
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </Reveal>
        ))}

        {filtered.length === 0 && (
          <p className="text-muted">Belum ada tulisan di kategori ini.</p>
        )}
      </div>
    </div>
  );
}
