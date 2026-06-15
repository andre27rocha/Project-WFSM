import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="border-wiki-border border-t-primary bg-card sticky top-0 z-50 border-t-[3px] border-b shadow-sm shadow-black/20">
      <div className="flex h-12 items-center justify-between gap-4 px-4 sm:px-5">
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold tracking-tight"
          aria-label={siteConfig.name}
        >
          <span className="text-primary">Vania</span>
          <span className="text-foreground">Codex</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.main.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:bg-accent/10 hover:text-foreground rounded px-3 py-2 text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Inline search — plain HTML form, no JS required */}
        <form action="/search" method="get" className="relative hidden sm:block">
          <input
            name="q"
            type="search"
            placeholder="Search…"
            autoComplete="off"
            aria-label="Search the wiki"
            className="border-border bg-background/40 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/30 h-8 w-36 rounded border px-3 pr-7 text-xs focus:ring-1 focus:outline-none lg:w-48"
          />
          <button
            type="submit"
            className="text-muted-foreground/50 hover:text-primary absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
            aria-label="Submit search"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  )
}
