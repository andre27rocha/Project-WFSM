export const dynamic = 'force-dynamic'

import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'
import { getPublishedItemsWithType } from '@/lib/supabase/queries/items'

const base = siteConfig.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: base, priority: 1 },
    { url: `${base}/tierlist`, priority: 0.7 },
  ]

  const games = await getPublishedGames()

  for (const game of games) {
    entries.push({
      url: `${base}/${game.slug}`,
      lastModified: game.updatedAt,
      priority: 0.9,
    })

    if (game.gameConfig.tierlist) {
      entries.push({ url: `${base}/${game.slug}/tierlist`, priority: 0.7 })
    }

    if (game.gameConfig.bosses) {
      entries.push({ url: `${base}/${game.slug}/bosses`, priority: 0.8 })
      const bosses = await getPublishedBossesByGame(game.id)
      for (const boss of bosses) {
        entries.push({
          url: `${base}/${game.slug}/bosses/${boss.slug}`,
          lastModified: boss.updatedAt,
          priority: 0.7,
        })
      }
    }

    if (game.gameConfig.areas) {
      entries.push({ url: `${base}/${game.slug}/areas`, priority: 0.8 })
      entries.push({ url: `${base}/${game.slug}/map`, priority: 0.6 })
      const areas = await getPublishedAreasByGame(game.id)
      for (const area of areas) {
        entries.push({
          url: `${base}/${game.slug}/areas/${area.slug}`,
          lastModified: area.updatedAt,
          priority: 0.7,
        })
      }
    }

    if (game.gameConfig.npcs) {
      entries.push({ url: `${base}/${game.slug}/npcs`, priority: 0.8 })
      const npcs = await getPublishedNpcsByGame(game.id)
      for (const npc of npcs) {
        entries.push({
          url: `${base}/${game.slug}/npcs/${npc.slug}`,
          lastModified: npc.updatedAt,
          priority: 0.6,
        })
      }
    }

    // Items — all published items regardless of which gameConfig keys are used
    // (e.g. spirits/relics use separate keys, not the generic 'items' key)
    const allItems = await getPublishedItemsWithType(game.id)
    const itemTypesSeen = new Set<string>()
    for (const item of allItems) {
      if (!item.itemType) continue
      const typeSlug = item.itemType.slug
      if (!itemTypesSeen.has(typeSlug)) {
        itemTypesSeen.add(typeSlug)
        entries.push({ url: `${base}/${game.slug}/items/${typeSlug}`, priority: 0.8 })
      }
      entries.push({
        url: `${base}/${game.slug}/items/${typeSlug}/${item.slug}`,
        lastModified: item.updatedAt,
        priority: 0.6,
      })
    }
  }

  return entries
}
