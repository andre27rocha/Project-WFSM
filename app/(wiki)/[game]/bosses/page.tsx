import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGameWithArea } from '@/lib/supabase/queries/bosses'
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
    title: `Bosses – ${game.name}`,
    description: `All bosses in ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/bosses` },
  }
}

const thCls =
  'border-b border-wiki-border px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary'

export default async function BossListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const bosses = await getPublishedBossesByGameWithArea(game.id)

  const listUrl = `${siteConfig.url}/${gameSlug}/bosses`
  const jsonLd = itemListSchema(
    `Bosses – ${game.name}`,
    listUrl,
    bosses.map((b) => ({ name: b.name, url: `${listUrl}/${b.slug}` }))
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'Bosses' }]} />
      <h1 className="text-foreground mb-2 text-2xl font-bold">Bosses</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      <p className="text-muted-foreground mb-6 text-sm">
        {bosses.length} {bosses.length === 1 ? 'boss' : 'bosses'} in {game.name}.
      </p>

      {bosses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bosses yet.</p>
      ) : (
        <div className="border-wiki-border overflow-x-auto rounded border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-wiki-card">
                <th className={`${thCls} w-14`} />
                <th className={thCls}>Name</th>
                <th className={`${thCls} hidden sm:table-cell`}>Area</th>
                <th className={`${thCls} hidden md:table-cell`}>HP</th>
                <th className={`${thCls} hidden md:table-cell`}>Phases</th>
              </tr>
            </thead>
            <tbody>
              {bosses.map((boss) => {
                const attrs = boss.attributes
                const spoilerAccent =
                  boss.spoilerLevel >= 2
                    ? 'border-l-[3px] border-l-red-500'
                    : boss.spoilerLevel === 1
                      ? 'border-l-[3px] border-l-primary'
                      : 'border-l-[3px] border-l-transparent'
                return (
                  <tr
                    key={boss.id}
                    className="border-wiki-border/60 hover:bg-primary/5 border-b transition-colors last:border-0"
                  >
                    <td className={`px-3 py-2 ${spoilerAccent}`}>
                      <Link href={`/${gameSlug}/bosses/${boss.slug}`} aria-label={boss.name}>
                        <span className="relative block h-11 w-11 overflow-hidden rounded">
                          <WikiImage
                            src={boss.imageUrl}
                            alt={boss.name}
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
                        href={`/${gameSlug}/bosses/${boss.slug}`}
                        className="text-primary font-semibold transition-colors hover:underline hover:underline-offset-2"
                      >
                        {boss.name}
                      </Link>
                      {boss.spoilerLevel > 0 && (
                        <span
                          title={`Spoiler level ${boss.spoilerLevel}`}
                          className={`ml-1.5 text-xs ${boss.spoilerLevel >= 2 ? 'text-red-400' : 'text-primary/70'}`}
                        >
                          ⚠
                        </span>
                      )}
                      {boss.description && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {boss.description}
                        </p>
                      )}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 text-sm sm:table-cell">
                      {boss.area ? (
                        <Link
                          href={`/${gameSlug}/areas/${boss.area.slug}`}
                          className="text-primary/80 hover:text-primary transition-colors hover:underline hover:underline-offset-2"
                        >
                          {boss.area.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 font-mono text-sm md:table-cell">
                      {attrs.hp !== undefined ? attrs.hp.toLocaleString() : '—'}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 text-sm md:table-cell">
                      {attrs.phases !== undefined ? attrs.phases : '—'}
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
