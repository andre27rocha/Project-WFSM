import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'
import { WikiImage } from '@/components/wiki/WikiImage'

const sectionLabel =
  'mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60'

/**
 * Global app-shell sidebar. Sticky under the 48px header, shows site-wide
 * navigation and the list of published games with their covers. Hidden on
 * small screens — the header nav covers those.
 */
export async function Sidebar() {
  const games = await getPublishedGames()

  return (
    <aside className="border-wiki-border bg-wiki-sidebar sticky top-12 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col overflow-y-auto border-r lg:flex">
      {/* Browse */}
      <nav className="px-3 py-4" aria-label="Site navigation">
        <p className={sectionLabel}>Browse</p>
        <ul className="flex flex-col gap-0.5">
          {siteConfig.nav.main.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-foreground/80 hover:bg-primary/10 hover:text-primary block rounded px-2 py-1.5 text-sm transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-wiki-border mx-3 border-t" />

      {/* Games */}
      <nav className="px-3 py-4" aria-label="Games">
        <p className={sectionLabel}>Games</p>
        {games.length === 0 ? (
          <p className="text-muted-foreground/60 px-2 text-xs">No games yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/${game.slug}`}
                  className="group hover:bg-primary/10 flex items-center gap-2.5 rounded px-2 py-1.5 transition-colors"
                >
                  <span className="border-wiki-border relative h-10 w-7 shrink-0 overflow-hidden rounded-sm border">
                    <WikiImage
                      src={game.coverImageUrl}
                      alt={game.name}
                      fill
                      sizes="28px"
                      compact
                      className="object-cover"
                    />
                  </span>
                  <span className="text-foreground/80 group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors">
                    {game.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  )
}
