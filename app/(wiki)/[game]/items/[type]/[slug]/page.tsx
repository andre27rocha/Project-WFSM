import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getItemBySlug } from '@/lib/supabase/queries/items'
import { getCommentsByEntity } from '@/lib/supabase/queries/comments'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'
import { Comments } from '@/components/wiki/Comments'
import { breadcrumbSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string; type: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, type: typeSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const item = await getItemBySlug(game.id, slug)
  if (!item) return {}
  return {
    title: item.name,
    description: item.description?.slice(0, 155) ?? `${item.name} item in ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/items/${typeSlug}/${slug}` },
    openGraph: {
      title: item.name,
      description: item.description?.slice(0, 155) ?? '',
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-foreground',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-primary',
}

const labelCls =
  'w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground'

export default async function ItemPage({ params }: Props) {
  const { game: gameSlug, type, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const item = await getItemBySlug(game.id, slug)
  if (!item || !item.isPublished) notFound()

  const rawComments = await getCommentsByEntity(game.id, 'item', item.id)
  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const jsonLd = breadcrumbSchema([
    { name: game.name, url: `${siteConfig.url}/${gameSlug}` },
    { name: 'Items', url: `${siteConfig.url}/${gameSlug}/items/${type}` },
    { name: item.name },
  ])

  const attrs = item.attributes
  const rarityColor = attrs.rarity ? (RARITY_COLORS[attrs.rarity] ?? 'text-foreground') : null
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')
  const metaParts = [typeLabel, attrs.rarity].filter(Boolean)

  const infobox = (
    <aside className="border-wiki-border bg-wiki-card float-right clear-right mb-5 ml-6 w-[280px] overflow-hidden rounded border shadow-lg shadow-black/20 sm:w-[260px]">
      <div className="relative h-52 w-full">
        <WikiImage
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="280px"
          priority
          className="object-cover"
        />
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-wiki-border bg-primary/10 border-b">
            <th
              colSpan={2}
              className="text-primary px-3 py-1.5 text-left text-[11px] font-bold tracking-wide uppercase"
            >
              {item.name}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-wiki-border/60 border-b">
            <td className={labelCls}>Type</td>
            <td className="text-foreground px-3 py-1.5 text-sm">{typeLabel}</td>
          </tr>
          {attrs.rarity && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Rarity</td>
              <td className={`px-3 py-1.5 text-sm capitalize ${rarityColor ?? ''}`}>
                {attrs.rarity}
              </td>
            </tr>
          )}
          {attrs.howToObtain && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Obtain</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.howToObtain}</td>
            </tr>
          )}
          {attrs.stackable !== undefined && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Stackable</td>
              <td className="text-foreground px-3 py-1.5 text-sm">
                {attrs.stackable ? 'Yes' : 'No'}
              </td>
            </tr>
          )}
          {(attrs.effects ?? []).length > 0 && (
            <tr>
              <td className={labelCls}>Effects</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.effects!.join(', ')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  )

  const details = (
    <>
      {infobox}
      <div className="space-y-4">
        {item.description && (
          <p className="text-foreground/85 text-base leading-relaxed">{item.description}</p>
        )}
        {item.content && <WikiMarkdown content={item.content} />}
      </div>
      <div className="clear-both" />
    </>
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'Items', href: `/${gameSlug}/items/${type}` },
          { label: item.name },
        ]}
      />
      <h1 className="text-foreground mb-2 text-3xl font-bold">{item.name}</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      {metaParts.length > 0 && (
        <p className="text-muted-foreground mb-6 text-sm capitalize">{metaParts.join(' · ')}</p>
      )}

      {item.spoilerLevel > 0 ? (
        <SpoilerBlock level={item.spoilerLevel} label={item.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments comments={comments} gameId={game.id} entityType="item" entityId={item.id} />
    </WikiPage>
  )
}
