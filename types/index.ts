// Re-export all Drizzle-inferred types from a single location.
// Use these everywhere instead of importing directly from db/schema.ts.
export type {
  Achievement,
  Area,
  Boss,
  BossAttributes,
  Comment,
  Game,
  GameConfig,
  Item,
  ItemAttributes,
  ItemType,
  NewAchievement,
  NewArea,
  NewBoss,
  NewComment,
  NewGame,
  NewItem,
  NewItemType,
  NewNpc,
  NewRelease,
  NewReleaseCalendar,
  NewTierListEntry,
  Npc,
  NpcAttributes,
  Release,
  ReleaseCalendar,
  TierListEntry,
} from '@/db/schema'

export type { BossWithArea } from '@/lib/supabase/queries/bosses'
export type { ItemWithType } from '@/lib/supabase/queries/items'

export type TierLevel = 'S' | 'A' | 'B' | 'C' | 'D'

export type TierListState = {
  [K in TierLevel]: string[]
}

export type TierListItem = {
  id: string
  name: string
  imageUrl?: string | null
}
