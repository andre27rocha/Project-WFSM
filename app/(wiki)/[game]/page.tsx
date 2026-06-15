import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Swords, MapPin, Users, Sparkles, Gem, Package, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import type { GameConfig } from '@/db/schema'

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

type SectionDef = {
  key: keyof GameConfig
  label: string
  description: string
  path: string
  Icon: LucideIcon
}

const SECTIONS: SectionDef[] = [
  {
    key: 'bosses',
    label: 'Bosses',
    description: 'Strategies, drops & lore',
    path: 'bosses',
    Icon: Swords,
  },
  {
    key: 'areas',
    label: 'Areas',
    description: 'Explore the world',
    path: 'areas',
    Icon: MapPin,
  },
  {
    key: 'npcs',
    label: 'NPCs',
    description: 'Characters & dialogue',
    path: 'npcs',
    Icon: Users,
  },
  {
    key: 'spirits',
    label: 'Spirits',
    description: 'Moveset, upgrades & combos',
    path: 'items/spirits',
    Icon: Sparkles,
  },
  {
    key: 'relics',
    label: 'Relics',
    description: 'Passive abilities',
    path: 'items/relics',
    Icon: Gem,
  },
  {
    key: 'items',
    label: 'Items',
    description: 'Equipment & collectibles',
    path: 'items',
    Icon: Package,
  },
  {
    key: 'tierlist',
    label: 'Tier List',
    description: 'Community rankings',
    path: 'tierlist',
    Icon: Trophy,
  },
]

export default async function GamePage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const availableSections = SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {game.bannerImageUrl && (
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-xl md:h-64">
          <Image
            src={game.bannerImageUrl}
            alt={`${game.name} banner`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mb-10 space-y-2">
        <p className="text-sm text-muted-foreground">
          {game.developer ?? ''}
          {game.developer && game.releaseYear ? ' · ' : ''}
          {game.releaseYear ?? ''}
        </p>
        <h1 className="text-4xl font-semibold text-foreground">{game.name}</h1>
        {game.description && (
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{game.description}</p>
        )}
      </div>

      {availableSections.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {availableSections.map(({ label, description, path, Icon }) => (
            <Link
              key={path}
              href={`/${gameSlug}/${path}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-card/80"
            >
              <Icon
                size={24}
                className="text-primary transition-colors group-hover:text-primary/80"
              />
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
