import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export default async function HomePage() {
  const games = await getPublishedGames()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Site identity — compact strip, not a hero */}
      <div className="mb-6 border-b border-wiki-border pb-4">
        <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
      </div>

      {/* Games directory */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Games
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
                <div className="h-14 w-20 shrink-0 rounded bg-surface" />
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
    </div>
  )
}
