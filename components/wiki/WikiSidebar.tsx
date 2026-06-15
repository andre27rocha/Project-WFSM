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

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1 pt-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">
        {label}
      </span>
      <div className="h-px flex-1 bg-primary/20" />
    </div>
  )
}

export function WikiSidebar({ game, gameSlug }: WikiSidebarProps) {
  const sections = SIDEBAR_SECTIONS.filter(({ key }) => Boolean(game.gameConfig[key]))

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-wiki-border bg-[rgba(8,8,18,0.88)] backdrop-blur-sm lg:sticky lg:top-[6.5rem] lg:flex lg:h-[calc(100vh-6.5rem)] lg:flex-col lg:overflow-y-auto">
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
        <SectionTitle label="Navigation" />
        <ul className="mb-1 border-b border-wiki-border/60">
          {sections.map(({ label, path }) => (
            <li key={path} className="border-b border-wiki-border/40 last:border-b-0">
              <Link href={`/${gameSlug}/${path}`} className={linkCls}>
                <span className="text-[10px] text-primary/40">›</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <SectionTitle label="Quick Links" />
        <ul className="mb-1">
          <li className="border-b border-wiki-border/40">
            <Link href={`/${gameSlug}`} className={linkCls}>
              <span className="text-[10px] text-primary/40">›</span>
              Game Overview
            </Link>
          </li>
          {game.gameConfig.bosses && (
            <li className="border-b border-wiki-border/40">
              <Link href={`/${gameSlug}/bosses`} className={linkCls}>
                <span className="text-[10px] text-primary/40">›</span>
                All Bosses
              </Link>
            </li>
          )}
          {game.gameConfig.areas && (
            <li className="border-b border-wiki-border/40">
              <Link href={`/${gameSlug}/map`} className={linkCls}>
                <span className="text-[10px] text-primary/40">›</span>
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
          className="block text-[11px] text-muted-foreground/50 transition-colors hover:text-primary hover:underline"
        >
          ← All Games
        </Link>
      </div>
    </aside>
  )
}
