import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'
import { itemListSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: `NPCs – ${game.name}`,
    description: `All NPCs in ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/npcs` },
  }
}

const thCls =
  'border-b border-wiki-border px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary'

export default async function NpcListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const [npcs, areas] = await Promise.all([
    getPublishedNpcsByGame(game.id),
    getPublishedAreasByGame(game.id),
  ])
  const areaById = new Map(areas.map((a) => [a.id, a]))

  const listUrl = `${siteConfig.url}/${gameSlug}/npcs`
  const jsonLd = itemListSchema(
    `NPCs – ${game.name}`,
    listUrl,
    npcs.map((n) => ({ name: n.name, url: `${listUrl}/${n.slug}` }))
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'NPCs' }]} />
      <h1 className="text-foreground mb-2 text-2xl font-bold">NPCs</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      <p className="text-muted-foreground mb-6 text-sm">
        {npcs.length} {npcs.length === 1 ? 'character' : 'characters'} in {game.name}.
      </p>

      {npcs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No NPCs yet.</p>
      ) : (
        <div className="border-wiki-border overflow-x-auto rounded border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-wiki-card">
                <th className={`${thCls} w-14`} />
                <th className={thCls}>Name</th>
                <th className={`${thCls} hidden sm:table-cell`}>Location</th>
                <th className={`${thCls} hidden md:table-cell`}>Role</th>
              </tr>
            </thead>
            <tbody>
              {npcs.map((npc) => {
                const area = npc.areaId ? areaById.get(npc.areaId) : null
                return (
                  <tr
                    key={npc.id}
                    className="border-wiki-border/60 hover:bg-primary/5 border-b transition-colors last:border-0"
                  >
                    <td className="px-3 py-2">
                      <Link href={`/${gameSlug}/npcs/${npc.slug}`} aria-label={npc.name}>
                        <span className="relative block h-11 w-11 overflow-hidden rounded">
                          <WikiImage
                            src={npc.imageUrl}
                            alt={npc.name}
                            fill
                            sizes="44px"
                            compact
                            className="object-cover"
                          />
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${gameSlug}/npcs/${npc.slug}`}
                        className="text-primary font-semibold transition-colors hover:underline hover:underline-offset-2"
                      >
                        {npc.name}
                      </Link>
                      {npc.description && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {npc.description}
                        </p>
                      )}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 text-sm sm:table-cell">
                      {area ? (
                        <Link
                          href={`/${gameSlug}/areas/${area.slug}`}
                          className="text-primary/80 hover:text-primary transition-colors hover:underline hover:underline-offset-2"
                        >
                          {area.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 text-sm md:table-cell">
                      {npc.attributes.role ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </WikiPage>
  )
}
