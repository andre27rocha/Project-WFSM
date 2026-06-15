import Link from 'next/link'
import type { Game, GameConfig } from '@/types'
import { WikiImage } from '@/components/wiki/WikiImage'

type SidebarSection = {
  key: keyof GameConfig
  label: string
  path: string
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { key: 'bosses', label: 'Bosses', path: 'bosses' },
  { key: 'areas', label: 'Interactive Map', path: 'map' },
  { key: 'npcs', label: 'NPCs', path: 'npcs' },
  // Ender Lilies / Ender Magnolia
  { key: 'spirits', label: 'Spirits', path: 'items/spirits' },
  { key: 'relics', label: 'Relics', path: 'items/relics' },
  // Blasphemous
  { key: 'prayers', label: 'Prayers', path: 'items/prayers' },
  { key: 'rosaryBeads', label: 'Rosary Beads', path: 'items/rosary-beads' },
  { key: 'swordHearts', label: 'Sword Hearts', path: 'items/sword-hearts' },
  // Salt and Sanctuary
  { key: 'skillTrees', label: 'Skill Trees', path: 'items/skill-trees' },
  { key: 'weaponTypes', label: 'Weapons', path: 'items/weapons' },
  // Generic
  { key: 'items', label: 'Items', path: 'items' },
  { key: 'tierlist', label: 'Tier List', path: 'tierlist' },
  { key: 'achievements', label: '100% Guide', path: 'guide/100' },
]

const linkCls =
  'flex items-center gap-1.5 rounded px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary'

const summaryCls =
  'flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 transition-colors hover:text-primary [&::-webkit-details-marker]:hidden'

function Chevron() {
  return (
    <svg
      className="text-muted-foreground/40 h-3 w-3 transition-transform group-open:rotate-90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function Bullet() {
  return <span className="text-muted-foreground/40 text-[10px]">›</span>
}

interface WikiSidebarProps {
  game: Game
  gameSlug: string
}

export function WikiSidebar({ game, gameSlug }: WikiSidebarProps) {
  const sections = SIDEBAR_SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <aside className="border-wiki-border bg-wiki-sidebar sticky top-12 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col overflow-y-auto border-r lg:flex">
      {/* Game header: cover + title */}
      <Link
        href={`/${gameSlug}`}
        className="group border-wiki-border hover:bg-primary/5 flex items-center gap-2.5 border-b px-3 py-3 transition-colors"
      >
        <span className="border-wiki-border relative h-12 w-9 shrink-0 overflow-hidden rounded-sm border">
          <WikiImage
            src={game.coverImageUrl}
            alt={game.name}
            fill
            sizes="36px"
            compact
            className="object-cover"
          />
        </span>
        <span className="text-primary text-sm leading-tight font-bold tracking-wide uppercase">
          {game.name}
        </span>
      </Link>

      {/* Navigation */}
      <details open className="group border-wiki-border border-b">
        <summary className={summaryCls}>
          Navigation
          <Chevron />
        </summary>
        <ul className="px-2 pb-2">
          {sections.map(({ label, path }) => (
            <li key={path}>
              <Link href={`/${gameSlug}/${path}`} className={linkCls}>
                <Bullet />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      {/* Quick Links */}
      <details open className="group border-wiki-border border-b">
        <summary className={summaryCls}>
          Quick Links
          <Chevron />
        </summary>
        <ul className="px-2 pb-2">
          <li>
            <Link href={`/${gameSlug}`} className={linkCls}>
              <Bullet />
              Game Overview
            </Link>
          </li>
          {game.gameConfig.bosses && (
            <li>
              <Link href={`/${gameSlug}/bosses`} className={linkCls}>
                <Bullet />
                All Bosses
              </Link>
            </li>
          )}
          {game.gameConfig.areas && (
            <li>
              <Link href={`/${gameSlug}/map`} className={linkCls}>
                <Bullet />
                World Map
              </Link>
            </li>
          )}
          {game.gameConfig.achievements && (
            <li>
              <Link href={`/${gameSlug}/guide/100`} className={linkCls}>
                <Bullet />
                100% Guide
              </Link>
            </li>
          )}
          {game.gameConfig.tierlist && (
            <li>
              <Link href={`/${gameSlug}/tierlist`} className={linkCls}>
                <Bullet />
                Tier List
              </Link>
            </li>
          )}
        </ul>
      </details>

      {/* Footer */}
      <div className="border-wiki-border mt-auto border-t px-3 py-2.5">
        <Link
          href="/"
          className="text-muted-foreground/50 hover:text-primary block text-[11px] transition-colors hover:underline"
        >
          ← All Games
        </Link>
      </div>
    </aside>
  )
}
