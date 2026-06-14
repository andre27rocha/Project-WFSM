import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { items } from '@/db/schema'
import type { Item } from '@/types'

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
