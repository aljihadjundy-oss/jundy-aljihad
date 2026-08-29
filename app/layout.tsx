import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sf",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const siteUrl = "https://jundyaljihad.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jundy Aljihad — Keiryuuzaki",
    template: "%s — Keiryuuzaki",
  },
  description:
    "I design digital identities that don't just get noticed — they stick. Brand strategist & storyteller working across content strategy, narrative campaigns, and video production.",
  openGraph: {
    title: "Jundy Aljihad — Keiryuuzaki",
    description:
      "I design digital identities that don't just get noticed — they stick.",
    url: siteUrl,
    siteName: "Keiryuuzaki",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jundy Aljihad — Keiryuuzaki",
    description:
      "I design digital identities that don't just get noticed — they stick.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SmoothScroll />
        <CustomCursor />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
