import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return { title: `Bosses – ${game.name}`, description: `All bosses in ${game.name}.` }
}

export default async function BossListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const bosses = await getPublishedBossesByGame(game.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="mb-1 text-sm text-muted-foreground">
        <Link href={`/${gameSlug}`} className="transition-colors hover:text-primary">
          {game.name}
        </Link>{' '}
        / Bosses
      </p>
      <h1 className="mb-8 text-3xl font-semibold text-foreground">Bosses</h1>

      {bosses.length === 0 ? (
        <p className="text-muted-foreground">No bosses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {bosses.map((boss) => (
            <Link
              key={boss.id}
              href={`/${gameSlug}/bosses/${boss.slug}`}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
            >
              {boss.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={boss.imageUrl}
                    alt={boss.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold text-foreground">{boss.name}</p>
                {boss.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {boss.description}
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
