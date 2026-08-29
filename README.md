# Jundy Aljihad — Keiryuuzaki

Personal website: landing + about/portfolio + blog. Built with Next.js (App
Router), TypeScript, Tailwind CSS v4, Framer Motion, and Lenis for smooth
scroll.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `app/` — pages (`/`, `/about`, `/portfolio`, `/portfolio/[slug]`,
  `/writing`, `/writing/[slug]`, `/contact`) + `sitemap.ts`
- `components/` — Nav, Footer, motion primitives (`Reveal`, `GradientBlob`,
  `MagneticButton`, `CustomCursor`, `SmoothScroll`, `CountUp`), `ContactForm`,
  `WritingList`
- `data/` — `projects.ts`, `experience.ts` (edit these to update
  portfolio/experience/awards content without touching components)
- `content/writing/*.mdx` — blog posts (frontmatter: title, excerpt, date,
  category, tags)
- `lib/mdx.ts` — MDX post loading/parsing

## Deploy

Ready for Vercel — just import the repo, no extra config needed.
