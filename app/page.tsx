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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.slug}`}
              className="group relative h-64 overflow-hidden rounded-xl border border-wiki-border transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
            >
              {game.coverImageUrl ? (
                <Image
                  src={game.coverImageUrl}
                  alt={game.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #0d0d20 0%, #1a0830 50%, #0a1020 100%)',
                  }}
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-300 group-hover:from-black/85" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h2 className="text-xl font-bold leading-tight text-white">{game.name}</h2>
                {game.developer && (
                  <p className="mt-0.5 text-xs text-white/55">
                    {game.developer}
                    {game.releaseYear ? ` · ${game.releaseYear}` : ''}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Enter Wiki <span aria-hidden>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
