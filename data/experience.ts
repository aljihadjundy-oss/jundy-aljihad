export type Experience = {
  role: string;
  org: string;
  period: string;
  type?: string;
};

export const experience: Experience[] = [
  { role: "Co-Founder & COO", org: "PT Sinar Kreatif Digitalia", period: "Jan 2026 – sekarang" },
  { role: "Brand Strategist (Contract)", org: "Sinatif Agency", period: "Jan 2025 – Des 2025" },
  { role: "Head of HRD", org: "Sinatif", period: "Jan 2023 – Nov 2025" },
  { role: "Social Media Specialist", org: "PT. Aslah Pure Water", period: "" },
  { role: "Data Entry Assistant (Internship)", org: "PT. Citra Surya Indonesia", period: "Jan – Mar 2025" },
  { role: "Head of Human Resources", org: "UKM Bahasa FLAT UIN Jakarta", period: "Okt 2023 – Okt 2024" },
  { role: "Deputy of Media and Opinion Ministry", org: "FRESH UIN Jakarta", period: "Apr 2023 – Mar 2024" },
  { role: "Videographer", org: "Kejar Mimpi Tangerang Selatan", period: "Agu 2022 – Jan 2024" },
  { role: "Language Ambassador / Local Animator", org: "Ikatan Duta Bahasa Maluku", period: "Agu 2020 – Agu 2021" },
];

export type Award = {
  title: string;
  org: string;
  year: string;
};

export const awards: Award[] = [
  { title: "Juara 1 Creative Video Competition", org: "Islamic Movement Festival, LDK Syahid UIN Jakarta", year: "2023" },
  { title: "The Best Writer", org: "Antologi \"My Favorite Teacher Second Edition\", Omera Pustaka", year: "2021" },
  { title: "One of Writer", org: "Antologi \"Thank You 2020 First Edition\", Omera Pustaka", year: "2021" },
  { title: "Tahfidz 30 Juz", org: "MAN 1 Ambon", year: "2021" },
  { title: "30 Finalis Language Ambassador Maluku", org: "Language Ambassador Maluku", year: "2020" },
  { title: "Video Content Creator", org: "Effion Creator School x Kemenkominfo", year: "2021" },
  { title: "Key Leader Opinion Specialist Speaker", org: "Sinatif", year: "2025" },
  { title: "Speaker Webinar Personal Branding", org: "Sinatif x Nebula Project", year: "2025" },
];

export const education = [
  {
    school: "UIN Syarif Hidayatullah Jakarta",
    program: "S1 Komunikasi dan Penyiaran Islam",
    period: "2021 – sekarang",
  },
  {
    school: "MAN 1 Ambon",
    program: "IPA",
    period: "2018 – 2021",
  },
];

export const skills = [
  "Strategic Planning",
  "Story & Scriptwriting",
  "Video Production",
  "Analytics & Evaluation",
  "Design Fundamentals",
  "KOL Development",
  "Public Speaking",
  "Personal Branding",
  "Talent Management",
];
