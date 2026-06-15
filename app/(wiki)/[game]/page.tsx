import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { GameConfig } from '@/db/schema'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'
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
  { key: 'spirits', label: 'Spirits', path: 'items/spirits', description: 'Moveset, upgrades & combos' },
  { key: 'relics', label: 'Relics', path: 'items/relics', description: 'Passive abilities' },
  // Blasphemous
  { key: 'prayers', label: 'Prayers', path: 'items/prayers', description: 'Active skills & magic' },
  { key: 'rosaryBeads', label: 'Rosary Beads', path: 'items/rosary-beads', description: 'Passive equippables' },
  { key: 'swordHearts', label: 'Sword Hearts', path: 'items/sword-hearts', description: 'Core stat modifiers' },
  // Salt and Sanctuary
  { key: 'skillTrees', label: 'Skill Trees', path: 'items/skill-trees', description: 'Class progression paths' },
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

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Banner */}
      {(game.bannerImageUrl ?? game.coverImageUrl) && (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={(game.bannerImageUrl ?? game.coverImageUrl)!}
            alt={`${game.name} banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 px-6 pb-4">
            <h1 className="text-2xl font-bold text-foreground drop-shadow">{game.name}</h1>
            <p className="text-xs text-muted-foreground">
              {game.developer ?? ''}
              {game.developer && game.releaseYear ? ' · ' : ''}
              {game.releaseYear ?? ''}
            </p>
          </div>
        </div>
      )}

      {!game.bannerImageUrl && !game.coverImageUrl && (
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
          <p className="text-xs text-muted-foreground">
            {game.developer ?? ''}
            {game.developer && game.releaseYear ? ' · ' : ''}
            {game.releaseYear ?? ''}
          </p>
        </div>
      )}

      {/* Main content: 2-col table + game info */}
      <div className="grid grid-cols-1 gap-0 border-b border-wiki-border lg:grid-cols-[320px_1fr]">
        {/* Left: navigation table */}
        <div className="border-b border-wiki-border lg:border-b-0 lg:border-r lg:border-r-wiki-border">
          <div className="border-b border-wiki-border bg-[#1a1a2e] px-5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary/80">
              Contents
            </p>
          </div>
          <table className="w-full border-collapse border border-wiki-border text-sm">
            <tbody>
              {availableSections.map(({ label, path, description }, i) => (
                <tr
                  key={path}
                  className={`hover:bg-primary/5 transition-colors ${i % 2 === 1 ? 'bg-[#1a1a2e]/30' : ''}`}
                >
                  <td className="border border-wiki-border px-4 py-2">
                    <Link
                      href={`/${gameSlug}/${path}`}
                      className="font-medium text-primary hover:underline hover:underline-offset-2 transition-colors"
                    >
                      {label}
                    </Link>
                  </td>
                  <td className="border border-wiki-border px-4 py-2 text-xs text-muted-foreground">
                    {description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: game info */}
        <div className="px-6 py-5">
          {game.description && (
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">{game.description}</p>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {game.developer && (
              <>
                <dt className="text-muted-foreground">Developer</dt>
                <dd className="text-foreground">{game.developer}</dd>
              </>
            )}
            {game.releaseYear && (
              <>
                <dt className="text-muted-foreground">Released</dt>
                <dd className="text-foreground">{game.releaseYear}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Recent additions */}
      {recentBosses.length > 0 && (
        <div className="px-6 py-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recently Added
          </h2>
          <ul className="space-y-1">
            {recentBosses.map((boss) => (
              <li key={boss.id}>
                <Link
                  href={`/${gameSlug}/bosses/${boss.slug}`}
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  {boss.name}
                  <span className="ml-2 text-xs text-muted-foreground">Boss</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
