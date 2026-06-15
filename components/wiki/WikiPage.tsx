import { cn } from '@/lib/utils'

interface WikiPageProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard content wrapper for wiki pages. Centres content with a comfortable
 * max-width and generous padding so it breathes beside the sidebar instead of
 * sitting flush against it or stretching edge-to-edge on wide screens.
 */
export function WikiPage({ children, className }: WikiPageProps) {
  return <div className={cn('mx-auto max-w-5xl px-5 py-8 sm:px-8', className)}>{children}</div>
}
