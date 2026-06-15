import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border border-t-[3px] border-t-primary bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
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
                  className="rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
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
            className="h-8 w-36 rounded border border-border bg-background/40 px-3 pr-7 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 lg:w-48"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-primary"
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
