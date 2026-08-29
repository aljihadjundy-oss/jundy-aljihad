import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import { awards, education, skills } from "@/data/experience";

export const metadata: Metadata = {
  title: "About",
  description:
    "Jundy Aljihad (Keiryuuzaki) — mahasiswa Ilmu Komunikasi & brand strategist. Proses kerja, skill, dan penghargaan.",
};

const process = [
  {
    step: "01",
    title: "Verify",
    desc: "Gali dulu sebelum eksekusi — riset audiens, konteks brand, dan data yang ada. Gak asal ikut tren.",
  },
  {
    step: "02",
    title: "Prototype & Revise",
    desc: "Bangun versi kasar, tes ke lapangan, revisi cepat berdasarkan respons nyata — bukan asumsi di ruang meeting.",
  },
  {
    step: "03",
    title: "Reflect",
    desc: "Evaluasi performa dengan KPI yang jelas, tarik pelajaran, dan bawa ke iterasi berikutnya.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-20 pt-32">
        <GradientBlob colors={["#0EA5E9", "#6366F1", "#8B5CF6"]} className="opacity-50" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">About</span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Jundy Aljihad, a.k.a. Keiryuuzaki.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <p>
                Gue mahasiswa S1 Komunikasi dan Penyiaran Islam di UIN Syarif
                Hidayatullah Jakarta (2021–sekarang). Asalnya dari Ambon,
                Maluku — sempat sekolah di MAN 1 Ambon jurusan IPA (2018–2021)
                sebelum pindah ke Jakarta buat kuliah.
              </p>
              <p>
                Kerjaan gue muter di sekitar content strategy &amp; editorial
                systems, kampanye berbasis narasi, produksi video, evaluasi
                performa konten (KPI/audit), dan kepemimpinan kreatif. Intinya:
                gue suka bangun identitas yang bukan cuma keliatan bagus, tapi
                juga nempel di kepala orang.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">
              How I work
            </span>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Verify → Prototype &amp; Revise → Reflect
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.1}>
                <div className="glass h-full rounded-3xl p-8">
                  <span className="font-display text-sm text-muted">{p.step}</span>
                  <h3 className="font-display mt-3 text-xl font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">
              Skills &amp; tools
            </span>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Toolkit gue
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="glass rounded-full px-5 py-2.5 text-sm text-white/90"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Education */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">Education</span>
          </Reveal>
          <div className="mt-8 space-y-6">
            {education.map((edu, i) => (
              <Reveal key={edu.school} delay={i * 0.1}>
                <div className="flex flex-col justify-between gap-1 border-b border-white/10 pb-6 sm:flex-row sm:items-baseline">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {edu.school}
                    </h3>
                    <p className="text-sm text-muted">{edu.program}</p>
                  </div>
                  <span className="text-sm text-muted">{edu.period}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">
              Awards &amp; certifications
            </span>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Beberapa pencapaian
            </h2>
          </Reveal>

          <div className="relative mt-12 space-y-0 border-l border-white/10 pl-8">
            {awards.map((award, i) => (
              <Reveal key={award.title} delay={i * 0.06}>
                <div className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[2.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-400 to-orange-400" />
                  <span className="text-xs uppercase tracking-widest text-muted">
                    {award.year}
                  </span>
                  <h3 className="font-display mt-1 text-lg font-semibold text-white">
                    {award.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{award.org}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
