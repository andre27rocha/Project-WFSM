import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGameWithArea } from '@/lib/supabase/queries/bosses'

interface Props {
  params: Promise<{ game: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return { title: `Bosses – ${game.name}`, description: `All bosses in ${game.name}.` }
}

export default async function BossListPage({ params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const bosses = await getPublishedBossesByGameWithArea(game.id)

  return (
    <div className="px-6 py-5">
      <p className="mb-1 text-xs text-muted-foreground">
        <Link href={`/${gameSlug}`} className="hover:text-primary transition-colors">
          {game.name}
        </Link>{' '}
        / Bosses
      </p>
      <h1 className="mb-4 text-xl font-bold text-foreground">Bosses</h1>

      {bosses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bosses yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="w-14 px-3 py-2 text-left" />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Area
                </th>
                <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                  HP
                </th>
                <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                  Phases
                </th>
                <th className="w-8 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {bosses.map((boss, i) => {
                const attrs = boss.attributes
                return (
                  <tr
                    key={boss.id}
                    className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? 'bg-card/25' : ''}`}
                  >
                    <td className="px-3 py-2">
                      {boss.imageUrl ? (
                        <Image
                          src={boss.imageUrl}
                          alt={boss.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${gameSlug}/bosses/${boss.slug}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {boss.name}
                      </Link>
                      {boss.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {boss.description}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                      {boss.area ? (
                        <Link
                          href={`/${gameSlug}/areas/${boss.area.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {boss.area.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden px-3 py-2 font-mono text-muted-foreground md:table-cell">
                      {attrs.hp !== undefined ? attrs.hp.toLocaleString() : '—'}
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                      {attrs.phases !== undefined ? attrs.phases : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {boss.spoilerLevel > 0 && (
                        <span
                          title={`Spoiler level ${boss.spoilerLevel}`}
                          className="text-xs text-amber-500/70"
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
