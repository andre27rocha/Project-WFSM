import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGameWithArea } from '@/lib/supabase/queries/bosses'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
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

export default async function BossListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const bosses = await getPublishedBossesByGameWithArea(game.id)

  const listUrl = `${siteConfig.url}/${gameSlug}/bosses`
  const jsonLd = itemListSchema(
    `Bosses – ${game.name}`,
    listUrl,
    bosses.map((b) => ({ name: b.name, url: `${listUrl}/${b.slug}` })),
  )

  return (
    <div className="px-6 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <WikiBreadcrumb
        crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: 'Bosses' }]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-xl font-bold text-foreground">
        Bosses
      </h1>

      {bosses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bosses yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-wiki-border text-sm">
            <thead>
              <tr className="bg-[#1a1a2e]">
                <th className="w-14 border border-wiki-border px-3 py-2 text-left" />
                <th className="border border-wiki-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                  Name
                </th>
                <th className="hidden border border-wiki-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-primary sm:table-cell">
                  Area
                </th>
                <th className="hidden border border-wiki-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-primary md:table-cell">
                  HP
                </th>
                <th className="hidden border border-wiki-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-primary md:table-cell">
                  Phases
                </th>
                <th className="w-8 border border-wiki-border px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {bosses.map((boss, i) => {
                const attrs = boss.attributes
                const spoilerBorder =
                  boss.spoilerLevel >= 2
                    ? 'border-l-[3px] border-l-red-500'
                    : boss.spoilerLevel === 1
                      ? 'border-l-[3px] border-l-primary'
                      : ''
                return (
                  <tr
                    key={boss.id}
                    className={`hover:bg-primary/5 transition-colors ${i % 2 === 1 ? 'bg-[#1a1a2e]/30' : ''}`}
                  >
                    <td className={`border border-wiki-border px-3 py-2 ${spoilerBorder}`}>
                      {boss.imageUrl ? (
                        <Image
                          src={boss.imageUrl}
                          alt={boss.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </td>
                    <td className="border border-wiki-border px-3 py-2">
                      <Link
                        href={`/${gameSlug}/bosses/${boss.slug}`}
                        className="font-medium text-primary hover:underline hover:underline-offset-2 transition-colors"
                      >
                        {boss.name}
                      </Link>
                      {boss.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {boss.description}
                        </p>
                      )}
                    </td>
                    <td className="hidden border border-wiki-border px-3 py-2 text-sm text-muted-foreground sm:table-cell">
                      {boss.area ? (
                        <Link
                          href={`/${gameSlug}/areas/${boss.area.slug}`}
                          className="text-primary/80 hover:text-primary hover:underline hover:underline-offset-2 transition-colors"
                        >
                          {boss.area.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden border border-wiki-border px-3 py-2 font-mono text-sm text-muted-foreground md:table-cell">
                      {attrs.hp !== undefined ? attrs.hp.toLocaleString() : '—'}
                    </td>
                    <td className="hidden border border-wiki-border px-3 py-2 text-sm text-muted-foreground md:table-cell">
                      {attrs.phases !== undefined ? attrs.phases : '—'}
                    </td>
                    <td className="border border-wiki-border px-3 py-2 text-center">
                      {boss.spoilerLevel > 0 && (
                        <span
                          title={`Spoiler level ${boss.spoilerLevel}`}
                          className={
                            boss.spoilerLevel >= 2 ? 'text-xs text-red-400' : 'text-xs text-primary/70'
                          }
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
