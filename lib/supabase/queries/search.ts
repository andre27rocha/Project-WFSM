import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { bosses, items, itemTypes, npcs, areas, games } from '@/db/schema'

export type SearchResultType = 'boss' | 'item' | 'npc' | 'area'

export type SearchResult = {
  id: string
  type: SearchResultType
  name: string
  description: string | null
  imageUrl: string | null
  slug: string
  url: string
  gameSlug: string
  gameName: string
}

function ftsWhere(nameCol: unknown, descCol: unknown, query: string) {
  return sql`to_tsvector('english', ${nameCol} || ' ' || coalesce(${descCol}, '')) @@ plainto_tsquery('english', ${query})`
}

export async function searchWiki(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  try {
    const [bossRows, itemRows, npcRows, areaRows] = await Promise.all([
      db
        .select({
          id: bosses.id,
          name: bosses.name,
          description: bosses.description,
          imageUrl: bosses.imageUrl,
          slug: bosses.slug,
          gameSlug: games.slug,
          gameName: games.name,
        })
        .from(bosses)
        .innerJoin(games, eq(bosses.gameId, games.id))
        .where(
          and(
            eq(bosses.isPublished, true),
            eq(games.isPublished, true),
            ftsWhere(bosses.name, bosses.description, query)
          )
        )
        .limit(10),

      db
        .select({
          id: items.id,
          name: items.name,
          description: items.description,
          imageUrl: items.imageUrl,
          slug: items.slug,
          typeSlug: itemTypes.slug,
          gameSlug: games.slug,
          gameName: games.name,
        })
        .from(items)
        .innerJoin(itemTypes, eq(items.itemTypeId, itemTypes.id))
        .innerJoin(games, eq(items.gameId, games.id))
        .where(
          and(
            eq(items.isPublished, true),
            eq(games.isPublished, true),
            ftsWhere(items.name, items.description, query)
          )
        )
        .limit(10),

      db
        .select({
          id: npcs.id,
          name: npcs.name,
          description: npcs.description,
          imageUrl: npcs.imageUrl,
          slug: npcs.slug,
          gameSlug: games.slug,
          gameName: games.name,
        })
        .from(npcs)
        .innerJoin(games, eq(npcs.gameId, games.id))
        .where(
          and(
            eq(npcs.isPublished, true),
            eq(games.isPublished, true),
            ftsWhere(npcs.name, npcs.description, query)
          )
        )
        .limit(10),

      db
        .select({
          id: areas.id,
          name: areas.name,
          description: areas.description,
          imageUrl: areas.imageUrl,
          slug: areas.slug,
          gameSlug: games.slug,
          gameName: games.name,
        })
        .from(areas)
        .innerJoin(games, eq(areas.gameId, games.id))
        .where(
          and(
            eq(areas.isPublished, true),
            eq(games.isPublished, true),
            ftsWhere(areas.name, areas.description, query)
          )
        )
        .limit(10),
    ])

    const results: SearchResult[] = [
      ...bossRows.map((r) => ({
        ...r,
        type: 'boss' as const,
        url: `/${r.gameSlug}/bosses/${r.slug}`,
      })),
      ...itemRows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        slug: r.slug,
        gameSlug: r.gameSlug,
        gameName: r.gameName,
        type: 'item' as const,
        url: `/${r.gameSlug}/items/${r.typeSlug}/${r.slug}`,
      })),
      ...npcRows.map((r) => ({
        ...r,
        type: 'npc' as const,
        url: `/${r.gameSlug}/npcs/${r.slug}`,
      })),
      ...areaRows.map((r) => ({
        ...r,
        type: 'area' as const,
        url: `/${r.gameSlug}/areas/${r.slug}`,
      })),
    ]

    return results
  } catch (error) {
    console.error('[searchWiki]', error)
    throw new Error('Failed to search wiki')
  }
}
