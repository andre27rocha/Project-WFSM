import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { games } from '@/db/schema'
import type { Game } from '@/types'

export async function getGameBySlug(slug: string): Promise<Game | null> {
  try {
    const result = await db.query.games.findFirst({
      where: eq(games.slug, slug),
    })
    return result ?? null
  } catch (error) {
    console.error('[getGameBySlug]', error)
    throw new Error('Failed to fetch game')
  }
}

export async function getPublishedGames(): Promise<Game[]> {
  try {
    return await db.query.games.findMany({
      where: eq(games.isPublished, true),
      orderBy: (g, { asc }) => [asc(g.name)],
    })
  } catch (error) {
    console.error('[getPublishedGames]', error)
    throw new Error('Failed to fetch games')
  }
}
