import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import WritingList from "@/components/WritingList";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Keiryuuzaki Notes — tulisan Jundy Aljihad soal strategi, konten, dan cerita di balik proses.",
};

export const revalidate = 60;

export default async function WritingPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-10 pt-32">
        <GradientBlob colors={["#8B5CF6", "#EC4899", "#F97316"]} className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">Writing</span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Keiryuuzaki Notes
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Catatan proses, pemikiran, dan curhatan — bukan cuma hasil akhir
              yang rapi.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <WritingList posts={posts} />
        </div>
      </section>
    </div>
  );
}
