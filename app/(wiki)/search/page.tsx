import Link from 'next/link'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { searchWiki } from '@/lib/supabase/queries/search'
import type { SearchResultType } from '@/lib/supabase/queries/search'

export function generateMetadata(): Metadata {
  return {
    title: 'Search',
    description: 'Search across all games, bosses, items, NPCs, and areas on VaniaCodex.',
    alternates: { canonical: `${siteConfig.url}/search` },
  }
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

const TYPE_LABEL: Record<SearchResultType, string> = {
  boss: 'Boss',
  item: 'Item',
  npc: 'NPC',
  area: 'Area',
}

const TYPE_COLOUR: Record<SearchResultType, string> = {
  boss: 'text-red-400 border-red-400/30 bg-red-400/10',
  item: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  npc: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  area: 'text-green-400 border-green-400/30 bg-green-400/10',
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const results = query ? await searchWiki(query) : []

  const grouped = {
    boss: results.filter((r) => r.type === 'boss'),
    item: results.filter((r) => r.type === 'item'),
    npc: results.filter((r) => r.type === 'npc'),
    area: results.filter((r) => r.type === 'area'),
  } satisfies Record<SearchResultType, typeof results>

  const orderedGroups: SearchResultType[] = ['boss', 'item', 'npc', 'area']

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Search</h1>

      {/* Search form */}
      <form action="/search" method="get" className="mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search bosses, items, NPCs, areas…"
            autoComplete="off"
            autoFocus
            className="flex-1 rounded border border-wiki-border bg-[#1a1a2e] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="rounded border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-background"
          >
            Search
          </button>
        </div>
      </form>

      {/* No query yet */}
      {!query && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Search across all published bosses, items, NPCs, and areas.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Results are found using full-text search — try a boss name, item name, or keyword.
          </p>
        </div>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <div className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No results for <strong className="text-foreground">{'"'}{query}{'"'}</strong>
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Try a shorter or different term.
          </p>
        </div>
      )}

      {/* Results grouped by type */}
      {results.length > 0 && (
        <div className="space-y-8">
          <p className="text-xs text-muted-foreground/60">
            {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
            <strong className="text-foreground/80">{'"'}{query}{'"'}</strong>
          </p>

          {orderedGroups
            .filter((type) => grouped[type].length > 0)
            .map((type) => (
              <section key={type} aria-labelledby={`heading-${type}`}>
                <h2
                  id={`heading-${type}`}
                  className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
                >
                  {TYPE_LABEL[type]}s
                </h2>
                <ul className="space-y-2">
                  {grouped[type].map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.url}
                        className="flex items-start gap-3 rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        {/* Type badge */}
                        <span
                          className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOUR[type]}`}
                        >
                          {TYPE_LABEL[type]}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-primary">{result.name}</p>
                          {result.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {result.description}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-muted-foreground/50">
                            {result.gameName}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}
