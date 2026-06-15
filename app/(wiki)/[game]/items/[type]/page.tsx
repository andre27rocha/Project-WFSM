import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getItemTypeBySlug, getPublishedItemsByType } from '@/lib/supabase/queries/items'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
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
    })),
  )

  return (
    <div className="px-6 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: itemType.name },
        ]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-xl font-bold text-foreground">
        {itemType.name}
      </h1>

      {itemList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {itemType.name.toLowerCase()} yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {itemList.map((item) => (
            <Link
              key={item.id}
              href={`/${gameSlug}/items/${typeSlug}/${item.slug}`}
              className="group overflow-hidden rounded border border-wiki-border bg-[#1a1a2e] transition-colors hover:border-primary/50"
            >
              {item.imageUrl && (
                <div className="relative h-28 w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-primary transition-colors group-hover:underline group-hover:underline-offset-2">
                  {item.name}
                </p>
                {item.attributes.rarity && (
                  <p className="mt-0.5 text-xs capitalize text-primary/70">{item.attributes.rarity}</p>
                )}
                {item.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {item.description}
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
