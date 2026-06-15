'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export type CommentRow = {
  id: string
  authorName: string
  content: string
  upvotes: number
  createdAt: string
}

interface Props {
  comments: CommentRow[]
  gameId: string
  entityType: 'boss' | 'npc' | 'item' | 'area'
  entityId: string
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const LS_KEY = (id: string) => `vc:upvote:${id}`

export function Comments({ comments, gameId, entityType, entityId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set())
  const [localUpvotes, setLocalUpvotes] = useState<Record<string, number>>({})
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Read localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const voted = new Set(
      comments
        .filter((c) => {
          try {
            return localStorage.getItem(LS_KEY(c.id)) === '1'
          } catch {
            return false
          }
        })
        .map((c) => c.id),
    )
    setUpvotedIds(voted)
  }, [comments])

  async function handleUpvote(commentId: string) {
    if (upvotedIds.has(commentId)) return
    try {
      const res = await fetch(`/api/comments/${commentId}/upvote`, { method: 'POST' })
      if (!res.ok) return
      try {
        localStorage.setItem(LS_KEY(commentId), '1')
      } catch {
        // ignore
      }
      setUpvotedIds((prev) => new Set([...prev, commentId]))
      setLocalUpvotes((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? 0) + 1 }))
    } catch {
      // network error — ignore silently
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (trimmed.length < 5) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          entityType,
          entityId,
          authorName: authorName.trim() || undefined,
          content: trimmed,
        }),
      })

      if (!res.ok) {
        setSubmitError('Failed to post. Please try again.')
        return
      }

      setAuthorName('')
      setContent('')
      startTransition(() => {
        router.refresh()
      })
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-label="Community notes" className="mt-8 border-t border-border pt-6">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Community Notes{comments.length > 0 ? ` · ${comments.length}` : ''}
      </h2>

      {/* Submit form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-md border border-border bg-card p-4"
      >
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={80}
          placeholder="Name (optional — defaults to Anonymous)"
          className="mb-3 h-9 w-full rounded border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={5}
          maxLength={2000}
          placeholder="Share a tip, strategy, or lore note…"
          rows={3}
          className="mb-3 w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {submitError && <p className="mb-2 text-xs text-red-400">{submitError}</p>}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">{content.length}/2000</span>
          <button
            type="submit"
            disabled={submitting || content.trim().length < 5}
            className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Post Note'}
          </button>
        </div>
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet. Be the first!</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const voted = upvotedIds.has(comment.id)
            const displayUpvotes = comment.upvotes + (localUpvotes[comment.id] ?? 0)
            return (
              <li key={comment.id} className="rounded border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  {/* Upvote */}
                  <button
                    type="button"
                    onClick={() => handleUpvote(comment.id)}
                    disabled={voted}
                    aria-label={voted ? 'Already upvoted' : 'Upvote this note'}
                    className={`mt-0.5 flex min-w-[32px] flex-col items-center gap-0.5 rounded px-1.5 py-1 text-xs transition-colors ${
                      voted
                        ? 'cursor-default text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <span aria-hidden>▲</span>
                    <span className="font-mono leading-none">{displayUpvotes}</span>
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-foreground">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50">·</span>
                      <time
                        dateTime={comment.createdAt}
                        className="text-[11px] text-muted-foreground/60"
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
