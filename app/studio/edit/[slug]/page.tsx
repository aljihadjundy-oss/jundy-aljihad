import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetPost } from "@/lib/worker-admin";
import StudioPostForm from "@/components/StudioPostForm";

export const metadata: Metadata = {
  title: "Edit tulisan",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StudioEditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await adminGetPost(slug);
  if (!post) notFound();

  return (
    <div className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-3xl">
        <Link href="/studio" className="text-sm text-muted hover:text-white">
          ← Writing room
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-white">{post.title}</h1>
        <div className="mt-8">
          <StudioPostForm initialPost={post} />
        </div>
      </div>
    </div>
  );
}
