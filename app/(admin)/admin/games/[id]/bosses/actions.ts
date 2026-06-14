'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { bossSchema, type BossFormData } from '@/lib/admin/schemas'
import {
  createBoss,
  updateBoss,
  deleteBoss,
} from '@/lib/supabase/queries/bosses'

type ActionResult = { error: string } | null

function parseIntOrUndefined(val: string): number | undefined {
  if (!val.trim()) return undefined
  const n = parseInt(val, 10)
  return isNaN(n) ? undefined : n
}

function parseCommaList(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function createBossAction(
  gameId: string,
  data: BossFormData
): Promise<ActionResult> {
  const parsed = bossSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  try {
    await createBoss({
      gameId,
      areaId: d.areaId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
      attributes: {
        hp: parseIntOrUndefined(d.attrHp),
        phases: parseIntOrUndefined(d.attrPhases),
        location: d.attrLocation || undefined,
        rewards: parseCommaList(d.attrRewards),
        weaknesses: parseCommaList(d.attrWeaknesses),
        resistances: parseCommaList(d.attrResistances),
      },
    })
  } catch {
    return { error: 'Failed to create boss. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/bosses`)
  redirect(`/admin/games/${gameId}/bosses`)
}

export async function updateBossAction(
  id: string,
  data: BossFormData
): Promise<ActionResult> {
  const parsed = bossSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  let gameId: string | null = null
  try {
    const updated = await updateBoss(id, {
      areaId: d.areaId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
      attributes: {
        hp: parseIntOrUndefined(d.attrHp),
        phases: parseIntOrUndefined(d.attrPhases),
        location: d.attrLocation || undefined,
        rewards: parseCommaList(d.attrRewards),
        weaknesses: parseCommaList(d.attrWeaknesses),
        resistances: parseCommaList(d.attrResistances),
      },
    })
    gameId = updated.gameId
  } catch {
    return { error: 'Failed to update boss. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/bosses`)
  redirect(`/admin/games/${gameId}/bosses`)
}

export async function deleteBossAction(id: string): Promise<ActionResult> {
  try {
    await deleteBoss(id)
  } catch {
    return { error: 'Failed to delete boss' }
  }
  return null
}
