import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "Product Digital",
  description:
    "Produk digital Jundy Aljihad (Keiryuuzaki) — template, panduan, dan resource yang bisa langsung dipakai, tersedia di lynk.id.",
};

const LYNK_URL = "https://lynk.id/jihadjundy";

export default function ProductsPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <GradientBlob colors={["#F97316", "#DB2777", "#7C3AED"]} className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-muted">
              Product Digital
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Hasil kerja gue, dikemas biar bisa lu pakai langsung.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Dari template, panduan, sampai resource yang gue pakai sendiri
              buat kerja di content strategy dan brand building — semuanya
              gue rapiin jadi produk digital yang bisa lu beli dan pakai
              langsung, bukan sekadar teori.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10">
              <MagneticButton href={LYNK_URL}>Lihat semua di lynk.id</MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-muted">
              Daftar lengkap produk (nama, harga, dan link masing-masing) lagi
              disiapin di sini. Sementara itu, semua produk gue udah bisa
              diakses langsung lewat lynk.id.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
