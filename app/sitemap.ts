export const dynamic = 'force-dynamic'

import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedGames } from '@/lib/supabase/queries/games'
import { getPublishedBossesByGame } from '@/lib/supabase/queries/bosses'
import { getPublishedAreasByGame } from '@/lib/supabase/queries/areas'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'
import { getPublishedItemsByGame } from '@/lib/supabase/queries/items'

const base = siteConfig.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [{ url: base, priority: 1 }]

  const games = await getPublishedGames()

  for (const game of games) {
    entries.push({ url: `${base}/${game.slug}`, priority: 0.9 })

    if (game.gameConfig.bosses) {
      entries.push({ url: `${base}/${game.slug}/bosses`, priority: 0.8 })
      const bosses = await getPublishedBossesByGame(game.id)
      for (const boss of bosses) {
        entries.push({ url: `${base}/${game.slug}/bosses/${boss.slug}`, priority: 0.7 })
      }
    }

    if (game.gameConfig.areas) {
      entries.push({ url: `${base}/${game.slug}/areas`, priority: 0.8 })
      const areas = await getPublishedAreasByGame(game.id)
      for (const area of areas) {
        entries.push({ url: `${base}/${game.slug}/areas/${area.slug}`, priority: 0.7 })
      }
    }

    if (game.gameConfig.npcs) {
      entries.push({ url: `${base}/${game.slug}/npcs`, priority: 0.8 })
      const npcs = await getPublishedNpcsByGame(game.id)
      for (const npc of npcs) {
        entries.push({ url: `${base}/${game.slug}/npcs/${npc.slug}`, priority: 0.6 })
      }
    }

    if (game.gameConfig.items) {
      const items = await getPublishedItemsByGame(game.id)
      for (const item of items) {
        entries.push({
          url: `${base}/${game.slug}/items/${item.itemTypeId ?? 'uncategorized'}/${item.slug}`,
          priority: 0.6,
        })
      }
    }
  }

  return entries
}
