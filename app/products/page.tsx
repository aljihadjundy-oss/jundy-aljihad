import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { GradientBlob } from "@/components/GradientBlob";
import MagneticButton from "@/components/MagneticButton";
import { digitalProducts } from "@/data/digital-products";

export const metadata: Metadata = {
  title: "Digital Product",
  description:
    "Produk digital Jundy Aljihad (Keiryuuzaki) — template, e-book, dan panduan yang bisa langsung dipakai, tersedia di lynk.id.",
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
              Digital Product
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Hasil kerja gue, dikemas biar bisa lu pakai langsung.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Dari template, e-book, sampai panduan yang gue pakai sendiri
              buat kerja di content strategy dan personal branding — semuanya
              gue rapiin jadi produk digital yang bisa lu beli dan pakai
              langsung, bukan sekadar teori.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10">
              <MagneticButton href={LYNK_URL} variant="ghost">
                Lihat semua di lynk.id
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">
          {digitalProducts.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.06}>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor-hover
                className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 p-7 transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {product.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-white">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-white/80">
                    Beli
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
