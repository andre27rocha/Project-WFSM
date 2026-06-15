import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { items, itemTypes } from '@/db/schema'
import type { Item, ItemType, NewItem, NewItemType } from '@/types'

export type ItemWithType = Item & { itemType: ItemType | null }

export async function getItemBySlug(gameId: string, slug: string): Promise<Item | null> {
  try {
    const result = await db.query.items.findFirst({
      where: and(eq(items.gameId, gameId), eq(items.slug, slug)),
      with: { itemType: true },
    })
    return result ?? null
  } catch (error) {
    console.error('[getItemBySlug]', error)
    throw new Error('Failed to fetch item')
  }
}

export async function getItemById(id: string): Promise<Item | null> {
  try {
    const result = await db.query.items.findFirst({
      where: eq(items.id, id),
    })
    return result ?? null
  } catch (error) {
    console.error('[getItemById]', error)
    throw new Error('Failed to fetch item')
  }
}

export async function getPublishedItemsByGame(gameId: string): Promise<Item[]> {
  try {
    return await db.query.items.findMany({
      where: and(eq(items.gameId, gameId), eq(items.isPublished, true)),
      orderBy: (i, { asc }) => [asc(i.name)],
      with: { itemType: true },
    })
  } catch (error) {
    console.error('[getPublishedItemsByGame]', error)
    throw new Error('Failed to fetch items')
  }
}

export async function getAllItemsByGame(gameId: string): Promise<Item[]> {
  try {
    return await db.query.items.findMany({
      where: eq(items.gameId, gameId),
      orderBy: (i, { asc }) => [asc(i.name)],
    })
  } catch (error) {
    console.error('[getAllItemsByGame]', error)
    throw new Error('Failed to fetch items')
  }
}

export async function getItemTypeBySlug(gameId: string, slug: string): Promise<ItemType | null> {
  try {
    const result = await db.query.itemTypes.findFirst({
      where: and(eq(itemTypes.gameId, gameId), eq(itemTypes.slug, slug)),
    })
    return result ?? null
  } catch (error) {
    console.error('[getItemTypeBySlug]', error)
    throw new Error('Failed to fetch item type')
  }
}

export async function getPublishedItemsByType(gameId: string, typeId: string): Promise<Item[]> {
  try {
    return await db.query.items.findMany({
      where: and(
        eq(items.gameId, gameId),
        eq(items.itemTypeId, typeId),
        eq(items.isPublished, true),
      ),
      orderBy: (i, { asc }) => [asc(i.name)],
    })
  } catch (error) {
    console.error('[getPublishedItemsByType]', error)
    throw new Error('Failed to fetch items by type')
  }
}

export async function getPublishedItemsWithType(gameId: string): Promise<ItemWithType[]> {
  try {
    const result = await db.query.items.findMany({
      where: and(eq(items.gameId, gameId), eq(items.isPublished, true)),
      orderBy: (i, { asc }) => [asc(i.name)],
      with: { itemType: true },
    })
    return result as ItemWithType[]
  } catch (error) {
    console.error('[getPublishedItemsWithType]', error)
    throw new Error('Failed to fetch items with type')
  }
}

export async function getAllItemTypesByGame(gameId: string): Promise<ItemType[]> {
  try {
    return await db.query.itemTypes.findMany({
      where: eq(itemTypes.gameId, gameId),
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
    })
  } catch (error) {
    console.error('[getAllItemTypesByGame]', error)
    throw new Error('Failed to fetch item types')
  }
}

export async function createItem(data: NewItem): Promise<Item> {
  try {
    const [result] = await db.insert(items).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createItem]', error)
    throw new Error('Failed to create item')
  }
}

export async function updateItem(id: string, data: Partial<NewItem>): Promise<Item> {
  try {
    const [result] = await db.update(items).set(data).where(eq(items.id, id)).returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateItem]', error)
    throw new Error('Failed to update item')
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    await db.delete(items).where(eq(items.id, id))
  } catch (error) {
    console.error('[deleteItem]', error)
    throw new Error('Failed to delete item')
  }
}

export async function createItemType(data: NewItemType): Promise<ItemType> {
  try {
    const [result] = await db.insert(itemTypes).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createItemType]', error)
    throw new Error('Failed to create item type')
  }
}
