export type BusinessUnit = {
  name: string;
  role: string;
  description: string;
  instagram: string;
  status: "active" | "building";
};

export const company = {
  legalName: "PT Sinar Kreatif Digitalia",
  shortName: "PT SKD",
  website: "https://sinatifdigitalia.com",
  model:
    "Holding kreatif-digital yang menaungi 7 unit bisnis + 1 fungsi internal — dari agency, event, edukasi, riset kebijakan, sampai pengembangan produk teknologi.",
};

export const businessUnits: BusinessUnit[] = [
  {
    name: "Sinatif Agency",
    role: "Digital Agency",
    description:
      "Jasa kreatif digital — social media management, konten, desain, video, campaign untuk brand, enterprise, dan personal branding. Menaungi sub-brand UMKM Sini Aja untuk segmen UMKM.",
    instagram: "https://www.instagram.com/sinatifagency/",
    status: "active",
  },
  {
    name: "Sinatif Academy",
    role: "Education & Training — Jundy sebagai CEO",
    description:
      "Unit edukasi yang mengubah kapabilitas internal jadi produk pelatihan — melatih talenta yang dipakai unit-unit lain.",
    instagram: "https://www.instagram.com/sinatifacademy/",
    status: "active",
  },
  {
    name: "Osiris Event",
    role: "Event & Experience",
    description: "Event organizing dan event production.",
    instagram: "https://www.instagram.com/osirisevent/",
    status: "active",
  },
  {
    name: "Hexolution",
    role: "Technology & Software — Jundy sebagai CEO",
    description:
      "Lengan teknologi PT SKD — membangun produk dan tools internal, sebagian dikembangkan jadi produk yang dijual keluar.",
    instagram: "https://www.instagram.com/hexolution/",
    status: "building",
  },
  {
    name: "Bedadikit.id",
    role: "Media & Creative Content",
    description: "Brand media dan distribusi konten yang market-facing.",
    instagram: "https://www.instagram.com/bedadikit.id/",
    status: "building",
  },
  {
    name: "UMKM Sini Aja",
    role: "Sub-brand Sinatif Agency",
    description:
      "Lini Sinatif Agency yang menyasar UMKM — paket kreatif dengan skala harga dan scope yang lebih ringan.",
    instagram: "https://www.instagram.com/umkmsiniaja/",
    status: "active",
  },
  {
    name: "Politica Intelligence Lab",
    role: "Political Research Studio",
    description:
      "Research studio yang menganalisis isu dan kebijakan politik sebagai fondasi personal branding untuk klien politikus — berdiri sendiri, bukan sub-unit Sinatif Agency.",
    instagram: "https://www.instagram.com/politicaintelligence/",
    status: "building",
  },
];

export type BuiltTool = {
  name: string;
  under: string;
  description: string;
  status: string;
};

export const builtTools: BuiltTool[] = [
  {
    name: "Skolara",
    under: "Hexolution",
    description:
      "Platform asisten penulisan akademik berbasis AI — bantu mahasiswa nulis skripsi, tesis, dan artikel ilmiah dari referensi sampai draf, lengkap dengan cek compliance dan sesi pendampingan dosen.",
    status: "Live",
  },
  {
    name: "Anitya",
    under: "Hexolution",
    description:
      "SaaS wellness karyawan B2B — dashboard HR agregat dan indeks kesehatan harian karyawan, dibangun dengan privasi (k-anonimitas) sebagai default, bukan tambahan belakangan.",
    status: "In development",
  },
];

export const cooPrinciples = [
  {
    title: "Hasil di atas proses yang terlihat sibuk",
    desc: "Outcome-oriented dalam memimpin — nggak peduli caranya selama hasil memenuhi standar. Nggak micromanage proses.",
  },
  {
    title: "Benci ketidakefektifan & ketidakefisienan",
    desc: "Proses yang boros waktu dan energi tanpa hasil yang sepadan adalah masalah serius yang harus dibenerin, bukan ditoleransi.",
  },
  {
    title: "Logika di atas emosi",
    desc: "Keputusan diambil berdasarkan data dan konteks yang jelas — bukan mood atau tekanan sesaat.",
  },
];
