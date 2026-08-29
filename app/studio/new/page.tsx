import type { Metadata } from "next";
import Link from "next/link";
import StudioPostForm from "@/components/StudioPostForm";

export const metadata: Metadata = {
  title: "Tulisan baru",
  robots: { index: false, follow: false },
};

export default function StudioNewPostPage() {
  return (
    <div className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-3xl">
        <Link href="/studio" className="text-sm text-muted hover:text-white">
          ← Writing room
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-white">Tulisan baru</h1>
        <div className="mt-8">
          <StudioPostForm />
        </div>
      </div>
    </div>
  );
}
