'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { npcSchema, type NpcFormData } from '@/lib/admin/schemas'
import { createNpc, updateNpc, deleteNpc } from '@/lib/supabase/queries/npcs'

type ActionResult = { error: string } | null

function parseCommaList(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function createNpcAction(gameId: string, data: NpcFormData): Promise<ActionResult> {
  const parsed = npcSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  try {
    await createNpc({
      gameId,
      areaId: d.areaId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      isPublished: d.isPublished,
      attributes: {
        role: d.attrRole || undefined,
        questRelated: d.attrQuestRelated,
        services: parseCommaList(d.attrServices),
        dialogueHints: parseCommaList(d.attrDialogueHints),
      },
    })
  } catch {
    return { error: 'Failed to create NPC. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/npcs`)
  redirect(`/admin/games/${gameId}/npcs`)
}

export async function updateNpcAction(id: string, data: NpcFormData): Promise<ActionResult> {
  const parsed = npcSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  let gameId: string | null = null
  try {
    const updated = await updateNpc(id, {
      areaId: d.areaId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      isPublished: d.isPublished,
      attributes: {
        role: d.attrRole || undefined,
        questRelated: d.attrQuestRelated,
        services: parseCommaList(d.attrServices),
        dialogueHints: parseCommaList(d.attrDialogueHints),
      },
    })
    gameId = updated.gameId
  } catch {
    return { error: 'Failed to update NPC. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/npcs`)
  redirect(`/admin/games/${gameId}/npcs`)
}

export async function deleteNpcAction(id: string): Promise<ActionResult> {
  try {
    await deleteNpc(id)
  } catch {
    return { error: 'Failed to delete NPC' }
  }
  return null
}
