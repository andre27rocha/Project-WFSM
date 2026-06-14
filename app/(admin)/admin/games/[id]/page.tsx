import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? game.name : 'Game' }
}

const sections = [
  { label: 'Areas', configKey: 'areas' as const, path: 'areas' },
  { label: 'Bosses', configKey: 'bosses' as const, path: 'bosses' },
  { label: 'NPCs', configKey: 'npcs' as const, path: 'npcs' },
  { label: 'Items', configKey: 'items' as const, path: 'items' },
]

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params
  const game = await getGameById(id)
  if (!game) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/games" className="transition-colors hover:text-primary">
              Games
            </Link>{' '}
            / {game.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">{game.name}</h1>
        </div>
        <Link
          href={`/admin/games/${id}/edit`}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
        >
          Edit Game
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {sections.map(({ label, configKey, path }) => {
          const enabled = Boolean(game.gameConfig[configKey])
          return (
            <Link
              key={label}
              href={`/admin/games/${id}/${path}`}
              className={`rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/50 ${
                !enabled ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <p className="font-semibold text-foreground">{label}</p>
              {!enabled && (
                <p className="mt-1 text-xs text-muted-foreground">Disabled in config</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
