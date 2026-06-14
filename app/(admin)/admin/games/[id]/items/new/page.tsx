import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { getAllItemTypesByGame } from '@/lib/supabase/queries/items'
import { createItemAction } from '../actions'
import { ItemForm } from '@/components/admin/ItemForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `New Item – ${game.name}` : 'New Item' }
}

export default async function NewItemPage({ params }: Props) {
  const { id } = await params
  const [game, itemTypes] = await Promise.all([getGameById(id), getAllItemTypesByGame(id)])
  if (!game) notFound()

  const boundAction = createItemAction.bind(null, id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">New Item — {game.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <ItemForm
          action={boundAction}
          itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
          cancelHref={`/admin/games/${id}/items`}
        />
      </div>
    </div>
  )
}
