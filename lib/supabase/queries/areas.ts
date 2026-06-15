import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { areas, bosses, npcs } from '@/db/schema'
import type { Area, NewArea } from '@/types'

export type AreaContentCount = { bosses: number; npcs: number }

/**
 * Published boss + NPC counts per area for a game, keyed by area id.
 * Items are not linked to areas in the schema, so only these two are counted.
 */
export async function getAreaContentCounts(
  gameId: string
): Promise<Record<string, AreaContentCount>> {
  try {
    const [bossRows, npcRows] = await Promise.all([
      db
        .select({ areaId: bosses.areaId, count: sql<number>`count(*)::int` })
        .from(bosses)
        .where(and(eq(bosses.gameId, gameId), eq(bosses.isPublished, true)))
        .groupBy(bosses.areaId),
      db
        .select({ areaId: npcs.areaId, count: sql<number>`count(*)::int` })
        .from(npcs)
        .where(and(eq(npcs.gameId, gameId), eq(npcs.isPublished, true)))
        .groupBy(npcs.areaId),
    ])

    const counts: Record<string, AreaContentCount> = {}
    for (const row of bossRows) {
      if (!row.areaId) continue
      counts[row.areaId] ??= { bosses: 0, npcs: 0 }
      counts[row.areaId].bosses = row.count
    }
    for (const row of npcRows) {
      if (!row.areaId) continue
      counts[row.areaId] ??= { bosses: 0, npcs: 0 }
      counts[row.areaId].npcs = row.count
    }
    return counts
  } catch (error) {
    console.error('[getAreaContentCounts]', error)
    throw new Error('Failed to fetch area content counts')
  }
}

export async function getAreaBySlug(gameId: string, slug: string): Promise<Area | null> {
  try {
    const result = await db.query.areas.findFirst({
      where: and(eq(areas.gameId, gameId), eq(areas.slug, slug)),
    })
    return result ?? null
  } catch (error) {
    console.error('[getAreaBySlug]', error)
    throw new Error('Failed to fetch area')
  }
}

export async function getAreaById(id: string): Promise<Area | null> {
  try {
    const result = await db.query.areas.findFirst({
      where: eq(areas.id, id),
    })
    return result ?? null
  } catch (error) {
    console.error('[getAreaById]', error)
    throw new Error('Failed to fetch area')
  }
}

export async function getPublishedAreasByGame(gameId: string): Promise<Area[]> {
  try {
    return await db.query.areas.findMany({
      where: and(eq(areas.gameId, gameId), eq(areas.isPublished, true)),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.name)],
    })
  } catch (error) {
    console.error('[getPublishedAreasByGame]', error)
    throw new Error('Failed to fetch areas')
  }
}

export async function getAllAreasByGame(gameId: string): Promise<Area[]> {
  try {
    return await db.query.areas.findMany({
      where: eq(areas.gameId, gameId),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.name)],
    })
  } catch (error) {
    console.error('[getAllAreasByGame]', error)
    throw new Error('Failed to fetch areas')
  }
}

export async function createArea(data: NewArea): Promise<Area> {
  try {
    const [result] = await db.insert(areas).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createArea]', error)
    throw new Error('Failed to create area')
  }
}

export async function updateArea(id: string, data: Partial<NewArea>): Promise<Area> {
  try {
    const [result] = await db.update(areas).set(data).where(eq(areas.id, id)).returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateArea]', error)
    throw new Error('Failed to update area')
  }
}

export async function deleteArea(id: string): Promise<void> {
  try {
    await db.delete(areas).where(eq(areas.id, id))
  } catch (error) {
    console.error('[deleteArea]', error)
    throw new Error('Failed to delete area')
  }
}
