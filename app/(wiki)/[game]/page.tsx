import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { GameConfig } from '@/db/schema'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'
import { SectionHeader } from '@/components/wiki/SectionHeader'
import { WikiImage } from '@/components/wiki/WikiImage'
import { videoGameSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: game.name,
    description: game.description?.slice(0, 155) ?? `Wiki for ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}` },
    openGraph: {
      title: game.name,
      description: game.description?.slice(0, 155) ?? '',
      images: game.coverImageUrl ? [{ url: game.coverImageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

type NavSection = {
  key: keyof GameConfig
  label: string
  path: string
  description: string
}

const NAV_SECTIONS: NavSection[] = [
  { key: 'bosses', label: 'Bosses', path: 'bosses', description: 'Strategies, drops & lore' },
  { key: 'areas', label: 'Map', path: 'map', description: 'Interactive world map' },
  { key: 'npcs', label: 'NPCs', path: 'npcs', description: 'Characters & dialogue' },
  // Ender Lilies / Ender Magnolia
  {
    key: 'spirits',
    label: 'Spirits',
    path: 'items/spirits',
    description: 'Moveset, upgrades & combos',
  },
  { key: 'relics', label: 'Relics', path: 'items/relics', description: 'Passive abilities' },
  // Blasphemous
  { key: 'prayers', label: 'Prayers', path: 'items/prayers', description: 'Active skills & magic' },
  {
    key: 'rosaryBeads',
    label: 'Rosary Beads',
    path: 'items/rosary-beads',
    description: 'Passive equippables',
  },
  {
    key: 'swordHearts',
    label: 'Sword Hearts',
    path: 'items/sword-hearts',
    description: 'Core stat modifiers',
  },
  // Salt and Sanctuary
  {
    key: 'skillTrees',
    label: 'Skill Trees',
    path: 'items/skill-trees',
    description: 'Class progression paths',
  },
  { key: 'weaponTypes', label: 'Weapons', path: 'items/weapons', description: 'Arms & equipment' },
  // Generic
  { key: 'items', label: 'Items', path: 'items', description: 'Equipment & collectibles' },
  { key: 'tierlist', label: 'Tier List', path: 'tierlist', description: 'Community rankings' },
]

export default async function GamePage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const availableSections = NAV_SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  const recentBosses = game.gameConfig.bosses
    ? (await getPublishedBossesByGame(game.id))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
    : []

  const jsonLd = videoGameSchema({
    name: game.name,
    description: game.description,
    developer: game.developer,
    coverImageUrl: game.coverImageUrl,
    slug: game.slug,
    siteUrl: siteConfig.url,
  })

  const meta = [game.developer, game.releaseYear?.toString()].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* Infobox: cover + meta, floated so the overview wraps around it */}
      <aside className="border-wiki-border bg-wiki-card float-right clear-right mb-5 ml-6 w-[280px] overflow-hidden rounded border shadow-lg shadow-black/20">
        <div className="relative aspect-[3/4] w-full">
          <WikiImage
            src={game.coverImageUrl ?? game.bannerImageUrl}
            alt={game.name}
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
                {game.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {game.developer && (
              <tr className="border-wiki-border/60 border-b">
                <td className="border-wiki-border/60 text-muted-foreground w-[90px] border-r bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold">
                  Developer
                </td>
                <td className="text-foreground px-3 py-1.5 text-sm">{game.developer}</td>
              </tr>
            )}
            {game.releaseYear && (
              <tr>
                <td className="border-wiki-border/60 text-muted-foreground border-r bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold">
                  Released
                </td>
                <td className="text-foreground px-3 py-1.5 text-sm">{game.releaseYear}</td>
              </tr>
            )}
          </tbody>
        </table>
      </aside>

      {/* Title + overview */}
      <h1 className="text-foreground mb-2 text-3xl font-bold">{game.name}</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      {meta && <p className="text-muted-foreground mb-5 text-sm">{meta}</p>}
      {game.description && (
        <p className="text-foreground/85 mb-8 text-base leading-relaxed">{game.description}</p>
      )}

      <div className="clear-both" />

      {/* Contents — dynamic modules from game_config */}
      {availableSections.length > 0 && (
        <section className="mb-10">
          <SectionHeader>Contents</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableSections.map(({ label, path, description }) => (
              <Link
                key={path}
                href={`/${gameSlug}/${path}`}
                className="group border-wiki-border bg-wiki-card hover:border-primary/40 flex items-center gap-3 rounded border px-4 py-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-primary font-semibold transition-colors group-hover:underline group-hover:underline-offset-2">
                    {label}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
                </div>
                <svg
                  className="text-muted-foreground/40 group-hover:text-primary h-4 w-4 shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent additions */}
      {recentBosses.length > 0 && (
        <section>
          <SectionHeader>Recently Added</SectionHeader>
          <ul className="divide-wiki-border border-wiki-border bg-surface/30 divide-y rounded border">
            {recentBosses.map((boss) => (
              <li key={boss.id}>
                <Link
                  href={`/${gameSlug}/bosses/${boss.slug}`}
                  className="group hover:bg-surface/60 flex items-center gap-2.5 px-3 py-2.5 transition-colors"
                >
                  <span className="shrink-0 rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                    Boss
                  </span>
                  <span className="text-foreground group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors">
                    {boss.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
