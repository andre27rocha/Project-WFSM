import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return { title: `Areas – ${game.name}`, description: `All areas in ${game.name}.` }
}

export default async function AreaListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const areas = await getPublishedAreasByGame(game.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="mb-1 text-sm text-muted-foreground">
        <Link href={`/${gameSlug}`} className="transition-colors hover:text-primary">
          {game.name}
        </Link>{' '}
        / Areas
      </p>
      <h1 className="mb-8 text-3xl font-semibold text-foreground">Areas</h1>

      {areas.length === 0 ? (
        <p className="text-muted-foreground">No areas yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/${gameSlug}/areas/${area.slug}`}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
            >
              {area.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={area.imageUrl}
                    alt={area.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold text-foreground">{area.name}</p>
                {area.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {area.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
