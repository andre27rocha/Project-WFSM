import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'
import { getFeaturedBoss, getRecentlyAdded } from '@/lib/supabase/queries/homepage'
import { cn, timeAgo } from '@/lib/utils'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

const kindBadge: Record<string, string> = {
  boss: 'bg-red-900/40 text-red-300',
  item: 'bg-amber-900/40 text-amber-300',
  npc: 'bg-blue-900/40 text-blue-300',
}

export default async function HomePage() {
  const [games, featured, recentlyAdded] = await Promise.all([
    getPublishedGames(),
    getFeaturedBoss(),
    getRecentlyAdded(8),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Site identity strip */}
      <div className="mb-5 border-b border-wiki-border pb-3">
        <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
      </div>

      {/* Prominent search */}
      <form action="/search" method="get" className="relative mb-8">
        <input
          name="q"
          type="search"
          placeholder="Search bosses, items, NPCs, areas…"
          autoComplete="off"
          aria-label="Search the wiki"
          className="h-10 w-full rounded border border-wiki-border bg-surface px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-primary"
        >
          <svg
            width="14"
            height="14"
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

      {/* Two-column: Featured + Recently Added */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Featured */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Featured
          </h2>
          {featured ? (
            <Link
              href={`/${featured.game.slug}/bosses/${featured.slug}`}
              className="group block overflow-hidden rounded border border-wiki-border bg-surface transition-colors hover:border-primary/40"
            >
              {featured.imageUrl ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={featured.imageUrl}
                    alt={featured.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="mb-1 inline-block rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                      Boss
                    </span>
                    <p className="text-lg font-semibold leading-tight text-white">
                      {featured.name}
                    </p>
                    <p className="text-xs text-white/60">{featured.game.name}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <span className="mb-1 inline-block rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                    Boss
                  </span>
                  <p className="font-semibold text-foreground">{featured.name}</p>
                  <p className="text-xs text-muted-foreground">{featured.game.name}</p>
                </div>
              )}
              {featured.description && (
                <p className="border-t border-wiki-border px-4 py-3 text-sm text-muted-foreground line-clamp-3">
                  {featured.description}
                </p>
              )}
              <div className="border-t border-wiki-border px-4 py-2.5">
                <span className="text-xs font-medium text-primary group-hover:underline">
                  Read more →
                </span>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No featured content yet.</p>
          )}
        </section>

        {/* Recently Added */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recently Added
          </h2>
          {recentlyAdded.length > 0 ? (
            <>
              <div className="divide-y divide-wiki-border rounded border border-wiki-border">
                {recentlyAdded.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-surface/60"
                  >
                    <span
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        kindBadge[entry.kind] ?? 'bg-surface text-muted-foreground',
                      )}
                    >
                      {entry.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {entry.name}
                    </span>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/60">
                      {timeAgo(entry.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/search"
                className="mt-2 block text-right text-xs text-primary hover:underline"
              >
                See all →
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No content yet.</p>
          )}
        </section>
      </div>

      {/* Explore by Game */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explore by Game
        </h2>
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games published yet.</p>
        ) : (
          <div className="divide-y divide-wiki-border rounded border border-wiki-border">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/${game.slug}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface/40"
              >
                {game.coverImageUrl ? (
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
                    <Image
                      src={game.coverImageUrl}
                      alt={game.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded bg-wiki-border" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{game.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {[game.developer, game.releaseYear?.toString()]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {game.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {game.description}
                    </p>
                  )}
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
