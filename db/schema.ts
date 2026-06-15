import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// JSONB attribute types (documented per CLAUDE.md convention)
// ---------------------------------------------------------------------------

/**
 * Controls which wiki modules are active for a game.
 * Read via game.game_config.bosses === true — never hardcode by slug.
 */
export type GameConfig = {
  bosses?: boolean
  npcs?: boolean
  items?: boolean
  areas?: boolean
  tierlist?: boolean
  relics?: boolean
  [key: string]: boolean | undefined
}

/**
 * Boss combat attributes stored in the `attributes` jsonb column.
 * { hp, phases, rewards, weaknesses, resistances, location }
 */
export type BossAttributes = {
  hp?: number
  phases?: number
  rewards?: string[]
  weaknesses?: string[]
  resistances?: string[]
  location?: string
}

/**
 * NPC attributes stored in the `attributes` jsonb column.
 * { role, questRelated, services, dialogueHints }
 */
export type NpcAttributes = {
  role?: string
  questRelated?: boolean
  services?: string[]
  dialogueHints?: string[]
}

/**
 * Item attributes stored in the `attributes` jsonb column.
 * { rarity, stats, effects, howToObtain, stackable }
 */
export type ItemAttributes = {
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  stats?: Record<string, number>
  effects?: string[]
  howToObtain?: string
  stackable?: boolean
}

// ---------------------------------------------------------------------------
// Shared column helpers (DRY — not used as Drizzle column builders directly)
// ---------------------------------------------------------------------------
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

// ---------------------------------------------------------------------------
// TABLES
// ---------------------------------------------------------------------------

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  bannerImageUrl: text('banner_image_url'),
  releaseYear: integer('release_year'),
  developer: text('developer'),
  /** @see GameConfig */
  gameConfig: jsonb('game_config').$type<GameConfig>().notNull().default({}),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
})

export const areas = pgTable(
  'areas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    content: text('content'),
    imageUrl: text('image_url'),
    mapImageUrl: text('map_image_url'),
    /** X position on the world map (0–100, percentage from left). */
    mapX: real('map_x'),
    /** Y position on the world map (0–100, percentage from top). */
    mapY: real('map_y'),
    spoilerLevel: integer('spoiler_level').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    ...timestamps,
  },
  (t) => [unique('areas_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const bosses = pgTable(
  'bosses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    areaId: uuid('area_id').references(() => areas.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    content: text('content'),
    imageUrl: text('image_url'),
    spoilerLevel: integer('spoiler_level').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    /** @see BossAttributes */
    attributes: jsonb('attributes').$type<BossAttributes>().notNull().default({}),
    ...timestamps,
  },
  (t) => [unique('bosses_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const npcs = pgTable(
  'npcs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    areaId: uuid('area_id').references(() => areas.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    content: text('content'),
    imageUrl: text('image_url'),
    spoilerLevel: integer('spoiler_level').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    /** @see NpcAttributes */
    attributes: jsonb('attributes').$type<NpcAttributes>().notNull().default({}),
    ...timestamps,
  },
  (t) => [unique('npcs_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const itemTypes = pgTable(
  'item_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('item_types_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    itemTypeId: uuid('item_type_id').references(() => itemTypes.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    content: text('content'),
    imageUrl: text('image_url'),
    spoilerLevel: integer('spoiler_level').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    /** @see ItemAttributes */
    attributes: jsonb('attributes').$type<ItemAttributes>().notNull().default({}),
    ...timestamps,
  },
  (t) => [unique('items_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const releases = pgTable(
  'releases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    version: text('version').notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content'),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    spoilerLevel: integer('spoiler_level').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    ...timestamps,
  },
  (t) => [unique('releases_game_id_slug_unique').on(t.gameId, t.slug)]
)

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  /** One of: 'boss' | 'npc' | 'item' | 'area' | 'release' */
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const tierListEntries = pgTable(
  'tier_list_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** One of: 'boss' | 'item' */
    tierListType: text('tier_list_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    tier: text('tier').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    unique('tier_list_entries_game_type_entity_unique').on(t.gameId, t.tierListType, t.entityId),
  ]
)

// ---------------------------------------------------------------------------
// RELATIONS (enables db.query.* relational API)
// ---------------------------------------------------------------------------

export const gamesRelations = relations(games, ({ many }) => ({
  areas: many(areas),
  bosses: many(bosses),
  npcs: many(npcs),
  itemTypes: many(itemTypes),
  items: many(items),
  releases: many(releases),
  comments: many(comments),
  tierListEntries: many(tierListEntries),
}))

export const areasRelations = relations(areas, ({ one, many }) => ({
  game: one(games, { fields: [areas.gameId], references: [games.id] }),
  bosses: many(bosses),
  npcs: many(npcs),
}))

export const bossesRelations = relations(bosses, ({ one, many }) => ({
  game: one(games, { fields: [bosses.gameId], references: [games.id] }),
  area: one(areas, { fields: [bosses.areaId], references: [areas.id] }),
  comments: many(comments),
}))

export const npcsRelations = relations(npcs, ({ one, many }) => ({
  game: one(games, { fields: [npcs.gameId], references: [games.id] }),
  area: one(areas, { fields: [npcs.areaId], references: [areas.id] }),
  comments: many(comments),
}))

export const itemTypesRelations = relations(itemTypes, ({ one, many }) => ({
  game: one(games, { fields: [itemTypes.gameId], references: [games.id] }),
  items: many(items),
}))

export const itemsRelations = relations(items, ({ one, many }) => ({
  game: one(games, { fields: [items.gameId], references: [games.id] }),
  itemType: one(itemTypes, { fields: [items.itemTypeId], references: [itemTypes.id] }),
  comments: many(comments),
}))

export const releasesRelations = relations(releases, ({ one, many }) => ({
  game: one(games, { fields: [releases.gameId], references: [games.id] }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  game: one(games, { fields: [comments.gameId], references: [games.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'comment_replies' }),
  replies: many(comments, { relationName: 'comment_replies' }),
}))

export const tierListEntriesRelations = relations(tierListEntries, ({ one }) => ({
  game: one(games, { fields: [tierListEntries.gameId], references: [games.id] }),
}))

// ---------------------------------------------------------------------------
// INFERRED TYPES — import from here or re-export via types/index.ts
// ---------------------------------------------------------------------------

export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert

export type Area = typeof areas.$inferSelect
export type NewArea = typeof areas.$inferInsert

export type Boss = typeof bosses.$inferSelect
export type NewBoss = typeof bosses.$inferInsert

export type Npc = typeof npcs.$inferSelect
export type NewNpc = typeof npcs.$inferInsert

export type ItemType = typeof itemTypes.$inferSelect
export type NewItemType = typeof itemTypes.$inferInsert

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert

export type Release = typeof releases.$inferSelect
export type NewRelease = typeof releases.$inferInsert

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type TierListEntry = typeof tierListEntries.$inferSelect
export type NewTierListEntry = typeof tierListEntries.$inferInsert
