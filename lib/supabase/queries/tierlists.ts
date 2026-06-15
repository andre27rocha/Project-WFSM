import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { items, games } from '@/db/schema'
import type { TierListItem } from '@/types'

export async function getGameTierListItems(
  gameId: string,
  itemTypeId?: string,
): Promise<TierListItem[]> {
  try {
    const whereClause = itemTypeId
      ? and(eq(items.gameId, gameId), eq(items.isPublished, true), eq(items.itemTypeId, itemTypeId))
      : and(eq(items.gameId, gameId), eq(items.isPublished, true))
    const results = await db.query.items.findMany({
      where: whereClause,
      orderBy: (i, { asc }) => [asc(i.name)],
    })
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      imageUrl: r.imageUrl,
    }))
  } catch (error) {
    console.error('[getGameTierListItems]', error)
    throw new Error('Failed to fetch tier list items')
  }
}

export async function getGlobalTierListItems(): Promise<TierListItem[]> {
  try {
    const results = await db.query.games.findMany({
      where: eq(games.isPublished, true),
      orderBy: (g, { asc }) => [asc(g.name)],
    })
    return results.map((g) => ({
      id: g.id,
      name: g.name,
      imageUrl: g.coverImageUrl,
    }))
  } catch (error) {
    console.error('[getGlobalTierListItems]', error)
    throw new Error('Failed to fetch global tier list items')
  }
}
