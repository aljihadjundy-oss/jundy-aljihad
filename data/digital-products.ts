export type DigitalProduct = {
  slug: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  url: string;
};

export const digitalProducts: DigitalProduct[] = [
  {
    slug: "template-portofolio-fresh-graduate",
    name: "Template Portofolio Fresh Graduate",
    price: "Gratis (pay-what-you-want)",
    description:
      "Template portofolio siap edit untuk fresh graduate/career switcher tanpa pengalaman kerja: halaman About Me, Skills & Tools, 3 Project Case Study, testimoni, dan kontak profesional.",
    url: "https://lynk.id/jihadjundy/wng0q69x22qe",
  },
  {
    slug: "personal-branding-kit",
    name: "Personal Branding Kit (E-Book + Slides)",
    price: "Rp25.000",
    originalPrice: "Rp75.000",
    description:
      "E-book \"Personal Branding: From Zero to Voice\" — framework 6 langkah, ME-Framework, template avatar audiens, tone guideline, checklist SEO caption, rubrik penilaian konten, contoh micro-campaign, plus bonus sesi one-on-one.",
    url: "https://lynk.id/jihadjundy/v145mnlvqmjn",
  },
  {
    slug: "identity-based-notion-template",
    name: "Identity-based — Template Notion untuk Membangun Identitas & Kebiasaan",
    price: "Gratis (pay-what-you-want)",
    description:
      "Template Notion untuk merumuskan identitas diri, membangun kebiasaan pendukung, dan refleksi mingguan — tinggal duplicate ke akun Notion sendiri.",
    url: "https://lynk.id/jihadjundy/ee0d5qnz6yp8",
  },
  {
    slug: "content-creators-roadmap",
    name: "Content Creator's Roadmap (50 Halaman PDF)",
    price: "Rp37.000",
    originalPrice: "Rp70.000",
    description:
      "Panduan 6 fase (Foundation → Brand → Content → Growth → Monetization → Scaling) lengkap dengan worksheet niche, template goal setting, content calendar, checklist produksi, toolkit monetisasi, plus bonus sesi one-on-one.",
    url: "https://lynk.id/jihadjundy/ek555ev0v3kv",
  },
  {
    slug: "instagram-copywriting",
    name: "Instagram Copywriting — Seni Merangkai Kata di Dunia Visual",
    price: "Rp29.850",
    originalPrice: "Rp100.000",
    description:
      "E-book & slide deck (50 slide) tentang menulis caption Instagram: struktur Hook-Body-CTA, formula copy (AIDA, PAS, BAB, dll), swipe-file hook, SEO Instagram, rubrik evaluasi copy, plus bonus sesi one-on-one review caption.",
    url: "https://lynk.id/jihadjundy/kdrrrydr9r75",
  },
];
