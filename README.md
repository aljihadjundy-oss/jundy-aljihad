# Jundy Aljihad — Keiryuuzaki

Personal website: landing + about/portfolio + blog. Built with Next.js (App
Router), TypeScript, Tailwind CSS v4, Framer Motion, and Lenis for smooth
scroll. Blog content lives in a Cloudflare D1 database behind a small
Cloudflare Worker API, editable from a private `/studio` writing room on the
site itself.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site needs `WORKER_URL` set (see below) to
load the Writing section — without it, `/writing` just renders empty.

## Structure

- `app/` — pages (`/`, `/about`, `/portfolio`, `/portfolio/[slug]`,
  `/writing`, `/writing/[slug]`, `/contact`, `/studio/*`) + `sitemap.ts` /
  `robots.ts`
- `components/` — Nav, Footer, motion primitives (`Reveal`, `GradientBlob`,
  `MagneticButton`, `CustomCursor`, `SmoothScroll`, `CountUp`), `ContactForm`,
  `WritingList`, `StudioPostForm`, `StudioLogoutButton`
- `data/` — `projects.ts`, `experience.ts`, `company.ts` (PT SKD info — edit
  these to update content without touching components)
- `lib/posts.ts` — public post fetching (server-side, hits the Worker API)
- `lib/worker-admin.ts` — authenticated post CRUD used by `/studio`
- `lib/studio-auth.ts` — signs/verifies the `/studio` session cookie
- `proxy.ts` — gates `/studio/*` and `/api/studio/*` behind the session
  cookie (Next.js 16 renamed `middleware.ts` to `proxy.ts`)
- `workers/writing-api/` — the Cloudflare Worker + D1 database (separate
  deploy, see below)

## The writing room (`/studio`)

A password-protected page at `/studio` where posts can be created, edited,
or deleted without touching code — either full articles (Markdown/MDX) or
quick "share" posts that just point at an Instagram or YouTube link.
Writes go through the Next.js server (`/api/studio/*`), which forwards them
to the Worker using a server-only admin token — the token never reaches the
browser.

### One-time setup (Cloudflare, free tier)

```bash
cd workers/writing-api
npm install
npx wrangler login

# Create the D1 database, then paste the returned database_id into wrangler.toml
npx wrangler d1 create keiryuuzaki-writing

# Apply the schema and seed the starter posts
npm run db:migrate:remote
npm run db:seed:remote

# Set the admin token secret (pick any long random string)
npx wrangler secret put ADMIN_TOKEN

# Deploy
npm run deploy
```

`wrangler deploy` prints the Worker's URL
(`https://keiryuuzaki-writing-api.<your-subdomain>.workers.dev`) — that's
your `WORKER_URL`.

### Vercel environment variables

Set these in the Next.js project's Vercel settings (copy `.env.example`):

| Variable | Value |
|---|---|
| `WORKER_URL` | The Worker URL from `wrangler deploy` |
| `WORKER_ADMIN_TOKEN` | Same value you set with `wrangler secret put ADMIN_TOKEN` |
| `STUDIO_PASSWORD` | Password to log into `/studio` |
| `SESSION_SECRET` | Any long random string (signs the session cookie) |

Once deployed, log in at `https://<your-site>/studio`.

### Local development against the Worker

```bash
# terminal 1 — run the Worker locally
cd workers/writing-api
npm run db:migrate:local
npm run db:seed:local
npx wrangler dev

# terminal 2 — run the Next.js app with a matching .env.local
# (see .env.example; point WORKER_URL at http://localhost:8787)
npm run dev
```

## Deploy

Next.js app → Vercel (import the repo, set the env vars above, no other
config needed). Worker + D1 → Cloudflare, via the steps above — both have
generous free tiers.
