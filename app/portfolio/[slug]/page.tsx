import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import MagneticButton from "@/components/MagneticButton";
import { projects, getProjectBySlug } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <GradientBlob
          colors={[project.accent.from, project.accent.via, project.accent.to]}
          className="opacity-50"
        />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <Link href="/portfolio" className="text-sm text-muted hover:text-white">
              ← Portfolio
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <span className="mt-6 block text-xs uppercase tracking-widest text-muted">
              {project.role}
              {project.since ? ` · sejak ${project.since}` : ""}
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              {project.name}
            </h1>
            <p className="font-display mt-4 text-xl italic text-white/70">
              &ldquo;{project.tagline}&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted">
              {project.longDescription}
            </p>
          </Reveal>

          {project.collaborators && project.collaborators.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-14">
                <span className="text-xs uppercase tracking-widest text-muted">
                  Kolaborator &amp; klien
                </span>
                <div className="mt-5 flex flex-wrap gap-3">
                  {project.collaborators.map((c) => (
                    <span
                      key={c}
                      className="glass rounded-full px-4 py-2 text-sm text-white/85"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <div className="mt-16">
              <MagneticButton href="/contact">Diskusi project bareng</MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">
              Proyek lainnya
            </span>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  href={`/portfolio/${p.slug}`}
                  data-cursor-hover
                  className="group block rounded-2xl border border-white/10 p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="font-display text-lg font-semibold text-white">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{p.role}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
