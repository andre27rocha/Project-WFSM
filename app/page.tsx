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
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          <span className="text-primary">Vania</span>
          <span className="text-foreground">Codex</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{siteConfig.description}</p>
      </div>

      {games.length === 0 ? (
        <p className="text-center text-muted-foreground">No games published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
            >
              {game.coverImageUrl ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={game.coverImageUrl}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
              ) : (
                <div className="h-48 w-full bg-surface" />
              )}
              <div className="p-5">
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {game.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {game.developer ?? ''}
                  {game.developer && game.releaseYear ? ' · ' : ''}
                  {game.releaseYear ?? ''}
                </p>
                {game.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {game.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
