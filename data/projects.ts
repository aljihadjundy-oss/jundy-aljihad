export type Project = {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  description: string;
  longDescription: string;
  since?: string;
  collaborators?: string[];
  accent: {
    from: string;
    via: string;
    to: string;
  };
};

export const projects: Project[] = [
  {
    slug: "keyratify",
    name: "Keyratify",
    role: "Founder / Creative Lead",
    tagline: "We design content systems that Connect, Convert.",
    description:
      "Creative platform yang membangun sistem konten — bukan konten satu-satuan yang habis sekali post.",
    longDescription:
      "Keyratify adalah creative platform tempat gue merancang content system: dari strategi editorial, funnel narasi, sampai eksekusi produksi. Fokusnya bukan bikin konten yang rame sesaat, tapi sistem yang bikin audiens connect dulu, baru convert. Semua project di bawah Keyratify dibangun di atas satu prinsip yang sama — konten itu infrastruktur, bukan konfeti.",
    accent: { from: "#7C3AED", via: "#DB2777", to: "#F97316" },
  },
  {
    slug: "inframe-storytelling",
    name: "Inframe Storytelling",
    role: "Narrative Lab & Production Practice",
    tagline: "Visual storytelling untuk brand & kreator yang punya cerita layak diceritain dengan benar.",
    description:
      "Narrative lab & production practice sejak 2022 — film, dokumenter, dan branded content untuk brand dan kreator.",
    longDescription:
      "Inframe Storytelling adalah ruang eksperimen naratif dan praktik produksi yang gue jalankan sejak 2022. Di sini gue mengerjakan film pendek, dokumenter, dan branded content bareng berbagai organisasi dan komunitas — mulai dari isu sosial, pendidikan, sampai UMKM. Setiap project diperlakukan sebagai cerita yang harus digali dulu sebelum difilmkan, bukan sekadar dieksekusi.",
    since: "2022",
    collaborators: [
      "Initiative of Change Indonesia",
      "LAZIS UIN Jakarta",
      "Mahardika Muda",
      "UMKMsiniaja",
      "Duta Inspirasi Indonesia (Inspiring Leader Camp Batch 1-3)",
      "KKN Askara Harsa UIN Jakarta",
      "PT. Media Data System",
      "Ponpes Rihabul 'Ilmi",
      "Sidaq.id",
    ],
    accent: { from: "#0EA5E9", via: "#6366F1", to: "#8B5CF6" },
  },
  {
    slug: "pondera-box",
    name: "Pondera Box",
    role: "Experimental Initiative",
    tagline: "Data < Drama",
    description: "Homeless media that challenges the mainstream — ruang diskusi bebas tanpa pakem media biasa.",
    longDescription:
      "Pondera Box adalah eksperimen media yang sengaja \"gak punya rumah\" — gak terikat format, gak terikat platform, gak terikat cara media biasa ngomong. Ini ruang buat ngobrolin hal-hal yang biasanya dianggap terlalu drama untuk dibahas serius, atau terlalu serius untuk dibahas santai. Data penting, tapi drama manusia yang bikin cerita nempel.",
    accent: { from: "#F43F5E", via: "#F97316", to: "#EAB308" },
  },
  {
    slug: "nebula-project",
    name: "Nebula Project",
    role: "Initiator",
    tagline: "Because your story matters!",
    description:
      "Startup edukasi self-improvement berbasis Share • Interact • Create.",
    longDescription:
      "Nebula Project adalah startup edukasi yang gue inisiasi untuk ruang self-improvement anak muda — dibangun di atas tiga gerak: Share (cerita & pengalaman), Interact (diskusi & koneksi), Create (karya nyata). Idenya sederhana: setiap orang punya cerita yang berharga, dan Nebula adalah tempat buat cerita itu jadi sesuatu yang lebih dari sekadar caption.",
    accent: { from: "#06B6D4", via: "#3B82F6", to: "#7C3AED" },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
