import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getItemTypeBySlug, getPublishedItemsByType } from '@/lib/supabase/queries/items'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'
import { itemListSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string; type: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, type: typeSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const itemType = await getItemTypeBySlug(game.id, typeSlug)
  if (!itemType) return {}
  const title = `${itemType.name} – ${game.name}`
  return {
    title,
    description: `All ${itemType.name.toLowerCase()} in ${game.name}.`,
    alternates: {
      canonical: `${siteConfig.url}/${gameSlug}/items/${typeSlug}`,
    },
  }
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-foreground',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-primary',
}

const thCls =
  'border-b border-wiki-border px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary'

export default async function ItemListPage({ params }: Props) {
  const { game: gameSlug, type: typeSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const itemType = await getItemTypeBySlug(game.id, typeSlug)
  if (!itemType) notFound()

  const itemList = await getPublishedItemsByType(game.id, itemType.id)

  const listUrl = `${siteConfig.url}/${gameSlug}/items/${typeSlug}`
  const jsonLd = itemListSchema(
    `${itemType.name} – ${game.name}`,
    listUrl,
    itemList.map((item) => ({
      name: item.name,
      url: `${listUrl}/${item.slug}`,
    }))
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb
        crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: itemType.name }]}
      />
      <h1 className="text-foreground mb-2 text-2xl font-bold">{itemType.name}</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      <p className="text-muted-foreground mb-6 text-sm">
        {itemList.length} {itemType.name.toLowerCase()} in {game.name}.
      </p>

      {itemList.length === 0 ? (
        <p className="text-muted-foreground text-sm">No {itemType.name.toLowerCase()} yet.</p>
      ) : (
        <div className="border-wiki-border overflow-x-auto rounded border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-wiki-card">
                <th className={`${thCls} w-14`} />
                <th className={thCls}>Name</th>
                <th className={`${thCls} hidden sm:table-cell`}>Rarity</th>
                <th className={`${thCls} hidden md:table-cell`}>How to Obtain</th>
              </tr>
            </thead>
            <tbody>
              {itemList.map((item) => {
                const attrs = item.attributes
                const rarityColor = attrs.rarity
                  ? (RARITY_COLORS[attrs.rarity] ?? 'text-foreground')
                  : 'text-muted-foreground'
                return (
                  <tr
                    key={item.id}
                    className="border-wiki-border/60 hover:bg-primary/5 border-b transition-colors last:border-0"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/${gameSlug}/items/${typeSlug}/${item.slug}`}
                        aria-label={item.name}
                      >
                        <span className="relative block h-11 w-11 overflow-hidden rounded">
                          <WikiImage
                            src={item.imageUrl}
                            alt={item.name}
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
                        href={`/${gameSlug}/items/${typeSlug}/${item.slug}`}
                        className="text-primary font-semibold transition-colors hover:underline hover:underline-offset-2"
                      >
                        {item.name}
                      </Link>
                      {item.description && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td
                      className={`hidden px-3 py-2 text-sm capitalize sm:table-cell ${rarityColor}`}
                    >
                      {attrs.rarity ?? '—'}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-2 text-sm md:table-cell">
                      {attrs.howToObtain ? (
                        <span className="line-clamp-1">{attrs.howToObtain}</span>
                      ) : (
                        '—'
                      )}
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
