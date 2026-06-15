import Link from 'next/link'
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
    <div className="px-4 py-6">
      {/* Title */}
      <div className="mb-5 px-2">
        <h1 className="text-3xl font-bold text-foreground drop-shadow">{game.name}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {game.developer ?? ''}
          {game.developer && game.releaseYear ? ' · ' : ''}
          {game.releaseYear ?? ''}
        </p>
      </div>

      {/* Main content: 2-col table + game info */}
      <div className="mb-4 overflow-hidden rounded border border-wiki-border bg-[rgba(10,10,20,0.82)]">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
          {/* Left: navigation table */}
          <div className="border-b border-wiki-border lg:border-b-0 lg:border-r lg:border-r-wiki-border">
            <div className="border-b border-wiki-border bg-[rgba(20,10,40,0.60)] px-5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary/80">
                Contents
              </p>
            </div>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {availableSections.map(({ label, path, description }, i) => (
                  <tr
                    key={path}
                    className={`transition-colors hover:bg-primary/5 ${i % 2 === 1 ? 'bg-[rgba(255,255,255,0.02)]' : ''}`}
                  >
                    <td className="border-b border-wiki-border/50 px-4 py-2">
                      <Link
                        href={`/${gameSlug}/${path}`}
                        className="font-medium text-primary transition-colors hover:underline hover:underline-offset-2"
                      >
                        {label}
                      </Link>
                    </td>
                    <td className="border-b border-l border-wiki-border/50 px-4 py-2 text-xs text-muted-foreground">
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
      </div>

      {/* Recent additions */}
      {recentBosses.length > 0 && (
        <div className="rounded border border-wiki-border bg-[rgba(10,10,20,0.82)] px-5 py-4">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary/80">
            Recently Added
          </h2>
          <ul className="space-y-1">
            {recentBosses.map((boss) => (
              <li key={boss.id}>
                <Link
                  href={`/${gameSlug}/bosses/${boss.slug}`}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
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
