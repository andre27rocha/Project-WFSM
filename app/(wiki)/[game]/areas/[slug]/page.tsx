import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getAreaBySlug } from '@/lib/supabase/queries/areas'
import { getCommentsByEntity } from '@/lib/supabase/queries/comments'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { Comments } from '@/components/wiki/Comments'
import { breadcrumbSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const area = await getAreaBySlug(game.id, slug)
  if (!area) return {}
  return {
    title: area.name,
    description: area.description?.slice(0, 155) ?? `${area.name} area guide for ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/areas/${slug}` },
    openGraph: {
      title: area.name,
      description: area.description?.slice(0, 155) ?? '',
      images: area.imageUrl ? [{ url: area.imageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function AreaPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const area = await getAreaBySlug(game.id, slug)
  if (!area || !area.isPublished) notFound()

  const rawComments = await getCommentsByEntity(game.id, 'area', area.id)
  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const jsonLd = breadcrumbSchema([
    { name: game.name, url: `${siteConfig.url}/${gameSlug}` },
    { name: 'Areas', url: `${siteConfig.url}/${gameSlug}/areas` },
    { name: area.name },
  ])

  const details = (
    <div className="space-y-5">
      {area.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{area.description}</p>
      )}

      {area.content && <WikiMarkdown content={area.content} />}

      {area.mapImageUrl && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Area Map
          </h2>
          <div className="relative w-full overflow-hidden rounded border border-border">
            <Image
              src={area.mapImageUrl}
              alt={`${area.name} map`}
              width={1200}
              height={800}
              className="h-auto w-full"
            />
          </div>
        </div>
      )}
    </div>
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
          { label: 'Areas', href: `/${gameSlug}/areas` },
          { label: area.name },
        ]}
      />

      {area.imageUrl && (
        <div className="relative mb-4 h-44 w-full overflow-hidden rounded">
          <Image src={area.imageUrl} alt={area.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-4 border-b border-primary/40 pb-1 text-2xl font-bold text-foreground">
        {area.name}
      </h1>

      {area.spoilerLevel > 0 ? (
        <SpoilerBlock level={area.spoilerLevel} label={area.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments
        comments={comments}
        gameId={game.id}
        entityType="area"
        entityId={area.id}
      />
    </div>
  )
}
