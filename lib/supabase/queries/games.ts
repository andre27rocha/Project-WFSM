import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { games } from '@/db/schema'
import type { Game, NewGame } from '@/types'

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

export async function getGameById(id: string): Promise<Game | null> {
  try {
    const result = await db.query.games.findFirst({
      where: eq(games.id, id),
    })
    return result ?? null
  } catch (error) {
    console.error('[getGameById]', error)
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

export async function getAllGames(): Promise<Game[]> {
  try {
    return await db.query.games.findMany({
      orderBy: (g, { asc }) => [asc(g.name)],
    })
  } catch (error) {
    console.error('[getAllGames]', error)
    throw new Error('Failed to fetch games')
  }
}

export async function createGame(data: NewGame): Promise<Game> {
  try {
    const [result] = await db.insert(games).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createGame]', error)
    throw new Error('Failed to create game')
  }
}

export async function updateGame(id: string, data: Partial<NewGame>): Promise<Game> {
  try {
    const [result] = await db.update(games).set(data).where(eq(games.id, id)).returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateGame]', error)
    throw new Error('Failed to update game')
  }
}

export async function deleteGame(id: string): Promise<void> {
  try {
    await db.delete(games).where(eq(games.id, id))
  } catch (error) {
    console.error('[deleteGame]', error)
    throw new Error('Failed to delete game')
  }
}
