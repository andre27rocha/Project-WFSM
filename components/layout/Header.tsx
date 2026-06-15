import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border border-t-[3px] border-t-primary bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
          aria-label={siteConfig.name}
        >
          <span className="text-primary">Vania</span>
          <span className="text-foreground">Codex</span>
        </Link>

        <nav aria-label="Main navigation">
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
      </div>
    </header>
  )
}
