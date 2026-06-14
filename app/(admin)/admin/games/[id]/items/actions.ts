'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { itemSchema, type ItemFormData } from '@/lib/admin/schemas'
import { createItem, updateItem, deleteItem } from '@/lib/supabase/queries/items'
import type { ItemAttributes } from '@/types'

type ActionResult = { error: string } | null

function parseCommaList(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function createItemAction(gameId: string, data: ItemFormData): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  const attributes: ItemAttributes = {
    howToObtain: d.attrHowToObtain || undefined,
    stackable: d.attrStackable,
    effects: parseCommaList(d.attrEffects),
  }
  if (d.attrRarity) {
    attributes.rarity = d.attrRarity as ItemAttributes['rarity']
  }
  try {
    await createItem({
      gameId,
      itemTypeId: d.itemTypeId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      isPublished: d.isPublished,
      attributes,
    })
  } catch {
    return { error: 'Failed to create item. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/items`)
  redirect(`/admin/games/${gameId}/items`)
}

export async function updateItemAction(id: string, data: ItemFormData): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }
  const d = parsed.data
  const attributes: ItemAttributes = {
    howToObtain: d.attrHowToObtain || undefined,
    stackable: d.attrStackable,
    effects: parseCommaList(d.attrEffects),
  }
  if (d.attrRarity) {
    attributes.rarity = d.attrRarity as ItemAttributes['rarity']
  }
  let gameId: string | null = null
  try {
    const updated = await updateItem(id, {
      itemTypeId: d.itemTypeId || null,
      name: d.name,
      slug: d.slug,
      description: d.description || null,
      content: d.content || null,
      imageUrl: d.imageUrl || null,
      spoilerLevel: d.spoilerLevel,
      isPublished: d.isPublished,
      attributes,
    })
    gameId = updated.gameId
  } catch {
    return { error: 'Failed to update item. The slug may already be in use.' }
  }
  revalidatePath(`/admin/games/${gameId}/items`)
  redirect(`/admin/games/${gameId}/items`)
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  try {
    await deleteItem(id)
  } catch {
    return { error: 'Failed to delete item' }
  }
  return null
}
