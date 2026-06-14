import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return { title: `NPCs – ${game.name}`, description: `All NPCs in ${game.name}.` }
}

export default async function NpcListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const npcs = await getPublishedNpcsByGame(game.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="mb-1 text-sm text-muted-foreground">
        <Link href={`/${gameSlug}`} className="transition-colors hover:text-primary">
          {game.name}
        </Link>{' '}
        / NPCs
      </p>
      <h1 className="mb-8 text-3xl font-semibold text-foreground">NPCs</h1>

      {npcs.length === 0 ? (
        <p className="text-muted-foreground">No NPCs yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {npcs.map((npc) => (
            <Link
              key={npc.id}
              href={`/${gameSlug}/npcs/${npc.slug}`}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
            >
              {npc.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={npc.imageUrl}
                    alt={npc.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold text-foreground">{npc.name}</p>
                {npc.attributes.role && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{npc.attributes.role}</p>
                )}
                {npc.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {npc.description}
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
