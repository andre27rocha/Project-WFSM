import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { bosses, items, npcs } from '@/db/schema'
import type { Boss, Game, Item, ItemType, Npc } from '@/types'

export type FeaturedBoss = Boss & { game: Game }

export type RecentEntry = {
  id: string
  name: string
  kind: 'boss' | 'item' | 'npc'
  label: string
  href: string
  gameName: string
  createdAt: Date
  imageUrl: string | null
}

type BossWithGame = Boss & { game: Game }
type ItemWithGameAndType = Item & { game: Game; itemType: ItemType | null }
type NpcWithGame = Npc & { game: Game }

export async function getFeaturedBoss(): Promise<FeaturedBoss | null> {
  try {
    const result = await db.query.bosses.findFirst({
      where: eq(bosses.isPublished, true),
      orderBy: [desc(bosses.createdAt)],
      with: { game: true },
    })
    return (result as FeaturedBoss | undefined) ?? null
  } catch (error) {
    console.error('[getFeaturedBoss]', error)
    throw new Error('Failed to fetch featured boss')
  }
}

export async function getRecentlyAdded(limit = 8): Promise<RecentEntry[]> {
  try {
    const [recentBosses, recentItems, recentNpcs] = await Promise.all([
      db.query.bosses.findMany({
        where: eq(bosses.isPublished, true),
        orderBy: [desc(bosses.createdAt)],
        limit,
        with: { game: true },
      }),
      db.query.items.findMany({
        where: eq(items.isPublished, true),
        orderBy: [desc(items.createdAt)],
        limit,
        with: { game: true, itemType: true },
      }),
      db.query.npcs.findMany({
        where: eq(npcs.isPublished, true),
        orderBy: [desc(npcs.createdAt)],
        limit,
        with: { game: true },
      }),
    ])

    const bossEntries: RecentEntry[] = (recentBosses as BossWithGame[]).map((b) => ({
      id: b.id,
      name: b.name,
      kind: 'boss',
      label: 'Boss',
      href: `/${b.game.slug}/bosses/${b.slug}`,
      gameName: b.game.name,
      createdAt: b.createdAt,
      imageUrl: b.imageUrl,
    }))

    const itemEntries: RecentEntry[] = (recentItems as ItemWithGameAndType[]).map((i) => ({
      id: i.id,
      name: i.name,
      kind: 'item',
      label: i.itemType?.name ?? 'Item',
      href: `/${i.game.slug}/items/${i.itemType?.slug ?? 'items'}/${i.slug}`,
      gameName: i.game.name,
      createdAt: i.createdAt,
      imageUrl: i.imageUrl,
    }))

    const npcEntries: RecentEntry[] = (recentNpcs as NpcWithGame[]).map((n) => ({
      id: n.id,
      name: n.name,
      kind: 'npc',
      label: 'NPC',
      href: `/${n.game.slug}/npcs/${n.slug}`,
      gameName: n.game.name,
      createdAt: n.createdAt,
      imageUrl: n.imageUrl,
    }))

    return [...bossEntries, ...itemEntries, ...npcEntries]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('[getRecentlyAdded]', error)
    throw new Error('Failed to fetch recently added')
  }
}
