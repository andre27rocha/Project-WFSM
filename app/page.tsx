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

/** Wiki-style section header: amber bar marker + label + horizontal rule. */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-primary">
      <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
      {children}
      <span className="ml-1 h-px flex-1 bg-wiki-border" aria-hidden="true" />
    </h2>
  )
}

export default async function HomePage() {
  const [games, featured, recentlyAdded] = await Promise.all([
    getPublishedGames(),
    getFeaturedBoss(),
    getRecentlyAdded(8),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero — page identity + prominent search */}
      <header className="mb-10 border-b border-wiki-border pb-7">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-primary">Vania</span>
          <span className="text-foreground">Codex</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {siteConfig.description}
        </p>

        <form action="/search" method="get" className="relative mt-6 max-w-xl">
          <input
            name="q"
            type="search"
            placeholder="Search bosses, items, NPCs, areas…"
            autoComplete="off"
            aria-label="Search the wiki"
            className="h-11 w-full rounded border border-wiki-border bg-surface px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-primary"
          >
            <svg
              width="15"
              height="15"
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
      </header>

      {/* Two-column: Featured + Recently Added */}
      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
        {/* Featured */}
        <section>
          <SectionHeader>Featured</SectionHeader>
          {featured ? (
            <Link
              href={`/${featured.game.slug}/bosses/${featured.slug}`}
              className="group block overflow-hidden rounded border border-wiki-border bg-surface transition-colors hover:border-primary/40"
            >
              {featured.imageUrl ? (
                <div className="relative h-56 w-full sm:h-64">
                  <Image
                    src={featured.imageUrl}
                    alt={featured.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <span className="mb-1.5 inline-block rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                      Boss
                    </span>
                    <p className="text-xl font-bold leading-tight text-white">
                      {featured.name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">{featured.game.name}</p>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <span className="mb-1.5 inline-block rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                    Boss
                  </span>
                  <p className="text-xl font-bold text-foreground">{featured.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{featured.game.name}</p>
                </div>
              )}
              {featured.description && (
                <p className="border-t border-wiki-border px-5 py-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {featured.description}
                </p>
              )}
              <div className="border-t border-wiki-border px-5 py-3">
                <span className="text-xs font-semibold text-primary group-hover:underline">
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
          <SectionHeader>Recently Added</SectionHeader>
          {recentlyAdded.length > 0 ? (
            <>
              <div className="divide-y divide-wiki-border rounded border border-wiki-border bg-surface/30">
                {recentlyAdded.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="group flex items-center gap-2.5 px-3 py-3 transition-colors hover:bg-surface/60"
                  >
                    <span
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        kindBadge[entry.kind] ?? 'bg-surface text-muted-foreground',
                      )}
                    >
                      {entry.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground transition-colors group-hover:text-primary">
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
                className="mt-3 block text-right text-xs font-medium text-primary hover:underline"
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
        <SectionHeader>Explore by Game</SectionHeader>
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/${game.slug}`}
                className="group flex gap-4 rounded border border-wiki-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                {game.coverImageUrl ? (
                  <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded">
                    <Image
                      src={game.coverImageUrl}
                      alt={game.name}
                      fill
                      className="object-cover"
                      sizes="108px"
                    />
                  </div>
                ) : (
                  <div className="h-[72px] w-[108px] shrink-0 rounded bg-wiki-border" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {game.name}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[game.developer, game.releaseYear?.toString()]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {game.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {game.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
