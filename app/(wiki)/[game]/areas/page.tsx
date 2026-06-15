import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

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
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'Areas' }]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-xl font-bold text-foreground">
        Areas
      </h1>

      {areas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No areas yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/${gameSlug}/areas/${area.slug}`}
              className="group overflow-hidden rounded border border-wiki-border bg-[#1a1a2e] transition-colors hover:border-primary/50"
            >
              {area.imageUrl && (
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={area.imageUrl}
                    alt={area.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-primary transition-colors group-hover:underline group-hover:underline-offset-2">
                  {area.name}
                </p>
                {area.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {area.description}
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
