import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { bosses } from '@/db/schema'
import type { Area, Boss, NewBoss } from '@/types'

export type BossWithArea = Boss & { area: Area | null }

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

export async function getBossById(id: string): Promise<Boss | null> {
  try {
    const result = await db.query.bosses.findFirst({
      where: eq(bosses.id, id),
    })
    return result ?? null
  } catch (error) {
    console.error('[getBossById]', error)
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

export async function getPublishedBossesByGameWithArea(gameId: string): Promise<BossWithArea[]> {
  try {
    const result = await db.query.bosses.findMany({
      where: and(eq(bosses.gameId, gameId), eq(bosses.isPublished, true)),
      orderBy: (b, { asc }) => [asc(b.sortOrder), asc(b.name)],
      with: { area: true },
    })
    return result as BossWithArea[]
  } catch (error) {
    console.error('[getPublishedBossesByGameWithArea]', error)
    throw new Error('Failed to fetch bosses')
  }
}

export async function getAllBossesByGame(gameId: string): Promise<Boss[]> {
  try {
    return await db.query.bosses.findMany({
      where: eq(bosses.gameId, gameId),
      orderBy: (b, { asc }) => [asc(b.sortOrder), asc(b.name)],
    })
  } catch (error) {
    console.error('[getAllBossesByGame]', error)
    throw new Error('Failed to fetch bosses')
  }
}

export async function createBoss(data: NewBoss): Promise<Boss> {
  try {
    const [result] = await db.insert(bosses).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createBoss]', error)
    throw new Error('Failed to create boss')
  }
}

export async function updateBoss(id: string, data: Partial<NewBoss>): Promise<Boss> {
  try {
    const [result] = await db.update(bosses).set(data).where(eq(bosses.id, id)).returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateBoss]', error)
    throw new Error('Failed to update boss')
  }
}

export async function deleteBoss(id: string): Promise<void> {
  try {
    await db.delete(bosses).where(eq(bosses.id, id))
  } catch (error) {
    console.error('[deleteBoss]', error)
    throw new Error('Failed to delete boss')
  }
}
