import Link from 'next/link'
import type { Game, GameConfig } from '@/types'

type SidebarSection = {
  key: keyof GameConfig
  label: string
  path: string
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { key: 'bosses', label: 'Bosses', path: 'bosses' },
  { key: 'areas', label: 'Interactive Map', path: 'map' },
  { key: 'npcs', label: 'NPCs', path: 'npcs' },
  { key: 'spirits', label: 'Spirits', path: 'items/spirits' },
  { key: 'relics', label: 'Relics', path: 'items/relics' },
  { key: 'items', label: 'Items', path: 'items' },
  { key: 'tierlist', label: 'Tier List', path: 'tierlist' },
]

interface WikiSidebarProps {
  game: Game
  gameSlug: string
}

export function WikiSidebar({ game, gameSlug }: WikiSidebarProps) {
  const sections = SIDEBAR_SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <aside className="hidden lg:flex lg:flex-col w-[220px] shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border bg-card/40">
      <div className="px-3 py-4 flex-1">
        <Link
          href={`/${gameSlug}`}
          className="block px-2 py-1.5 mb-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors truncate uppercase tracking-wide"
        >
          {game.name}
        </Link>

        <div className="mb-5">
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </p>
          <ul>
            {sections.map(({ label, path }) => (
              <li key={path}>
                <Link
                  href={`/${gameSlug}/${path}`}
                  className="flex items-center px-2 py-1 text-[13px] text-foreground/75 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Quick Links
          </p>
          <ul>
            <li>
              <Link
                href={`/${gameSlug}`}
                className="flex items-center px-2 py-1 text-[13px] text-foreground/75 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              >
                Game Overview
              </Link>
            </li>
            {game.gameConfig.bosses && (
              <li>
                <Link
                  href={`/${gameSlug}/bosses`}
                  className="flex items-center px-2 py-1 text-[13px] text-foreground/75 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                >
                  All Bosses
                </Link>
              </li>
            )}
            {game.gameConfig.areas && (
              <li>
                <Link
                  href={`/${gameSlug}/map`}
                  className="flex items-center px-2 py-1 text-[13px] text-foreground/75 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                >
                  World Map
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="px-3 py-3 border-t border-border/50">
        <Link
          href="/"
          className="flex items-center px-2 py-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          ← All Games
        </Link>
      </div>
    </aside>
  )
}
