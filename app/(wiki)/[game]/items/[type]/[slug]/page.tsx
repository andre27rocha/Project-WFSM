import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getItemBySlug } from '@/lib/supabase/queries/items'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

interface Props {
  params: Promise<{ game: string; type: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const item = await getItemBySlug(game.id, slug)
  if (!item) return {}
  return {
    title: item.name,
    description: item.description?.slice(0, 155) ?? `${item.name} item in ${game.name}.`,
    openGraph: {
      title: item.name,
      description: item.description?.slice(0, 155) ?? '',
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
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

export default async function ItemPage({ params }: Props) {
  const { game: gameSlug, type, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const item = await getItemBySlug(game.id, slug)
  if (!item || !item.isPublished) notFound()

  const attrs = item.attributes
  const rarityColor = attrs.rarity ? (RARITY_COLORS[attrs.rarity] ?? 'text-foreground') : null

  const hasProps =
    attrs.rarity ||
    attrs.howToObtain ||
    attrs.stackable !== undefined ||
    (attrs.effects ?? []).length > 0

  const infobox = hasProps ? (
    <aside className="float-right clear-right mb-4 ml-6 w-[260px] overflow-hidden rounded border border-wiki-border bg-[rgba(10,10,20,0.88)]">
      {item.imageUrl && (
        <div className="relative h-44 w-full">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" priority />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-wiki-border bg-primary/10">
            <th
              colSpan={2}
              className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary"
            >
              {item.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.rarity && (
            <tr className="border-b border-wiki-border/60">
              <td className="w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Rarity
              </td>
              <td className={`px-3 py-1.5 text-sm capitalize ${rarityColor ?? ''}`}>
                {attrs.rarity}
              </td>
            </tr>
          )}
          {attrs.howToObtain && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Obtain
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.howToObtain}</td>
            </tr>
          )}
          {attrs.stackable !== undefined && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Stackable
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">
                {attrs.stackable ? 'Yes' : 'No'}
              </td>
            </tr>
          )}
          {(attrs.effects ?? []).length > 0 && (
            <tr>
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Effects
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.effects!.join(', ')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  ) : null

  const details = (
    <div>
      {infobox}
      <div className="space-y-4">
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>
        )}
        {item.content && <WikiMarkdown content={item.content} />}
      </div>
      <div className="clear-both" />
    </div>
  )

  return (
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'Items', href: `/${gameSlug}/items/${type}` },
          { label: item.name },
        ]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-2xl font-bold text-foreground">
        {item.name}
      </h1>

      {item.spoilerLevel > 0 ? (
        <SpoilerBlock level={item.spoilerLevel} label={item.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </div>
  )
}
