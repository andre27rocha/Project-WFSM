import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { updateGameAction } from '../../actions'
import { GameForm } from '@/components/admin/GameForm'
import type { GameFormData } from '@/lib/admin/schemas'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `Edit ${game.name}` : 'Edit Game' }
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params
  const game = await getGameById(id)
  if (!game) notFound()

  const defaultValues: Partial<GameFormData> = {
    name: game.name,
    slug: game.slug,
    description: game.description ?? '',
    coverImageUrl: game.coverImageUrl ?? '',
    bannerImageUrl: game.bannerImageUrl ?? '',
    releaseYear: game.releaseYear?.toString() ?? '',
    developer: game.developer ?? '',
    gameConfigBosses: Boolean(game.gameConfig.bosses),
    gameConfigNpcs: Boolean(game.gameConfig.npcs),
    gameConfigItems: Boolean(game.gameConfig.items),
    gameConfigAreas: Boolean(game.gameConfig.areas),
    gameConfigTierlist: Boolean(game.gameConfig.tierlist),
    gameConfigRelics: Boolean(game.gameConfig.relics),
    isPublished: game.isPublished,
  }

  const boundAction = updateGameAction.bind(null, id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit: {game.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <GameForm action={boundAction} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
