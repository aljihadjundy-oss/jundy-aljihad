import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import ContactForm from "@/components/ContactForm";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi Jundy Aljihad (Keiryuuzaki) untuk kolaborasi, project, atau ngobrol soal brand & konten.",
};

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <GradientBlob colors={["#7C3AED", "#EC4899", "#0EA5E9"]} className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">Contact</span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Let&apos;s build something that sticks.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Mau diskusi project, kolaborasi konten, atau sekadar nanya-nanya
              soal strategi brand — gas aja.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
          <Reveal>
            <div className="glass rounded-3xl p-8">
              <h2 className="font-display text-xl font-bold text-white">Kontak langsung</h2>
              <div className="mt-6 space-y-4 text-sm">
                <a
                  href="mailto:aljihadjundy@gmail.com"
                  data-cursor-hover
                  className="flex items-center justify-between border-b border-white/10 pb-4 text-white/85 hover:text-white"
                >
                  Email
                  <span className="text-muted">aljihadjundy@gmail.com</span>
                </a>
                <a
                  href="https://instagram.com/jihadjundy"
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor-hover
                  className="flex items-center justify-between border-b border-white/10 pb-4 text-white/85 hover:text-white"
                >
                  Instagram
                  <span className="text-muted">@jihadjundy</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor-hover
                  className="flex items-center justify-between border-b border-white/10 pb-4 text-white/85 hover:text-white"
                >
                  YouTube
                  <span className="text-muted">Jundy Aljihad | Komuniaktor</span>
                </a>
                <div className="flex items-center justify-between pb-1 text-white/85">
                  Link-in-bio
                  <span className="text-muted">lynk.id</span>
                </div>
              </div>

              <div className="mt-8">
                <MagneticButton href="https://lynk.id/jihadjundy" variant="ghost" className="w-full">
                  Buka lynk.id
                </MagneticButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-8">
              <h2 className="font-display text-xl font-bold text-white">Kirim pesan</h2>
              <p className="mt-2 text-sm text-muted">
                Isi form ini, nanti kebuka email client kamu buat kirim ke gue.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
