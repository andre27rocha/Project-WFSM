import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedAreasByGame, getAreaContentCounts } from '@/lib/supabase/queries/areas'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'

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

  const [areas, counts] = await Promise.all([
    getPublishedAreasByGame(game.id),
    getAreaContentCounts(game.id),
  ])

  return (
    <WikiPage>
      <WikiBreadcrumb crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'Areas' }]} />
      <h1 className="text-foreground mb-2 text-2xl font-bold">Areas</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      <p className="text-muted-foreground mb-6 text-sm">
        {areas.length} {areas.length === 1 ? 'area' : 'areas'} in {game.name}.
      </p>

      {areas.length === 0 ? (
        <p className="text-muted-foreground text-sm">No areas yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {areas.map((area) => {
            const count = counts[area.id]
            return (
              <Link
                key={area.id}
                href={`/${gameSlug}/areas/${area.slug}`}
                className="group border-wiki-border bg-wiki-card hover:border-primary/40 flex flex-col overflow-hidden rounded border transition-colors"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <WikiImage
                    src={area.imageUrl}
                    alt={area.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-primary font-semibold transition-colors group-hover:underline group-hover:underline-offset-2">
                    {area.name}
                  </p>
                  {area.description && (
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed">
                      {area.description}
                    </p>
                  )}
                  <div className="border-wiki-border text-muted-foreground mt-3 flex items-center gap-4 border-t pt-3 text-xs">
                    <span>
                      <span className="text-foreground font-semibold">{count?.bosses ?? 0}</span>{' '}
                      {count?.bosses === 1 ? 'Boss' : 'Bosses'}
                    </span>
                    <span>
                      <span className="text-foreground font-semibold">{count?.npcs ?? 0}</span>{' '}
                      {count?.npcs === 1 ? 'NPC' : 'NPCs'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </WikiPage>
  )
}
