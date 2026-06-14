'use client'

import { cn } from '@/lib/utils'
import { useSpoilerPreference } from '@/hooks/useSpoilerPreference'

type Props = {
  level: number
  label?: string
  children: React.ReactNode
}

/**
 * Wraps spoiler content. Content always stays in the DOM (SEO-safe);
 * visibility is controlled by CSS blur + overlay only.
 */
export function SpoilerBlock({ level, label, children }: Props) {
  const { threshold, revealUpTo } = useSpoilerPreference()
  const revealed = level === 0 || threshold >= level

  return (
    <div className="relative my-4 rounded-md border border-border">
      <div
        className={cn('p-4 transition-all duration-200', !revealed && 'select-none blur-md')}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {!revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-card/80 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            {label ? `Spoiler: ${label}` : 'Spoiler'}
          </p>
          <button
            onClick={() => revealUpTo(level)}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Reveal Spoiler
          </button>
        </div>
      )}
    </div>
  )
}
