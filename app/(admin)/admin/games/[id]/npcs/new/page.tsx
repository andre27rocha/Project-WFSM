import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { getAllAreasByGame } from '@/lib/supabase/queries/areas'
import { createNpcAction } from '../actions'
import { NpcForm } from '@/components/admin/NpcForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `New NPC – ${game.name}` : 'New NPC' }
}

export default async function NewNpcPage({ params }: Props) {
  const { id } = await params
  const [game, areas] = await Promise.all([getGameById(id), getAllAreasByGame(id)])
  if (!game) notFound()

  const boundAction = createNpcAction.bind(null, id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">New NPC — {game.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <NpcForm
          action={boundAction}
          areas={areas.map((a) => ({ id: a.id, name: a.name }))}
          cancelHref={`/admin/games/${id}/npcs`}
        />
      </div>
    </div>
  )
}
