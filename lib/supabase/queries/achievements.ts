import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { achievements } from '@/db/schema'
import type { Achievement, NewAchievement } from '@/types'

export async function getPublishedAchievementsByGame(gameId: string): Promise<Achievement[]> {
  try {
    return await db.query.achievements.findMany({
      where: and(eq(achievements.gameId, gameId), eq(achievements.isPublished, true)),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.name)],
    })
  } catch (error) {
    console.error('[getPublishedAchievementsByGame]', error)
    throw new Error('Failed to fetch achievements')
  }
}

export async function getAchievementBySlug(
  gameId: string,
  slug: string
): Promise<Achievement | null> {
  try {
    const result = await db.query.achievements.findFirst({
      where: and(eq(achievements.gameId, gameId), eq(achievements.slug, slug)),
    })
    return result ?? null
  } catch (error) {
    console.error('[getAchievementBySlug]', error)
    throw new Error('Failed to fetch achievement')
  }
}

export async function getAllAchievementsByGame(gameId: string): Promise<Achievement[]> {
  try {
    return await db.query.achievements.findMany({
      where: eq(achievements.gameId, gameId),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.name)],
    })
  } catch (error) {
    console.error('[getAllAchievementsByGame]', error)
    throw new Error('Failed to fetch achievements')
  }
}

export async function createAchievement(data: NewAchievement): Promise<Achievement> {
  try {
    const [result] = await db.insert(achievements).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createAchievement]', error)
    throw new Error('Failed to create achievement')
  }
}

export async function updateAchievement(
  id: string,
  data: Partial<NewAchievement>
): Promise<Achievement> {
  try {
    const [result] = await db
      .update(achievements)
      .set(data)
      .where(eq(achievements.id, id))
      .returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateAchievement]', error)
    throw new Error('Failed to update achievement')
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  try {
    await db.delete(achievements).where(eq(achievements.id, id))
  } catch (error) {
    console.error('[deleteAchievement]', error)
    throw new Error('Failed to delete achievement')
  }
}
