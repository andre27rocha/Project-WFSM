import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'
import { MapViewLoader } from '@/components/wiki/MapViewLoader'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: `${game.name} — Interactive Map`,
    description: `Explore every area in ${game.name} with our interactive world map.`,
  }
}

export default async function MapPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()
  if (!game.gameConfig.areas) notFound()

  const areas = await getPublishedAreasByGame(game.id)

  const mappableAreas = areas.filter((a) => a.mapX !== null && a.mapY !== null)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        <Link
          href={`/${gameSlug}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          {game.name}
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Interactive Map</h1>
        <span className="ml-auto text-xs text-muted-foreground">
          {mappableAreas.length} area{mappableAreas.length !== 1 ? 's' : ''} on map
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map canvas */}
        <div className="relative flex-1 bg-[#111218]">
          <MapViewLoader areas={areas} gameSlug={gameSlug} />
        </div>

        {/* Area sidebar */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-l border-border bg-card lg:block">
          <div className="p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Areas
            </p>
            <ul className="space-y-1">
              {areas.map((area) => (
                <li key={area.id}>
                  <Link
                    href={`/${gameSlug}/areas/${area.slug}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-primary"
                  >
                    {area.mapX !== null && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
