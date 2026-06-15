import Link from 'next/link'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'
import { getFeaturedBoss, getRecentlyAdded } from '@/lib/supabase/queries/homepage'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/wiki/SectionHeader'
import { WikiImage } from '@/components/wiki/WikiImage'
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
    <div className="flex">
      <Sidebar />
      <div className="bg-wiki-content min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          {/* Hero — page identity + prominent search */}
          <header className="border-wiki-border mb-10 border-b pb-7">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="text-primary">Vania</span>
              <span className="text-foreground">Codex</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
              {siteConfig.description}
            </p>

            <form action="/search" method="get" className="relative mt-6 max-w-xl">
              <input
                name="q"
                type="search"
                placeholder="Search bosses, items, NPCs, areas…"
                autoComplete="off"
                aria-label="Search the wiki"
                className="border-wiki-border bg-surface text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-primary/30 h-11 w-full rounded border px-4 pr-11 text-sm focus:ring-1 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="text-muted-foreground/50 hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
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
                  className="group border-wiki-border bg-surface hover:border-primary/40 block overflow-hidden rounded border transition-colors"
                >
                  <div className="relative h-56 w-full sm:h-64">
                    <WikiImage
                      src={featured.imageUrl}
                      alt={featured.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 640px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <span className="mb-1.5 inline-block rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-red-300 uppercase">
                        Boss
                      </span>
                      <p className="text-xl leading-tight font-bold text-white">{featured.name}</p>
                      <p className="mt-0.5 text-xs text-white/60">{featured.game.name}</p>
                    </div>
                  </div>
                  {featured.description && (
                    <p className="border-wiki-border text-muted-foreground line-clamp-3 border-t px-5 py-4 text-sm leading-relaxed">
                      {featured.description}
                    </p>
                  )}
                  <div className="border-wiki-border border-t px-5 py-3">
                    <span className="text-primary text-xs font-semibold group-hover:underline">
                      Read more →
                    </span>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground text-sm">No featured content yet.</p>
              )}
            </section>

            {/* Recently Added */}
            <section>
              <SectionHeader>Recently Added</SectionHeader>
              {recentlyAdded.length > 0 ? (
                <>
                  <div className="divide-wiki-border border-wiki-border bg-surface/30 divide-y rounded border">
                    {recentlyAdded.map((entry) => (
                      <Link
                        key={entry.id}
                        href={entry.href}
                        className="group hover:bg-surface/60 flex items-center gap-2.5 px-3 py-3 transition-colors"
                      >
                        <span
                          className={cn(
                            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                            kindBadge[entry.kind] ?? 'bg-surface text-muted-foreground'
                          )}
                        >
                          {entry.label}
                        </span>
                        <span className="text-foreground group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors">
                          {entry.name}
                        </span>
                        <span className="text-muted-foreground/60 shrink-0 text-[10px] tabular-nums">
                          {timeAgo(entry.createdAt)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/search"
                    className="text-primary mt-3 block text-right text-xs font-medium hover:underline"
                  >
                    See all →
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No content yet.</p>
              )}
            </section>
          </div>

          {/* Explore by Game */}
          <section>
            <SectionHeader>Explore by Game</SectionHeader>
            {games.length === 0 ? (
              <p className="text-muted-foreground text-sm">No games published yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/${game.slug}`}
                    className="group border-wiki-border bg-wiki-card hover:border-primary/40 flex gap-4 rounded border p-4 transition-colors"
                  >
                    <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded">
                      <WikiImage
                        src={game.coverImageUrl}
                        alt={game.name}
                        fill
                        className="object-cover"
                        sizes="108px"
                        compact
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-foreground group-hover:text-primary font-semibold transition-colors">
                        {game.name}
                      </span>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {[game.developer, game.releaseYear?.toString()].filter(Boolean).join(' · ')}
                      </p>
                      {game.description && (
                        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
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
      </div>
    </div>
  )
}
