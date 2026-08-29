import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Keyratify, Inframe Storytelling, Pondera Box, Nebula Project — proyek dan inisiatif yang dibangun Jundy Aljihad.",
};

export default function PortfolioPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <GradientBlob colors={["#F43F5E", "#F97316", "#EAB308"]} className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">Portfolio</span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Satu brand, empat ekspresi berbeda.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Setiap proyek punya karakter visual dan tujuan sendiri, tapi
              semuanya jalan di atas prinsip yang sama: strategi yang jelas,
              narasi yang jujur, produksi yang niat.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <Link
                href={`/portfolio/${project.slug}`}
                data-cursor-hover
                className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 p-8 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01]"
              >
                <div
                  className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${project.accent.from}, ${project.accent.via}, ${project.accent.to})`,
                  }}
                />
                <div className="relative flex h-full flex-col">
                  <span className="text-xs uppercase tracking-widest text-muted">
                    {project.role}
                    {project.since ? ` · sejak ${project.since}` : ""}
                  </span>
                  <h2 className="font-display mt-3 text-3xl font-bold text-white">
                    {project.name}
                  </h2>
                  <p className="font-display mt-2 text-sm italic text-white/70">
                    &ldquo;{project.tagline}&rdquo;
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm text-white/80">
                    Lihat detail
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Experience timeline */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">Experience</span>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Perjalanan kerja &amp; organisasi
            </h2>
          </Reveal>

          <div className="mt-12 space-y-0">
            {experience.map((exp, i) => (
              <Reveal key={`${exp.role}-${exp.org}`} delay={i * 0.05}>
                <div className="flex flex-col gap-1 border-b border-white/10 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-muted">{exp.org}</p>
                  </div>
                  {exp.period && (
                    <span className="text-sm text-muted sm:shrink-0">{exp.period}</span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
