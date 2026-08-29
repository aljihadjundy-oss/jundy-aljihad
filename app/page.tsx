import Link from "next/link";
import { GradientBlob } from "@/components/GradientBlob";
import Reveal from "@/components/Reveal";
import MagneticButton from "@/components/MagneticButton";
import CountUp from "@/components/CountUp";
import { projects } from "@/data/projects";
import { businessUnits, company } from "@/data/company";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-24">
        <GradientBlob colors={["#7C3AED", "#DB2777", "#F97316"]} />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs uppercase tracking-widest text-muted">
              Keiryuuzaki — Brand Strategist &amp; Storyteller
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display mt-8 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              I design digital identities that{" "}
              <span className="text-gradient">don&apos;t just get noticed</span>{" "}
              — they stick.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted sm:text-xl">
              Mahasiswa Ilmu Komunikasi &amp; brand strategist yang membangun
              identitas digital lewat content strategy, kampanye berbasis
              narasi, dan produksi video. Kerja di persimpangan storytelling,
              strategi, dan produksi kreatif.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href="/about">About me</MagneticButton>
              <MagneticButton href="/portfolio" variant="ghost">
                See the portfolio
              </MagneticButton>
              <MagneticButton href="/writing" variant="ghost">
                Read Keiryuuzaki Notes
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-t border-white/10 px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: 4, suffix: "+", label: "Active projects & initiatives" },
            { value: 3, suffix: "yr", label: "Building Inframe Storytelling" },
            { value: 8, suffix: "+", label: "Awards & recognitions" },
            { value: 9, suffix: "+", label: "Core skills in the toolkit" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="text-center sm:text-left">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-display block text-4xl font-bold text-white sm:text-5xl"
                />
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Current projects highlight */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted">
                  Currently building
                </span>
                <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Beberapa hal yang lagi jalan
                </h2>
              </div>
              <Link
                href="/portfolio"
                data-cursor-hover
                className="hidden shrink-0 text-sm text-muted hover:text-white sm:block"
              >
                Lihat semua →
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.08}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  data-cursor-hover
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 p-8 transition-transform duration-500 ease-out hover:-translate-y-1"
                >
                  <div
                    className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${project.accent.from}, ${project.accent.to})`,
                    }}
                  />
                  <div className="relative">
                    <span className="text-xs uppercase tracking-widest text-muted">
                      {project.role}
                    </span>
                    <h3 className="font-display mt-3 text-2xl font-bold text-white">
                      {project.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {project.tagline}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link href="/portfolio" className="text-sm text-muted hover:text-white">
              Lihat semua →
            </Link>
          </div>

          {/* PT SKD business units */}
          <div className="mt-20">
            <Reveal>
              <span className="text-xs uppercase tracking-widest text-muted">
                Co-Founder &amp; COO
              </span>
              <h3 className="font-display mt-3 text-2xl font-bold text-white sm:text-3xl">
                Unit bisnis {company.shortName}
              </h3>
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businessUnits.map((unit, i) => (
                <Reveal key={unit.name} delay={i * 0.06}>
                  <a
                    href={unit.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor-hover
                    className="group block h-full rounded-2xl border border-white/10 p-6 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-base font-semibold text-white">
                        {unit.name}
                      </h4>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                          unit.status === "active"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-amber-400/15 text-amber-300"
                        }`}
                      >
                        {unit.status === "active" ? "Active" : "Building"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                      {unit.role}
                    </p>
                  </a>
                </Reveal>
              ))}
            </div>

            <div className="mt-6">
              <Link href="/about#skd" className="text-sm text-muted hover:text-white">
                Selengkapnya soal PT SKD →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t border-white/10 px-6 py-24">
        <GradientBlob colors={["#06B6D4", "#3B82F6", "#7C3AED"]} className="opacity-60" />
        <Reveal className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Punya cerita yang layak dibangun jadi identitas?
          </h2>
          <p className="mt-4 text-muted">
            Let&apos;s talk — dari strategi konten sampai eksekusi produksi.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <MagneticButton href="/contact">Get in touch</MagneticButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
