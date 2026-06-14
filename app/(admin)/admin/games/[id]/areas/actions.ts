'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { areaSchema, type AreaFormData } from '@/lib/admin/schemas'
import {
  createArea,
  updateArea,
  deleteArea,
} from '@/lib/supabase/queries/areas'

type ActionResult = { error: string } | null

export async function createAreaAction(
  gameId: string,
  data: AreaFormData
): Promise<ActionResult> {
  const parsed = areaSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  try {
    await createArea({
      gameId,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      mapImageUrl: d.mapImageUrl || null,
      spoilerLevel: d.spoilerLevel,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
    })
  } catch {
    return { error: 'Failed to create area. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/areas`)
  redirect(`/admin/games/${gameId}/areas`)
}

export async function updateAreaAction(
  id: string,
  data: AreaFormData
): Promise<ActionResult> {
  const parsed = areaSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  let gameId: string | null = null
  try {
    const updated = await updateArea(id, {
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      mapImageUrl: d.mapImageUrl || null,
      spoilerLevel: d.spoilerLevel,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
    })
    gameId = updated.gameId
  } catch {
    return { error: 'Failed to update area. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/areas`)
  redirect(`/admin/games/${gameId}/areas`)
}

export async function deleteAreaAction(id: string): Promise<ActionResult> {
  try {
    await deleteArea(id)
  } catch {
    return { error: 'Failed to delete area' }
  }
  return null
}
