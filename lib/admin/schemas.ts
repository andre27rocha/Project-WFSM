import { z } from 'zod'

const slugField = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and hyphens only')

const spoilerLevel = z.number().int().min(0).max(5)
const sortOrder = z.number().int().min(0)

export const gameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  description: z.string(),
  coverImageUrl: z.string(),
  bannerImageUrl: z.string(),
  releaseYear: z.string(),
  developer: z.string(),
  gameConfigBosses: z.boolean(),
  gameConfigNpcs: z.boolean(),
  gameConfigItems: z.boolean(),
  gameConfigAreas: z.boolean(),
  gameConfigTierlist: z.boolean(),
  gameConfigRelics: z.boolean(),
  isPublished: z.boolean(),
})
export type GameFormData = z.infer<typeof gameSchema>

export const areaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  description: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  mapImageUrl: z.string(),
  mapX: z.string(),
  mapY: z.string(),
  spoilerLevel,
  sortOrder,
  isPublished: z.boolean(),
})
export type AreaFormData = z.infer<typeof areaSchema>

export const bossSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  areaId: z.string(),
  description: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  spoilerLevel,
  sortOrder,
  isPublished: z.boolean(),
  attrHp: z.string(),
  attrPhases: z.string(),
  attrLocation: z.string(),
  attrRewards: z.string(),
  attrWeaknesses: z.string(),
  attrResistances: z.string(),
})
export type BossFormData = z.infer<typeof bossSchema>

export const npcSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  areaId: z.string(),
  description: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  spoilerLevel,
  isPublished: z.boolean(),
  attrRole: z.string(),
  attrQuestRelated: z.boolean(),
  attrServices: z.string(),
  attrDialogueHints: z.string(),
})
export type NpcFormData = z.infer<typeof npcSchema>

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  itemTypeId: z.string(),
  description: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  spoilerLevel,
  isPublished: z.boolean(),
  attrRarity: z.enum(['', 'common', 'uncommon', 'rare', 'epic', 'legendary']),
  attrHowToObtain: z.string(),
  attrStackable: z.boolean(),
  attrEffects: z.string(),
})
export type ItemFormData = z.infer<typeof itemSchema>
