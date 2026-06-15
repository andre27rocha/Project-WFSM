import Link from 'next/link'

type Crumb = {
  label: string
  href?: string
}

interface WikiBreadcrumbProps {
  crumbs: Crumb[]
  className?: string
}

export function WikiBreadcrumb({ crumbs, className }: WikiBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-3 flex flex-wrap items-center gap-0 text-xs ${className ?? ''}`}
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && (
            <span className="mx-1.5 select-none text-muted-foreground/40" aria-hidden>
              ›
            </span>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-primary transition-colors hover:underline hover:underline-offset-2"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-muted-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
