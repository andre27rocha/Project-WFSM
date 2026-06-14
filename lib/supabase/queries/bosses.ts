import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { bosses } from '@/db/schema'
import type { Boss } from '@/types'

export async function getBossBySlug(gameId: string, slug: string): Promise<Boss | null> {
  try {
    const result = await db.query.bosses.findFirst({
      where: and(eq(bosses.gameId, gameId), eq(bosses.slug, slug)),
      with: { area: true },
    })
    return result ?? null
  } catch (error) {
    console.error('[getBossBySlug]', error)
    throw new Error('Failed to fetch boss')
  }
}

export async function getPublishedBossesByGame(gameId: string): Promise<Boss[]> {
  try {
    return await db.query.bosses.findMany({
      where: and(eq(bosses.gameId, gameId), eq(bosses.isPublished, true)),
      orderBy: (b, { asc }) => [asc(b.sortOrder), asc(b.name)],
    })
  } catch (error) {
    console.error('[getPublishedBossesByGame]', error)
    throw new Error('Failed to fetch bosses')
  }
}
