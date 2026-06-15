import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGlobalTierListItems } from '@/lib/supabase/queries/tierlists'
import { TierListContainer } from '@/components/wiki/TierListContainer'
import { itemListSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  searchParams: Promise<{ tier?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Global Game Tier List',
    description:
      'Rank all metroidvania and soulsvania games on VaniaCodex. Drag to sort, copy the link to share your list.',
    alternates: { canonical: `${siteConfig.url}/tierlist` },
    openGraph: {
      title: 'Global Game Tier List — VaniaCodex',
      description: 'Rank all metroidvania games. Share your tier list with a link.',
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function GlobalTierListPage({ searchParams }: Props) {
  const { tier } = await searchParams

  const games = await getGlobalTierListItems()

  const jsonLd = itemListSchema(
    'Metroidvania Games Tier List',
    `${siteConfig.url}/tierlist`,
    games.map((g) => ({ name: g.name, url: `${siteConfig.url}` })),
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <h1 className="mb-2 text-2xl font-bold text-foreground">Global Game Tier List</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Rank every game on VaniaCodex. Drag to sort, copy the link to share your tier list.
      </p>
      <TierListContainer tierParam={tier} isGlobal />
    </div>
  )
}
