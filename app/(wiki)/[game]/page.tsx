import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: game.name,
    description: game.description?.slice(0, 155) ?? `Wiki for ${game.name}.`,
    openGraph: { title: game.name, description: game.description?.slice(0, 155) ?? '' },
  }
}

const sections = [
  { key: 'areas' as const, label: 'Areas', path: 'areas' },
  { key: 'bosses' as const, label: 'Bosses', path: 'bosses' },
  { key: 'npcs' as const, label: 'NPCs', path: 'npcs' },
  { key: 'items' as const, label: 'Items', path: 'items' },
]

export default async function GamePage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const availableSections = sections.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {game.bannerImageUrl && (
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-xl md:h-64">
          <Image
            src={game.bannerImageUrl}
            alt={`${game.name} banner`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mb-10 space-y-2">
        <p className="text-sm text-muted-foreground">
          {game.developer ?? ''}
          {game.developer && game.releaseYear ? ' · ' : ''}
          {game.releaseYear ?? ''}
        </p>
        <h1 className="text-4xl font-semibold text-foreground">{game.name}</h1>
        {game.description && (
          <p className="text-lg text-muted-foreground">{game.description}</p>
        )}
      </div>

      {availableSections.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {availableSections.map(({ label, path }) => (
            <Link
              key={path}
              href={`/${gameSlug}/${path}`}
              className="rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/50 hover:bg-card/80"
            >
              <p className="font-semibold text-foreground">{label}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
