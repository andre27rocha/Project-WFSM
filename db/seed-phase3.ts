/**
 * Phase 3 seed — Blasphemous, Salt and Sanctuary, Ender Magnolia.
 * Run with: npm run db:seed:phase3
 *
 * All inserts use onConflictDoNothing so the script is safe to re-run.
 * Games are inserted as isPublished: false — publish via admin when content is ready.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set in .env.local')

const client = postgres(url, { max: 1, prepare: false })
const db = drizzle(client, { schema })

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Blasphemous ─────────────────────────────────────────────────────────────

const BLASPHEMOUS_AREAS = [
  { name: 'Albero', description: 'The last surviving town in Cvstodia, a refuge for those untouched by The Miracle. Serves as the central hub.', mapX: 45, mapY: 55, sortOrder: 1 },
  { name: 'Wasteland of the Buried Churches', description: 'A vast desert where ancient churches have sunk into the earth. The first true region of the Penitent One\'s journey.', mapX: 25, mapY: 50, sortOrder: 2 },
  { name: 'Desecrated Cistern', description: 'Flooded underground passages beneath the city, corrupted by The Miracle\'s influence.', mapX: 40, mapY: 75, sortOrder: 3 },
  { name: 'Convent of Our Lady of the Charred Visage', description: 'A scorched convent where devoted nuns burned themselves to honour a miraculous vision. Their faith became their pyre.', mapX: 60, mapY: 35, sortOrder: 4 },
  { name: 'Rooftops of the Sleeping City', description: 'The upper reaches of a great city whose inhabitants sleep an unending sleep brought by The Miracle.', mapX: 55, mapY: 25, sortOrder: 5 },
  { name: 'Mountains of the Endless Dusk', description: 'Remote peaks perpetually bathed in a sunset that never arrives. The air smells of incense and old blood.', mapX: 75, mapY: 30, sortOrder: 6 },
  { name: 'Library of the Negated Words', description: 'A vast library where forbidden knowledge was sealed away. The books here contain words that unmake reality.', mapX: 30, mapY: 30, sortOrder: 7 },
]

const BLASPHEMOUS_BOSSES = [
  {
    name: 'Our Lady of the Charred Visage',
    areaSlug: 'convent-of-our-lady-of-the-charred-visage',
    description: 'A towering effigy of devotion consumed by holy fire. Her burning tears scald the ground below.',
    attributes: { hp: 3200, phases: 2, location: 'Convent of Our Lady of the Charred Visage', rewards: ['Visage Bead', 'Tears of Atonement'], weaknesses: ['Bleed'], resistances: ['Fire'] },
    sortOrder: 1, spoilerLevel: 0,
  },
  {
    name: 'Warden of the Silent Sorrow',
    areaSlug: 'wasteland-of-the-buried-churches',
    description: 'A massive armoured sentinel that guards the oldest of the buried churches with a flail and an impenetrable faith.',
    attributes: { hp: 2800, phases: 1, location: 'Wasteland of the Buried Churches', rewards: ['Reliquary', 'Rosary Cord'], weaknesses: ['Lightning'], resistances: ['Physical'] },
    sortOrder: 2, spoilerLevel: 0,
  },
  {
    name: 'Ten Piedad',
    areaSlug: 'desecrated-cistern',
    description: 'A monstrous amalgamation of guilt and flesh floating in the fetid waters of the cistern, endlessly weeping.',
    attributes: { hp: 3800, phases: 2, location: 'Desecrated Cistern', rewards: ['Guilt Fragment', 'Thorn Charm'], weaknesses: ['Fire'], resistances: ['Water'] },
    sortOrder: 3, spoilerLevel: 0,
  },
  {
    name: 'Tres Angustias',
    areaSlug: 'wasteland-of-the-buried-churches',
    description: 'Three sisters bound by their shared penance, fighting as one. Each carries a different weapon; each fights with the same zealotry.',
    attributes: { hp: 4200, phases: 2, location: 'Wasteland of the Buried Churches', rewards: ['Ossified Bead', 'Twisted Cloth'], weaknesses: ['Lightning', 'Bleed'], resistances: [] },
    sortOrder: 4, spoilerLevel: 0,
  },
  {
    name: 'Escribar',
    areaSlug: 'rooftops-of-the-sleeping-city',
    description: 'The High Warden of Cvstodia, transformed by The Miracle into a being of immense gravity and sorrow. He floats above the city in perpetual judgement.',
    attributes: { hp: 5500, phases: 2, location: 'Rooftops of the Sleeping City', rewards: ['High Warden\'s Bead', 'Divine Manuscript'], weaknesses: ['Bleed'], resistances: ['Physical', 'Fire'] },
    sortOrder: 5, spoilerLevel: 1,
  },
  {
    name: 'Esdras, of the Anointed Legion',
    areaSlug: 'mountains-of-the-endless-dusk',
    description: 'A grieving commander who fights not with rage but with deep, resigned sorrow. His sword is named after a tragedy he cannot forget.',
    attributes: { hp: 4800, phases: 2, location: 'Mountains of the Endless Dusk', rewards: ['Legion\'s Mark', 'Esdras\'s Sword'], weaknesses: ['Lightning'], resistances: ['Bleed'] },
    sortOrder: 6, spoilerLevel: 1,
  },
]

const BLASPHEMOUS_ITEM_TYPES = [
  { name: 'Prayers', slug: 'prayers', sortOrder: 1 },
  { name: 'Rosary Beads', slug: 'rosary-beads', sortOrder: 2 },
  { name: 'Sword Hearts', slug: 'sword-hearts', sortOrder: 3 },
]

const BLASPHEMOUS_NPCS = [
  {
    name: 'Deogracias',
    areaSlug: 'albero',
    description: 'A merchant of religious relics who travels between the last safe places in Cvstodia. He speaks in riddles and knows more than he lets on.',
    attributes: { role: 'Merchant / Lore NPC', services: ['Sells rosary beads', 'Lore dialogue'], questRelated: false },
    sortOrder: 1, spoilerLevel: 0,
  },
  {
    name: 'Socorro',
    areaSlug: 'albero',
    description: 'A woman who waits in Albero for news of her husband, who ventured into the Wasteland and never returned. She represents the cost of The Miracle on ordinary people.',
    attributes: { role: 'Quest NPC', services: ['Side quest', 'Lore'], questRelated: true },
    sortOrder: 2, spoilerLevel: 0,
  },
]

// ─── Salt and Sanctuary ───────────────────────────────────────────────────────

const SALT_SANCTUARY_AREAS = [
  { name: 'The Sodden Knight', description: 'The beached wreck of the ship that brought the protagonist to this forsaken island. The salt water seeps into everything.', mapX: 50, mapY: 90, sortOrder: 1 },
  { name: 'Village of Smiles', description: 'A village that appears welcoming until its inhabitants reveal their true, monstrous nature. The smiles do not reach their eyes.', mapX: 35, mapY: 70, sortOrder: 2 },
  { name: 'Castle of Storms', description: 'A clifftop castle perpetually battered by elemental storms. The ruling family\'s curse made the weather permanent.', mapX: 20, mapY: 40, sortOrder: 3 },
  { name: 'The Festering Banquet', description: 'A vast underground feasting hall where something long dead has been dining for centuries. The smell is indescribable.', mapX: 60, mapY: 55, sortOrder: 4 },
  { name: 'The Pitchwoods', description: 'A forest of blackened, dead trees where fire has burned and never quite gone out. Ash and embers fall like snow.', mapX: 75, mapY: 45, sortOrder: 5 },
  { name: 'Cran\'s Pass', description: 'A narrow mountain passage and the only land route between the island\'s two halves. Heavily guarded and perpetually contested.', mapX: 50, mapY: 35, sortOrder: 6 },
]

const SALT_SANCTUARY_BOSSES = [
  {
    name: 'The Sodden Knight',
    areaSlug: 'the-sodden-knight',
    description: 'The first true test. A drowned knight who wears his waterlogged armour as a second skin, relentless and slow with crushing axe blows.',
    attributes: { hp: 1800, phases: 1, location: 'The Sodden Knight — Wreck Hold', rewards: ['Drowned Idol', 'Lead Axe'], weaknesses: ['Lightning'], resistances: ['Physical'] },
    sortOrder: 1, spoilerLevel: 0,
  },
  {
    name: 'Kraekan Wyrm',
    areaSlug: 'village-of-smiles',
    description: 'A massive serpent-like creature that coils around its lair. Its writhing body is both the arena wall and the greatest threat.',
    attributes: { hp: 3200, phases: 1, location: 'Village of Smiles — Sewers', rewards: ['Wyrm Scale', 'Dragon Charm'], weaknesses: ['Ice'], resistances: ['Fire'] },
    sortOrder: 2, spoilerLevel: 0,
  },
  {
    name: 'The Coveted',
    areaSlug: 'the-festering-banquet',
    description: 'An enormous, bloated creature born of insatiable desire. It reaches from the pit below the Banquet Hall, dragging victims down to join its endless hunger.',
    attributes: { hp: 4500, phases: 2, location: 'The Festering Banquet — The Pit', rewards: ['Idol of the Coveted', 'Rotted Rope'], weaknesses: ['Fire'], resistances: ['Dark'] },
    sortOrder: 3, spoilerLevel: 0,
  },
  {
    name: 'The Unspeakable Deep',
    areaSlug: 'crans-pass',
    description: 'An entity that should not exist on land, dragged up from the deep ocean by the island\'s curse. Its movements are wrong in ways that cannot be described.',
    attributes: { hp: 6200, phases: 2, location: 'Cran\'s Pass — Sea Gate', rewards: ['Deep Rune', 'Elder Ring'], weaknesses: ['Lightning', 'Holy'], resistances: ['Dark', 'Physical'] },
    sortOrder: 4, spoilerLevel: 1,
  },
  {
    name: 'Carsejaw the Cruel',
    areaSlug: 'the-pitchwoods',
    description: 'A towering, half-mad prisoner who tore off his own chains and now wanders the Pitchwoods, destroying everything that moves.',
    attributes: { hp: 4000, phases: 1, location: 'The Pitchwoods — Crucible', rewards: ['Chains of Fury', 'Cruel Brand'], weaknesses: ['Lightning'], resistances: ['Fire'] },
    sortOrder: 5, spoilerLevel: 0,
  },
]

const SALT_SANCTUARY_ITEM_TYPES = [
  { name: 'Weapons', slug: 'weapons', sortOrder: 1 },
  { name: 'Armour', slug: 'armour', sortOrder: 2 },
]

const SALT_SANCTUARY_NPCS = [
  {
    name: 'The Candlelit Lady',
    areaSlug: 'village-of-smiles',
    description: 'An enigmatic woman who appears in sanctuaries throughout the island, always with a candle lit. She offers guidance without giving answers.',
    attributes: { role: 'Guide / Lore NPC', services: ['Lore', 'Hints'], questRelated: false },
    sortOrder: 1, spoilerLevel: 0,
  },
]

// ─── Ender Magnolia ───────────────────────────────────────────────────────────

const ENDER_MAGNOLIA_AREAS = [
  { name: 'Ruined Laboratory', description: 'The shattered remains of the facility where Blume was created. Machinery still sparks and twitches with residual energy.', mapX: 40, mapY: 50, sortOrder: 1 },
  { name: 'Flooded District', description: 'The lower city, submerged in water that never drains. Strange luminescent plants have grown in the absence of light.', mapX: 25, mapY: 70, sortOrder: 2 },
  { name: 'Crystalline Caverns', description: 'Underground caves where the catastrophe has turned stone to crystal. The refracted light creates disorienting beauty.', mapX: 60, mapY: 65, sortOrder: 3 },
  { name: 'Upper Conservatory', description: 'A greenhouse complex atop the research facility, where plant life has grown to monstrous proportions in the years since collapse.', mapX: 55, mapY: 30, sortOrder: 4 },
  { name: "Blume's Dream", description: 'A fragmented mindscape accessible only at specific locations. The rules of space and time do not fully apply here.', mapX: 50, mapY: 50, sortOrder: 5, spoilerLevel: 2 },
]

const ENDER_MAGNOLIA_BOSSES = [
  {
    name: 'Amalgam, the First Failure',
    areaSlug: 'ruined-laboratory',
    description: 'An early experimental homunculus that survived the facility\'s collapse by merging with surrounding machinery. It attacks with asymmetric, lurching swings.',
    attributes: { hp: 2200, phases: 2, location: 'Ruined Laboratory — Test Chamber Alpha', rewards: ['Amalgam Core', 'Broken Regulator'], weaknesses: ['Lightning'], resistances: ['Physical'] },
    sortOrder: 1, spoilerLevel: 0,
  },
  {
    name: 'Silvia, the Drowned Warden',
    areaSlug: 'flooded-district',
    description: 'A facility warden who survived the flooding by mutating into something half-human, half-aquatic. She patrols her sunken domain with territorial aggression.',
    attributes: { hp: 3500, phases: 2, location: 'Flooded District — Sunken Administration', rewards: ["Warden's Key", 'Gill Shard'], weaknesses: ['Lightning', 'Ice'], resistances: ['Water'] },
    sortOrder: 2, spoilerLevel: 0,
  },
  {
    name: 'The Crystal Sovereign',
    areaSlug: 'crystalline-caverns',
    description: 'A researcher who was crystallised mid-transformation. Their consciousness persists in the crystal matrix, furious and brittle.',
    attributes: { hp: 4200, phases: 2, location: 'Crystalline Caverns — The Throne Shard', rewards: ['Sovereign Fragment', 'Resonance Core'], weaknesses: ['Physical', 'Fire'], resistances: ['Lightning', 'Magic'] },
    sortOrder: 3, spoilerLevel: 0,
  },
  {
    name: 'Verdant, the Overgrown',
    areaSlug: 'upper-conservatory',
    description: 'The conservatory\'s head botanist, absorbed by the mutant plant life she spent her life studying. She now defends the greenhouse as her garden.',
    attributes: { hp: 4800, phases: 2, location: 'Upper Conservatory — Central Greenhouse', rewards: ['Overgrown Seed', 'Thorned Mantle'], weaknesses: ['Fire'], resistances: ['Magic', 'Water'] },
    sortOrder: 4, spoilerLevel: 0,
  },
]

const ENDER_MAGNOLIA_ITEM_TYPES = [
  { name: 'Spirits', slug: 'spirits', sortOrder: 1 },
  { name: 'Relics', slug: 'relics', sortOrder: 2 },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

type GameSeed = {
  slug: string
  name: string
  description: string
  developer: string
  releaseYear: number
  genre: string
  gameConfig: schema.GameConfig
  areas: { name: string; description: string; mapX: number; mapY: number; sortOrder: number; spoilerLevel?: number }[]
  bosses: { name: string; areaSlug: string; description: string; attributes: schema.BossAttributes; sortOrder: number; spoilerLevel: number }[]
  itemTypes: { name: string; slug: string; sortOrder: number }[]
  npcs: { name: string; areaSlug: string; description: string; attributes: schema.NpcAttributes; sortOrder: number; spoilerLevel: number }[]
}

const GAMES: GameSeed[] = [
  {
    slug: 'blasphemous',
    name: 'Blasphemous',
    description: 'A brutal action-platformer set in the dark fantasy world of Cvstodia, where The Miracle has cursed the land and all who inhabit it. Play as the Penitent One, a lone survivor of a massacre, on a pilgrimage through a world of grotesque beauty and religious horror.',
    developer: 'The Game Kitchen',
    releaseYear: 2019,
    genre: 'soulsvania',
    gameConfig: { bosses: true, npcs: true, areas: true, tierlist: true, prayers: true, rosaryBeads: true, swordHearts: true },
    areas: BLASPHEMOUS_AREAS,
    bosses: BLASPHEMOUS_BOSSES,
    itemTypes: BLASPHEMOUS_ITEM_TYPES,
    npcs: BLASPHEMOUS_NPCS,
  },
  {
    slug: 'salt-and-sanctuary',
    name: 'Salt and Sanctuary',
    description: 'A dark, hand-drawn 2D soulslike set on a cursed island. The systems depth of Souls games — stamina management, weapon classes, skill trees — translated to a 2D plane with uncompromising difficulty.',
    developer: 'Ska Studios',
    releaseYear: 2016,
    genre: 'soulsvania',
    gameConfig: { bosses: true, npcs: true, areas: true, tierlist: true, skillTrees: true, weaponTypes: true },
    areas: SALT_SANCTUARY_AREAS,
    bosses: SALT_SANCTUARY_BOSSES,
    itemTypes: SALT_SANCTUARY_ITEM_TYPES,
    npcs: SALT_SANCTUARY_NPCS,
  },
  {
    slug: 'ender-magnolia',
    name: 'Ender Magnolia: Bloom in the Mist',
    description: 'A spiritual sequel to Ender Lilies set in a new world ravaged by a catastrophic transformation. Play as Blume, a homunculus who awakens amid ruins and must uncover the truth of what destroyed the once-prosperous society.',
    developer: 'Binary Haze Interactive',
    releaseYear: 2025,
    genre: 'metroidvania',
    gameConfig: { bosses: true, npcs: true, areas: true, tierlist: true, relics: true, spirits: true },
    areas: ENDER_MAGNOLIA_AREAS,
    bosses: ENDER_MAGNOLIA_BOSSES,
    itemTypes: ENDER_MAGNOLIA_ITEM_TYPES,
    npcs: [],
  },
]

async function seedGame(g: GameSeed) {
  console.warn(`\n[seed] ── ${g.name} ──────────────────────────────`)

  // Game
  await db.insert(schema.games).values({
    name: g.name,
    slug: g.slug,
    description: g.description,
    developer: g.developer,
    releaseYear: g.releaseYear,
    gameConfig: g.gameConfig,
    isPublished: false,
  }).onConflictDoNothing()

  const game = await db.query.games.findFirst({ where: eq(schema.games.slug, g.slug) })
  if (!game) throw new Error(`[seed] Game ${g.slug} not found after insert`)
  const gameId = game.id
  console.warn(`[seed] ID: ${gameId}`)

  // Item types
  if (g.itemTypes.length) {
    await db.insert(schema.itemTypes).values(
      g.itemTypes.map(t => ({ gameId, name: t.name, slug: t.slug, sortOrder: t.sortOrder }))
    ).onConflictDoNothing()
    console.warn(`[seed] ${g.itemTypes.length} item type(s) inserted`)
  }

  // Areas
  if (g.areas.length) {
    await db.insert(schema.areas).values(
      g.areas.map(a => ({
        gameId,
        name: a.name,
        slug: slugify(a.name),
        description: a.description,
        mapX: a.mapX,
        mapY: a.mapY,
        sortOrder: a.sortOrder,
        spoilerLevel: a.spoilerLevel ?? 0,
        isPublished: true,
      }))
    ).onConflictDoNothing()
    console.warn(`[seed] ${g.areas.length} area(s) inserted`)
  }

  const areaRows = await db.query.areas.findMany({ where: eq(schema.areas.gameId, gameId) })
  const areaMap = Object.fromEntries(areaRows.map(a => [a.slug, a.id]))

  // Bosses
  if (g.bosses.length) {
    await db.insert(schema.bosses).values(
      g.bosses.map(b => ({
        gameId,
        areaId: areaMap[slugify(b.areaSlug)] ?? null,
        name: b.name,
        slug: slugify(b.name),
        description: b.description,
        sortOrder: b.sortOrder,
        spoilerLevel: b.spoilerLevel,
        attributes: b.attributes,
        isPublished: true,
      }))
    ).onConflictDoNothing()
    console.warn(`[seed] ${g.bosses.length} boss(es) inserted`)
  }

  // NPCs
  if (g.npcs.length) {
    await db.insert(schema.npcs).values(
      g.npcs.map(n => ({
        gameId,
        areaId: areaMap[slugify(n.areaSlug)] ?? null,
        name: n.name,
        slug: slugify(n.name),
        description: n.description,
        spoilerLevel: n.spoilerLevel,
        isPublished: true,
        attributes: n.attributes,
      }))
    ).onConflictDoNothing()
    console.warn(`[seed] ${g.npcs.length} NPC(s) inserted`)
  }

  console.warn(`[seed] ✓ ${g.name} done`)
}

async function main() {
  for (const g of GAMES) {
    await seedGame(g)
  }
  console.warn('\n[seed] ✓ Phase 3 seed complete. Games are unpublished — enable via admin panel.')
  await client.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
