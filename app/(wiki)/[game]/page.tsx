import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { GameConfig } from '@/db/schema'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'

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
    openGraph: { title: game.name, description: game.description?.slice(0, 155) ?? '' },
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
  { key: 'spirits', label: 'Spirits', path: 'items/spirits', description: 'Moveset, upgrades & combos' },
  { key: 'relics', label: 'Relics', path: 'items/relics', description: 'Passive abilities' },
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

  return (
    <div>
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
      <div className="grid grid-cols-1 gap-0 border-b border-border lg:grid-cols-[320px_1fr]">
        {/* Left: navigation table */}
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="px-5 py-3 border-b border-border bg-card/40">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Contents
            </p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {availableSections.map(({ label, path, description }) => (
                <tr
                  key={path}
                  className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                >
                  <td className="px-5 py-2.5">
                    <Link
                      href={`/${gameSlug}/${path}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {label}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-muted-foreground">{description}</td>
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
