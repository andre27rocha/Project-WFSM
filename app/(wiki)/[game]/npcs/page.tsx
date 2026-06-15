import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

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
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'NPCs' }]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-xl font-bold text-foreground">
        NPCs
      </h1>

      {npcs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No NPCs yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {npcs.map((npc) => (
            <Link
              key={npc.id}
              href={`/${gameSlug}/npcs/${npc.slug}`}
              className="group overflow-hidden rounded border border-wiki-border bg-[rgba(10,10,20,0.82)] backdrop-blur-sm transition-colors hover:border-primary/50"
            >
              {npc.imageUrl && (
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={npc.imageUrl}
                    alt={npc.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-primary transition-colors group-hover:underline group-hover:underline-offset-2">
                  {npc.name}
                </p>
                {npc.attributes.role && (
                  <p className="mt-0.5 text-xs text-primary/70">{npc.attributes.role}</p>
                )}
                {npc.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {npc.description}
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
