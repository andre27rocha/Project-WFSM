import Link from 'next/link'
import type { Game } from '@/types'

interface Props {
  game: Game
  gameSlug: string
}

type NavItem = { label: string; href: string }
type NavSection = { label: string; items: NavItem[] }

export function GameNav({ game, gameSlug }: Props) {
  const gc = game.gameConfig

  const sections: NavSection[] = [
    {
      label: 'General',
      items: [{ label: 'Overview', href: `/${gameSlug}` }],
    },
    ...(gc.bosses
      ? [{ label: 'Bosses', items: [{ label: 'All Bosses', href: `/${gameSlug}/bosses` }] }]
      : []),
    ...(gc.spirits || gc.relics || gc.items
      ? [
          {
            label: 'Items',
            items: [
              ...(gc.spirits ? [{ label: 'Spirits', href: `/${gameSlug}/items/spirits` }] : []),
              ...(gc.relics ? [{ label: 'Relics', href: `/${gameSlug}/items/relics` }] : []),
              ...(gc.items ? [{ label: 'All Items', href: `/${gameSlug}/items` }] : []),
            ],
          },
        ]
      : []),
    ...(gc.npcs
      ? [{ label: 'Characters', items: [{ label: 'NPCs', href: `/${gameSlug}/npcs` }] }]
      : []),
    ...(gc.areas
      ? [
          {
            label: 'World',
            items: [
              { label: 'Areas', href: `/${gameSlug}/areas` },
              { label: 'Interactive Map', href: `/${gameSlug}/map` },
            ],
          },
        ]
      : []),
    ...(gc.tierlist
      ? [{ label: 'Guides', items: [{ label: 'Tier List', href: `/${gameSlug}/tierlist` }] }]
      : []),
  ]

  return (
    <nav
      className="sticky top-16 z-40 hidden h-10 shrink-0 border-b border-wiki-border bg-[rgba(8,8,18,0.94)] backdrop-blur-sm lg:block"
      aria-label={`${game.name} navigation`}
    >
      <ul className="flex h-full items-stretch gap-0">
        {sections.map((section) =>
          section.items.length === 1 ? (
            <li key={section.label}>
              <Link
                href={section.items[0].href}
                className="flex h-full items-center px-4 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-primary/8 hover:text-primary"
              >
                {section.label}
              </Link>
            </li>
          ) : (
            <li key={section.label} className="group relative">
              <div className="flex h-full cursor-default select-none items-center gap-1 px-4 text-[13px] font-medium text-foreground/70 transition-colors group-hover:bg-primary/8 group-hover:text-primary">
                {section.label}
                <span className="text-[9px] text-muted-foreground/50">▾</span>
              </div>
              <div className="absolute left-0 top-full z-50 hidden min-w-[160px] border border-wiki-border bg-[rgba(8,8,18,0.97)] shadow-xl backdrop-blur-sm group-hover:block">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-[13px] text-foreground/70 transition-colors hover:bg-primary/8 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
