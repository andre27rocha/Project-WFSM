import Link from 'next/link'
import { siteConfig } from '@/config/site'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          © {currentYear}{' '}
          <span className="text-primary font-medium">{siteConfig.name}</span>
          {' '}— built for the community.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
