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

const linkCls =
  'flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-primary/80 hover:text-primary hover:underline hover:underline-offset-2 transition-colors'

interface WikiSidebarProps {
  game: Game
  gameSlug: string
}

export function WikiSidebar({ game, gameSlug }: WikiSidebarProps) {
  const sections = SIDEBAR_SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <aside className="hidden lg:flex lg:flex-col w-[220px] shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-wiki-border bg-wiki-sidebar">
      {/* Game title */}
      <div className="border-b border-wiki-border px-3 py-3">
        <Link
          href={`/${gameSlug}`}
          className="block text-[11px] font-bold uppercase tracking-widest text-primary hover:underline hover:underline-offset-2 transition-colors"
        >
          {game.name}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-wiki-border px-3 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
            Navigation
          </p>
        </div>
        <ul className="border-b border-wiki-border">
          {sections.map(({ label, path }) => (
            <li key={path} className="border-b border-wiki-border/60 last:border-b-0">
              <Link href={`/${gameSlug}/${path}`} className={linkCls}>
                <span className="text-muted-foreground/40 text-[10px]">›</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Quick Links */}
        <div className="border-b border-wiki-border px-3 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
            Quick Links
          </p>
        </div>
        <ul>
          <li className="border-b border-wiki-border/60">
            <Link href={`/${gameSlug}`} className={linkCls}>
              <span className="text-muted-foreground/40 text-[10px]">›</span>
              Game Overview
            </Link>
          </li>
          {game.gameConfig.bosses && (
            <li className="border-b border-wiki-border/60">
              <Link href={`/${gameSlug}/bosses`} className={linkCls}>
                <span className="text-muted-foreground/40 text-[10px]">›</span>
                All Bosses
              </Link>
            </li>
          )}
          {game.gameConfig.areas && (
            <li className="border-b border-wiki-border/60">
              <Link href={`/${gameSlug}/map`} className={linkCls}>
                <span className="text-muted-foreground/40 text-[10px]">›</span>
                World Map
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-wiki-border px-3 py-2">
        <Link
          href="/"
          className="block text-[11px] text-muted-foreground/50 hover:text-primary hover:underline transition-colors"
        >
          ← All Games
        </Link>
      </div>
    </aside>
  )
}
