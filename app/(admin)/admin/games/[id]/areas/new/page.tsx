import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { createAreaAction } from '../actions'
import { AreaForm } from '@/components/admin/AreaForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `New Area – ${game.name}` : 'New Area' }
}

export default async function NewAreaPage({ params }: Props) {
  const { id } = await params
  const game = await getGameById(id)
  if (!game) notFound()

  const boundAction = createAreaAction.bind(null, id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">New Area — {game.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <AreaForm action={boundAction} cancelHref={`/admin/games/${id}/areas`} />
      </div>
    </div>
  )
}
