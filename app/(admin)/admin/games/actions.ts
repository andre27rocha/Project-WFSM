'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { gameSchema, type GameFormData } from '@/lib/admin/schemas'
import {
  createGame,
  updateGame,
  deleteGame,
} from '@/lib/supabase/queries/games'

type ActionResult = { error: string } | null

function parseYear(val: string): number | null {
  if (!val.trim()) return null
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}

export async function createGameAction(data: GameFormData): Promise<ActionResult> {
  const parsed = gameSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  try {
    await createGame({
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      coverImageUrl: d.coverImageUrl || null,
      bannerImageUrl: d.bannerImageUrl || null,
      releaseYear: parseYear(d.releaseYear),
      developer: d.developer || null,
      gameConfig: {
        bosses: d.gameConfigBosses,
        npcs: d.gameConfigNpcs,
        items: d.gameConfigItems,
        areas: d.gameConfigAreas,
        tierlist: d.gameConfigTierlist,
        relics: d.gameConfigRelics,
      },
      isPublished: d.isPublished,
    })
  } catch {
    return { error: 'Failed to create game. The slug may already be in use.' }
  }
  revalidatePath('/admin/games')
  redirect('/admin/games')
}

export async function updateGameAction(id: string, data: GameFormData): Promise<ActionResult> {
  const parsed = gameSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  try {
    await updateGame(id, {
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      coverImageUrl: d.coverImageUrl || null,
      bannerImageUrl: d.bannerImageUrl || null,
      releaseYear: parseYear(d.releaseYear),
      developer: d.developer || null,
      gameConfig: {
        bosses: d.gameConfigBosses,
        npcs: d.gameConfigNpcs,
        items: d.gameConfigItems,
        areas: d.gameConfigAreas,
        tierlist: d.gameConfigTierlist,
        relics: d.gameConfigRelics,
      },
      isPublished: d.isPublished,
    })
  } catch {
    return { error: 'Failed to update game. The slug may already be in use.' }
  }
  revalidatePath('/admin/games')
  revalidatePath(`/admin/games/${id}`)
  redirect('/admin/games')
}

export async function deleteGameAction(id: string): Promise<ActionResult> {
  try {
    await deleteGame(id)
  } catch {
    return { error: 'Failed to delete game' }
  }
  revalidatePath('/admin/games')
  return null
}
