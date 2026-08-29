import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Reveal from "@/components/Reveal";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="relative px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <Link href="/writing" className="text-sm text-muted hover:text-white">
            ← Writing
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted">
            <span className="glass rounded-full px-3 py-1">{post.category}</span>
            <span>{post.readingTime}</span>
            {post.date && <span>· {post.date}</span>}
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-p:leading-relaxed prose-p:text-white/80 prose-a:text-white">
            <MDXRemote source={post.content} />
          </div>
        </Reveal>

        {post.tags.length > 0 && (
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {post.tags.map((tag) => (
                <span key={tag} className="glass rounded-full px-3 py-1 text-xs text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
