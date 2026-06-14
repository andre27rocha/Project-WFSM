import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { npcs } from '@/db/schema'
import type { Npc } from '@/types'

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
