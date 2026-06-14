import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { npcs } from '@/db/schema'
import type { Npc, NewNpc } from '@/types'

export async function getNpcBySlug(gameId: string, slug: string): Promise<Npc | null> {
  try {
    const result = await db.query.npcs.findFirst({
      where: and(eq(npcs.gameId, gameId), eq(npcs.slug, slug)),
      with: { area: true },
    })
    return result ?? null
  } catch (error) {
    console.error('[getNpcBySlug]', error)
    throw new Error('Failed to fetch NPC')
  }
}

export async function getNpcById(id: string): Promise<Npc | null> {
  try {
    const result = await db.query.npcs.findFirst({
      where: eq(npcs.id, id),
    })
    return result ?? null
  } catch (error) {
    console.error('[getNpcById]', error)
    throw new Error('Failed to fetch NPC')
  }
}

export async function getPublishedNpcsByGame(gameId: string): Promise<Npc[]> {
  try {
    return await db.query.npcs.findMany({
      where: and(eq(npcs.gameId, gameId), eq(npcs.isPublished, true)),
      orderBy: (n, { asc }) => [asc(n.name)],
    })
  } catch (error) {
    console.error('[getPublishedNpcsByGame]', error)
    throw new Error('Failed to fetch NPCs')
  }
}

export async function getAllNpcsByGame(gameId: string): Promise<Npc[]> {
  try {
    return await db.query.npcs.findMany({
      where: eq(npcs.gameId, gameId),
      orderBy: (n, { asc }) => [asc(n.name)],
    })
  } catch (error) {
    console.error('[getAllNpcsByGame]', error)
    throw new Error('Failed to fetch NPCs')
  }
}

export async function createNpc(data: NewNpc): Promise<Npc> {
  try {
    const [result] = await db.insert(npcs).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createNpc]', error)
    throw new Error('Failed to create NPC')
  }
}

export async function updateNpc(id: string, data: Partial<NewNpc>): Promise<Npc> {
  try {
    const [result] = await db.update(npcs).set(data).where(eq(npcs.id, id)).returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateNpc]', error)
    throw new Error('Failed to update NPC')
  }
}

export async function deleteNpc(id: string): Promise<void> {
  try {
    await db.delete(npcs).where(eq(npcs.id, id))
  } catch (error) {
    console.error('[deleteNpc]', error)
    throw new Error('Failed to delete NPC')
  }
}
