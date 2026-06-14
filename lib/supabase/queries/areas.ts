import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { areas } from '@/db/schema'
import type { Area } from '@/types'

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
