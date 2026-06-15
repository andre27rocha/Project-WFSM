'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSpoilerPreference } from '@/hooks/useSpoilerPreference'
import type { Achievement } from '@/types'

interface Props {
  achievements: Achievement[]
  gameSlug: string
  initialCompleted: string[]
}

function storageKey(gameSlug: string) {
  return `achievement-progress-${gameSlug}`
}

export function AchievementTracker({ achievements, gameSlug, initialCompleted }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialCompleted))
  const [copied, setCopied] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const { threshold } = useSpoilerPreference()
  const key = storageKey(gameSlug)

  // Merge URL-provided initial state with persisted localStorage state on mount.
  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = stored.split(',').filter(Boolean)
      setCompleted((prev) => new Set([...prev, ...parsed]))
    }
  }, [key])

  // Skip the first run so we don't immediately overwrite localStorage before reading it.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (completed.size === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, Array.from(completed).join(','))
    }
  }, [completed, key])

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    setCompleted(new Set())
    localStorage.removeItem(key)
    setResetConfirm(false)
  }, [resetConfirm, key])

  const handleCopyLink = useCallback(async () => {
    const ids = Array.from(completed).join(',')
    const url =
      window.location.origin +
      window.location.pathname +
      (ids ? `?done=${ids}` : '')
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [completed])

  const total = achievements.length
  const completedCount = achievements.filter((a) => completed.has(a.id)).length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // Group by category; fall back to "General" when null.
  const categories = Array.from(new Set(achievements.map((a) => a.category ?? 'General')))
  const grouped = Object.fromEntries(
    categories.map((cat) => [
      cat,
      achievements.filter((a) => (a.category ?? 'General') === cat),
    ])
  )

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="rounded-lg border border-wiki-border bg-[#1a1a2e] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">{completedCount}</span>
            <span className="ml-1 text-sm text-muted-foreground">/ {total} achievements</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="rounded border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:border-primary hover:bg-primary/10"
        >
          {copied ? 'Link copied!' : 'Copy progress link'}
        </button>
        <button
          onClick={handleReset}
          onBlur={() => setResetConfirm(false)}
          className={cn(
            'rounded border px-3 py-1.5 text-sm transition-colors',
            resetConfirm
              ? 'border-red-500 text-red-400 hover:bg-red-500/10'
              : 'border-wiki-border text-muted-foreground hover:border-red-500/40 hover:text-red-400'
          )}
        >
          {resetConfirm ? 'Click again to confirm reset' : 'Reset progress'}
        </button>
      </div>

      {/* Achievement list, grouped by category */}
      {categories.map((cat) => (
        <div key={cat}>
          {categories.length > 1 && (
            <h2 className="mb-2 border-b border-primary/30 pb-1 text-sm font-semibold uppercase tracking-wide text-primary/80">
              {cat}
            </h2>
          )}
          <ul className="space-y-2">
            {grouped[cat]?.map((achievement) => {
              const isDone = completed.has(achievement.id)
              const revealed =
                achievement.spoilerLevel === 0 || threshold >= achievement.spoilerLevel

              return (
                <li
                  key={achievement.id}
                  className={cn(
                    'flex items-start gap-3 rounded border px-4 py-3 transition-colors',
                    isDone
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-wiki-border bg-[#1a1a2e]/40'
                  )}
                >
                  {/* Checkbox */}
                  <button
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark ${revealed ? achievement.name : 'spoiler achievement'} as ${isDone ? 'incomplete' : 'complete'}`}
                    onClick={() => toggle(achievement.id)}
                    className={cn(
                      'mt-0.5 h-5 w-5 shrink-0 rounded border-2 transition-colors',
                      isDone
                        ? 'border-primary bg-primary text-background'
                        : 'border-muted-foreground/40 hover:border-primary/60'
                    )}
                  >
                    {isDone && (
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="h-full w-full p-0.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Content — always in DOM (SEO-safe), blurred when spoiler unrevealed */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        'transition-all duration-200',
                        !revealed && 'select-none blur-sm'
                      )}
                      aria-hidden={!revealed}
                    >
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isDone ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {achievement.name}
                      </p>
                      {achievement.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      )}
                      {achievement.howToUnlock && (
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          <span className="text-primary/60">How to unlock:</span>{' '}
                          {achievement.howToUnlock}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points badge */}
                  {achievement.points > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground/60">
                      {achievement.points}G
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
