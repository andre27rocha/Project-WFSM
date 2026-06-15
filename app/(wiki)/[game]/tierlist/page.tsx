import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { TierListContainer } from '@/components/wiki/TierListContainer'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { videoGameSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string }>
  searchParams: Promise<{ tier?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: `${game.name} Tier List`,
    description: `Community tier list for ${game.name}. Drag to rank items, spirits and relics — share your ranking with a link.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/tierlist` },
    openGraph: {
      title: `${game.name} Tier List`,
      description: `Rank and share your ${game.name} tier list.`,
      images: game.coverImageUrl ? [{ url: game.coverImageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function GameTierListPage({ params, searchParams }: Props) {
  const { game: gameSlug } = await params
  const { tier } = await searchParams

  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()
  if (!game.gameConfig.tierlist) notFound()

  const jsonLd = videoGameSchema({
    name: game.name,
    description: game.description,
    developer: game.developer,
    coverImageUrl: game.coverImageUrl,
    slug: game.slug,
    siteUrl: siteConfig.url,
  })

  return (
    <div className="px-6 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'Tier List' },
        ]}
      />
      <h1 className="mb-2 border-b border-primary/40 pb-1 text-2xl font-bold text-foreground">
        {game.name} — Tier List
      </h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Drag items between tiers, then copy the link to share your ranking.
      </p>
      <TierListContainer gameId={game.id} tierParam={tier} />
    </div>
  )
}
