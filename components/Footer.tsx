import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-white">Jundy Aljihad</p>
          <p className="mt-1 text-sm text-muted">Keiryuuzaki — brand strategist &amp; storyteller.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Site</span>
            <Link href="/about" className="text-white/80 hover:text-white">About</Link>
            <Link href="/portfolio" className="text-white/80 hover:text-white">Portfolio</Link>
            <Link href="/writing" className="text-white/80 hover:text-white">Writing</Link>
            <Link href="/contact" className="text-white/80 hover:text-white">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Connect</span>
            <a href="mailto:aljihadjundy@gmail.com" className="text-white/80 hover:text-white">
              Email
            </a>
            <a
              href="https://instagram.com/jihadjundy"
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/80 hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/80 hover:text-white"
            >
              YouTube
            </a>
            <a
              href="https://lynk.id/jihadjundy"
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/80 hover:text-white"
            >
              lynk.id
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-5xl flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Jundy Aljihad. All stories reserved.</p>
        <p>Designed &amp; built with intent, not templates.</p>
      </div>
    </footer>
  );
}
