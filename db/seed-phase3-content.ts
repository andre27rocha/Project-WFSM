/**
 * Phase 3 content seed — fills the item/lore gaps left by db/seed-phase3.ts.
 * Run with: npm run db:seed:phase3:content
 *
 * What this does:
 *  - Blasphemous       → Prayers, Rosary Beads, Sword (Mea Culpa) Hearts, extra NPCs, boss strategies
 *  - Salt and Sanctuary→ Weapon classes, Armour, sanctuary NPCs, boss strategies
 *  - Ender Magnolia    → CORRECTS the placeholder data (real protagonist Lilac, real areas
 *                        and bosses) and adds Homunculi (Spirits) + Relics
 *  - Publishes all three games at the end
 *
 * Content sourced from the official wikis (blasphemous.wiki.gg, saltandsanctuary.wiki.fextralife.com),
 * Neoseeker and TheGamer walkthroughs. All inserts use onConflictDoNothing / explicit upserts so
 * the script is safe to re-run.
 */
import { config } from 'dotenv'

// Must be first — loads DATABASE_URL before any drizzle/postgres init
config({ path: '.env.local' })

import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import type { BossAttributes, ItemAttributes, NpcAttributes } from './schema'

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

// ---------------------------------------------------------------------------
// Shared row shapes
// ---------------------------------------------------------------------------

type ItemSeed = {
  name: string
  itemTypeSlug: string
  description: string
  content?: string
  attributes: ItemAttributes
  spoilerLevel?: number
  sortOrder: number
}

type NpcSeed = {
  name: string
  areaSlug: string
  description: string
  content?: string
  attributes: NpcAttributes
  spoilerLevel?: number
  sortOrder: number
}

type AreaSeed = {
  name: string
  description: string
  mapX: number
  mapY: number
  sortOrder: number
  spoilerLevel?: number
}

type BossSeed = {
  name: string
  areaSlug: string
  description: string
  content?: string
  attributes: BossAttributes
  spoilerLevel?: number
  sortOrder: number
}

// ═══════════════════════════════════════════════════════════════════════════
// BLASPHEMOUS
// ═══════════════════════════════════════════════════════════════════════════

const BLASPHEMOUS_ITEMS: ItemSeed[] = [
  // ── Prayers (cast with the Fervour bar) ──────────────────────────────────
  {
    name: 'Tiento to your Thorned Hairs',
    itemTypeSlug: 'prayers',
    description: 'Grants the Penitent One full invulnerability for the duration of its cooldown — the single best panic button against unavoidable boss attacks.',
    attributes: { effects: ['Invulnerability while active'], howToObtain: 'Found in the Wall of the Holy Prohibitions', stats: { fervour: 40 } },
    sortOrder: 1,
  },
  {
    name: 'Cante Jondo of the Three Sisters',
    itemTypeSlug: 'prayers',
    description: 'Unleashes a series of shockwaves that deal heavy damage to every enemy on screen. A reliable high-damage option for crowded rooms and second phases.',
    attributes: { effects: ['Heavy screen-wide damage'], howToObtain: 'Reward for delivering the three Sister effigies in a side quest', stats: { fervour: 60 } },
    sortOrder: 2,
  },
  {
    name: 'Aubade of the Nameless Guardian',
    itemTypeSlug: 'prayers',
    description: 'Summons a spectral guardian that mirrors the Penitent One’s attacks and parries. Doubles your offensive output but is costly to cast.',
    attributes: { rarity: 'epic', effects: ['Summons a mimicking guardian'], howToObtain: 'Mountains of the Endless Dusk', stats: { fervour: 100 } },
    sortOrder: 3,
  },
  {
    name: 'Debla of the Lights',
    itemTypeSlug: 'prayers',
    description: 'Calls down a wide vertical beam of holy light centred on the Penitent One, dealing heavy damage to anything caught inside it.',
    attributes: { effects: ['Wide light beam, heavy damage'], howToObtain: 'Found in the Mother of Mothers', stats: { fervour: 40 } },
    sortOrder: 4,
  },
  {
    name: 'Lorquiana',
    itemTypeSlug: 'prayers',
    description: 'Fires three beams of lightning in a straight horizontal line. Excellent against bosses that hold position at your level.',
    attributes: { effects: ['Triple lightning beam'], howToObtain: 'Sold by Candelaria / found early in the Wasteland', stats: { fervour: 40 } },
    sortOrder: 5,
  },
  {
    name: 'Saeta Dolorosa',
    itemTypeSlug: 'prayers',
    description: 'Grants HP regeneration whenever you deal damage for the duration of its cooldown — a strong sustain tool for attrition fights.',
    attributes: { effects: ['HP regen on hit'], howToObtain: 'Convent of Our Lady of the Charred Visage', stats: { fervour: 40 } },
    sortOrder: 6,
  },
  {
    name: 'Taranto to My Sister',
    itemTypeSlug: 'prayers',
    description: 'Calls lightning to strike repeatedly in an area around the Penitent One, ideal for enemies that crowd in close.',
    attributes: { effects: ['Area lightning strikes'], howToObtain: 'Library of the Negated Words', stats: { fervour: 40 } },
    sortOrder: 7,
  },
  {
    name: 'Zarabanda of the Safe Haven',
    itemTypeSlug: 'prayers',
    description: 'Summons two shields that orbit the Penitent One, damaging enemies on contact and destroying most projectiles. A strong defensive-offensive hybrid.',
    attributes: { effects: ['Orbiting shields', 'Destroys projectiles'], howToObtain: 'Grievance Ascends', stats: { fervour: 40 } },
    sortOrder: 8,
  },
  {
    name: 'Campanillero to the Sons of the Aurora',
    itemTypeSlug: 'prayers',
    description: 'Summons a flock of cherubs that hover above the Penitent One and attack nearby enemies automatically for the duration.',
    attributes: { effects: ['Summons attacking cherubs'], howToObtain: 'Patio of the Silent Steps', stats: { fervour: 60 } },
    sortOrder: 9,
  },
  {
    name: 'Verdiales of the Forsaken Hamlet',
    itemTypeSlug: 'prayers',
    description: 'Throws two spinning projectiles that stick to surfaces and damage enemies that pass through them. Cheap and good for zoning.',
    attributes: { effects: ['Two sticking spinning blades'], howToObtain: 'Wasteland of the Buried Churches', stats: { fervour: 20 } },
    sortOrder: 10,
  },

  // ── Rosary Beads (passive accessories on the Rosary) ─────────────────────
  {
    name: 'Bead of Red Wax',
    itemTypeSlug: 'rosary-beads',
    description: 'Raises the Penitent One’s maximum health by up to 30 points depending on the amount of wax melted onto it. An early priority for survivability.',
    attributes: { effects: ['+Max HP (up to 30)'], howToObtain: 'Melt red wax at the candle in Albero' },
    sortOrder: 11,
  },
  {
    name: 'Bead of Blue Wax',
    itemTypeSlug: 'rosary-beads',
    description: 'Raises maximum Fervour by up to 30 points, letting you cast prayers more often. The caster’s counterpart to the Red Wax bead.',
    attributes: { effects: ['+Max Fervour (up to 30)'], howToObtain: 'Melt blue wax at the candle in Albero' },
    sortOrder: 12,
  },
  {
    name: 'Knot of Hair',
    itemTypeSlug: 'rosary-beads',
    description: 'Increases Mea Culpa damage by 5%. A small but unconditional offensive bonus with no drawback.',
    attributes: { effects: ['+5% Mea Culpa damage'], howToObtain: 'Wasteland of the Buried Churches' },
    sortOrder: 13,
  },
  {
    name: 'Frozen Olive',
    itemTypeSlug: 'rosary-beads',
    description: 'Grants 50% defence against all damage types while health is below 20%. A clutch survival bead for low-HP runs.',
    attributes: { effects: ['+50% all defence below 20% HP'], howToObtain: 'Mountains of the Endless Dusk' },
    sortOrder: 14,
  },
  {
    name: 'Drop of Coagulated Ink',
    itemTypeSlug: 'rosary-beads',
    description: 'Increases damage dealt by Prayers by 100%. Essential for any Fervour-focused build.',
    attributes: { rarity: 'rare', effects: ['+100% Prayer damage'], howToObtain: 'Library of the Negated Words' },
    sortOrder: 15,
  },
  {
    name: 'Embers of a Broken Star',
    itemTypeSlug: 'rosary-beads',
    description: 'Boosts Fervour gained when hitting enemies by 50%, letting you cycle prayers far more aggressively.',
    attributes: { effects: ['+50% Fervour gain on hit'], howToObtain: 'Mother of Mothers' },
    sortOrder: 16,
  },
  {
    name: 'Big Toe Made of Limestone',
    itemTypeSlug: 'rosary-beads',
    description: 'Allows three air impulses (dashes/jumps) instead of two, improving aerial mobility and dodge options.',
    attributes: { effects: ['+1 air impulse'], howToObtain: 'One of the four Limestone Toes scattered across Cvstodia' },
    sortOrder: 17,
  },
  {
    name: 'Calcified Eye of Erudition',
    itemTypeSlug: 'rosary-beads',
    description: 'Displays a health bar above damaged enemies — invaluable for learning boss damage thresholds and phase timings.',
    attributes: { effects: ['Shows enemy health bars'], howToObtain: 'Albero — given by an NPC' },
    sortOrder: 18,
  },
  {
    name: 'Scaly Coin',
    itemTypeSlug: 'rosary-beads',
    description: 'Increases Tears of Atonement (currency) dropped by enemies by 50%. Useful while saving for prayers and upgrades.',
    attributes: { effects: ['+50% currency drops'], howToObtain: 'Desecrated Cistern' },
    sortOrder: 19,
  },
  {
    name: 'Pelican Effigy',
    itemTypeSlug: 'rosary-beads',
    description: 'Protects the Penitent One from damage while drinking from a Bile Flask, removing the risk of being punished mid-heal.',
    attributes: { effects: ['Damage immunity while healing'], howToObtain: 'Graveyard of the Peaks' },
    sortOrder: 20,
  },

  // ── Mea Culpa (Sword) Hearts ─────────────────────────────────────────────
  {
    name: 'Heart of Oils',
    itemTypeSlug: 'sword-hearts',
    description: 'Increases all damage dealt by 30%, but the Penitent One takes double physical damage in return. A glass-cannon staple for confident players.',
    attributes: { effects: ['+30% damage', '−100% physical resistance'], howToObtain: 'Mercy Dreams' },
    sortOrder: 21,
  },
  {
    name: 'Heart of Saltpeter Blood',
    itemTypeSlug: 'sword-hearts',
    description: 'Adds bonus base attack damage while below 20% health, with no downside. Rewards aggressive low-HP play.',
    attributes: { effects: ['+Damage below 20% HP'], howToObtain: 'Sold by Deogracias' },
    sortOrder: 22,
  },
  {
    name: 'Heart of the Virtuous Pain',
    itemTypeSlug: 'sword-hearts',
    description: 'Increases the parry window with no negative effect — the best general-purpose heart for a parry-focused playstyle.',
    attributes: { rarity: 'rare', effects: ['+Parry window'], howToObtain: 'Convent of Our Lady of the Charred Visage' },
    sortOrder: 23,
  },
  {
    name: 'Heart of Cerulean Incense',
    itemTypeSlug: 'sword-hearts',
    description: 'Grants 75% more Fervour on attacks, at the cost of halving ranged blood-attack damage. Powers Fervour-heavy builds.',
    attributes: { effects: ['+75% Fervour on attack', '−50% ranged damage'], howToObtain: 'Wall of the Holy Prohibitions' },
    sortOrder: 24,
  },
  {
    name: 'Smoking Heart of Incense',
    itemTypeSlug: 'sword-hearts',
    description: 'Increases elemental Prayer damage by 150%, but prayers cost extra Fervour. The premier heart for a dedicated caster.',
    attributes: { rarity: 'epic', effects: ['+150% elemental Prayer damage', '+Prayer cost'], howToObtain: 'Ferrous Tree' },
    sortOrder: 25,
  },
  {
    name: 'Molten Heart of Boiling Blood',
    itemTypeSlug: 'sword-hearts',
    description: 'Heals the Penitent One after each kill, but Bile Flasks restore less health. Strong for clearing enemy-dense areas.',
    attributes: { effects: ['Heal on kill', '−Flask healing'], howToObtain: 'Grievance Ascends' },
    sortOrder: 26,
  },
  {
    name: 'Apodictic Heart of Mea Culpa',
    itemTypeSlug: 'sword-hearts',
    description: 'Increases the effectiveness of buff prayers, but cannot be unequipped once slotted. A late-game commitment for support builds (Wounds of Eventide DLC).',
    attributes: { rarity: 'legendary', effects: ['+Buff effectiveness', 'Cannot be unequipped'], howToObtain: 'Wounds of Eventide DLC' },
    spoilerLevel: 1,
    sortOrder: 27,
  },
]

const BLASPHEMOUS_NPCS: NpcSeed[] = [
  {
    name: 'Tirso',
    areaSlug: 'albero',
    description: 'A devout gardener of Albero who tends the town’s sick. He sends the Penitent One to recover his lost healing herbs from across Cvstodia, expanding the Bile Flask supply.',
    attributes: { role: 'Quest NPC / Healer', services: ['Herb side quest', 'Increases healing flasks'], questRelated: true },
    sortOrder: 3,
  },
  {
    name: 'Cleofas',
    areaSlug: 'albero',
    description: 'A grieving pilgrim from Albero searching for his lost love, Socorro. His questline is one of the quietest tragedies of the Penitent One’s journey.',
    attributes: { role: 'Quest NPC', services: ['Pilgrimage side quest', 'Lore'], questRelated: true },
    sortOrder: 4,
  },
  {
    name: 'Redento',
    areaSlug: 'wasteland-of-the-buried-churches',
    description: 'A wandering penitent who flagellates himself with a chain of thorns as he travels Cvstodia. Following his pilgrimage across multiple areas rewards a unique Rosary Bead.',
    attributes: { role: 'Quest NPC', services: ['Multi-area pilgrimage quest', 'Rosary Bead reward'], questRelated: true },
    sortOrder: 5,
  },
]

const BLASPHEMOUS_BOSS_STRATEGIES: Record<string, string> = {
  'warden-of-the-silent-sorrow': `## Strategy

The Warden is the game's introductory boss and is meant to teach the fundamentals.

- **Flail slam** — telegraphed by a high wind-up. Dash *through* or away, then punish the recovery with 2–3 hits.
- **Horizontal swipe** — stay at mid distance and step in only after it whiffs.
- **Phase 2** adds a spinning flail sweep; keep your distance until the spin ends, then close in.

Patience beats it: trade a couple of safe hits per opening rather than greeding for damage.`,
  'ten-piedad': `## Strategy

A floating amalgam that fights above the cistern waters.

- **Ground slam** — it drops fists down to crush you; roll out from under the shadow.
- **Sweeping fists** — punish the moment the fists are embedded in the ground and the body is exposed.
- It periodically rises and summons small adds — clear them quickly or ignore and focus the body.

Stay mobile beneath it and only commit to attacks when its body is low and grounded.`,
  'tres-angustias': `## Strategy

Three sisters bound into a single floating form, fighting with aerial dives.

- **Dive attacks** — they swoop diagonally; watch the lead sister and dash perpendicular to the dive.
- Punish each landing with a short burst, then reposition — never stand still under them.
- In the second phase the dives chain faster; prioritise survival over damage and pick up hits between sweeps.`,
  'our-lady-of-the-charred-visage': `## Strategy

A stationary burning effigy — this is a positioning and reaction fight.

- **Falling fire columns** — watch the floor markers and stand in the gaps.
- **Burning tears / hands** — dodge laterally; the safe zone is usually directly beneath her between attacks.
- Bleed builds excel here (she resists fire). Apply pressure during the gaps in her fire patterns.`,
  'esdras-of-the-anointed-legion': `## Strategy

A towering, sorrowful commander with an enormous anchor-blade.

- **Overhead sweep** — dash *toward* him as the blade comes down to end up behind him for free hits.
- **Projectile waves** — he fires arcing energy crescents; jump or dash through the gaps.
- **Phase 2** introduces his sister Perpetua's intervention and faster combos — keep moving and punish after his big committed swings.

Lightning prayers (he is weak to it) shorten the fight considerably.`,
  'escribar': `## Strategy

The High Warden, warped by The Miracle into a being of crushing gravity above the Sleeping City.

- **Gravity pulls / orbs** — he manipulates falling debris and energy; keep reading the floor and overhead tells.
- Bleed is his weakness — sustained melee pressure with a bleed build melts his bars.
- Save **Tiento to your Thorned Hairs** for his most committed screen-wide attacks to guarantee i-frames.`,
}

// ═══════════════════════════════════════════════════════════════════════════
// SALT AND SANCTUARY
// ═══════════════════════════════════════════════════════════════════════════

const SALT_ITEMS: ItemSeed[] = [
  // ── Weapon classes ───────────────────────────────────────────────────────
  {
    name: 'Swords',
    itemTypeSlug: 'weapons',
    description: 'Balanced one-handed blades with fast, reliable swings. The default melee class — good range, moderate damage and stamina cost, scaling primarily with Dexterity.',
    attributes: { effects: ['100% Slash', 'Balanced speed/damage'], howToObtain: 'Found throughout the island; unlocked via the Cleric / Vaarman trees' },
    sortOrder: 1,
  },
  {
    name: 'Greatswords',
    itemTypeSlug: 'weapons',
    description: 'Very large two-handed blades that swing slowly but hit hard, dealing 75% Slash and 25% Strike damage. Excellent stagger and reach at the cost of speed.',
    attributes: { effects: ['75% Slash / 25% Strike', 'High stagger'], howToObtain: 'Requires investment in the swordsman skill tree' },
    sortOrder: 2,
  },
  {
    name: 'Spears',
    itemTypeSlug: 'weapons',
    description: 'Long thrusting weapons dealing 100% Slash damage. Their reach lets you poke safely from behind a shield, making them strong for cautious, defensive play.',
    attributes: { effects: ['100% Slash', 'Long reach', 'Shield-friendly'], howToObtain: 'Requires the spearman skill tree' },
    sortOrder: 3,
  },
  {
    name: 'Poleaxes',
    itemTypeSlug: 'weapons',
    description: 'Long-armed weapons such as halberds and glaives with wide, sweeping movesets and long reach. Strong crowd control but slower recovery than spears.',
    attributes: { effects: ['Wide sweeping arcs', 'Long reach'], howToObtain: 'Higher tiers of the spearman skill tree' },
    sortOrder: 4,
  },
  {
    name: 'Hammers & Greathammers',
    itemTypeSlug: 'weapons',
    description: 'Blunt Strike-damage weapons that ignore much of an enemy’s defence and excel at staggering. Greathammers trade all speed for devastating single hits.',
    attributes: { effects: ['Strike damage', 'High poise damage'], howToObtain: 'Requires the brutish strength / cleric strength trees' },
    sortOrder: 5,
  },
  {
    name: 'Axes & Greataxes',
    itemTypeSlug: 'weapons',
    description: 'Heavy chopping weapons mixing Slash and Strike damage. Greataxes are among the hardest-hitting weapons in the game, rewarding committed, well-timed swings.',
    attributes: { effects: ['Mixed Slash/Strike', 'High damage'], howToObtain: 'Strength-oriented skill trees' },
    sortOrder: 6,
  },
  {
    name: 'Reapers',
    itemTypeSlug: 'weapons',
    description: 'Scythe-like weapons with unusual, wide-arcing movesets that hit multiple enemies. Awkward to time but devastating with the right spacing.',
    attributes: { effects: ['Wide multi-hit arcs'], howToObtain: 'Dedicated reaper branch of the skill tree' },
    sortOrder: 7,
  },
  {
    name: 'Daggers',
    itemTypeSlug: 'weapons',
    description: 'Very fast, short-range blades with low per-hit damage but excellent Dexterity scaling and quick combos. Ideal for fast-rolling, high-mobility builds.',
    attributes: { effects: ['Fast attacks', 'Dexterity scaling'], howToObtain: 'Hunter / shadow skill trees' },
    sortOrder: 8,
  },
  {
    name: 'Whips',
    itemTypeSlug: 'weapons',
    description: 'Flexible long-reach weapons that crowd-control groups and strike around corners. Low poise damage, but unmatched safe horizontal range.',
    attributes: { effects: ['Very long reach', 'Crowd control'], howToObtain: 'Hunter skill tree' },
    sortOrder: 9,
  },
  {
    name: 'Bows & Crossbows',
    itemTypeSlug: 'weapons',
    description: 'Ranged weapons for picking off enemies and chipping bosses from safety. Bows fire faster; crossbows hit harder per bolt but reload slowly.',
    attributes: { effects: ['Ranged physical damage'], howToObtain: 'Hunter / ranger skill trees' },
    sortOrder: 10,
  },
  {
    name: 'Staves & Wands',
    itemTypeSlug: 'weapons',
    description: 'Casting implements that channel spells and prayers. Staves favour offensive magic while wands and talismans support miracle/creed casters scaling with Wisdom or Conviction.',
    attributes: { effects: ['Spell / prayer casting'], howToObtain: 'Mage and cleric skill trees' },
    sortOrder: 11,
  },

  // ── Armour ───────────────────────────────────────────────────────────────
  {
    name: 'Light Armour',
    itemTypeSlug: 'armour',
    description: 'Low-weight gear that keeps you under the equip-load threshold for the fastest dodge roll. Minimal defence — built around never getting hit.',
    attributes: { effects: ['Lowest weight', 'Fast roll'], howToObtain: 'Early merchants and drops' },
    sortOrder: 12,
  },
  {
    name: 'Medium Armour',
    itemTypeSlug: 'armour',
    description: 'The balanced middle ground: respectable physical and elemental defence while still allowing a usable mid-speed roll. The default choice for most builds.',
    attributes: { effects: ['Balanced defence/weight'], howToObtain: 'Mid-game vendors and boss drops' },
    sortOrder: 13,
  },
  {
    name: 'Heavy Armour',
    itemTypeSlug: 'armour',
    description: 'Maximum defence and poise at the cost of a slow fat-roll. Pairs with high Endurance and a shield for a tanky, trade-heavy playstyle.',
    attributes: { effects: ['Highest defence', 'Slow roll'], howToObtain: 'Requires high Strength/Endurance; late-game drops' },
    sortOrder: 14,
  },
]

const SALT_NPCS: NpcSeed[] = [
  {
    name: 'The Blacksmith',
    areaSlug: 'village-of-smiles',
    description: 'A Stone Roots tradesperson you can invite to your sanctuary. Once installed, they upgrade and reforge weapons and armour using salt and crafting materials.',
    attributes: { role: 'Sanctuary vendor', services: ['Weapon/armour upgrades', 'Reforging'], questRelated: false },
    sortOrder: 2,
  },
  {
    name: 'The Merchant',
    areaSlug: 'the-festering-banquet',
    description: 'A travelling trader who, once brought to a sanctuary, sells consumables, ammunition and basic equipment in exchange for gold and salt.',
    attributes: { role: 'Sanctuary vendor', services: ['Sells consumables', 'Sells equipment'], questRelated: false },
    sortOrder: 3,
  },
  {
    name: 'The Alchemist',
    areaSlug: 'the-pitchwoods',
    description: 'A sanctuary specialist who trades in oils, salts and rarer reagents, letting you imbue weapons and brew the stronger restorative items needed for late-game areas.',
    attributes: { role: 'Sanctuary vendor', services: ['Imbuements', 'Rare reagents'], questRelated: false },
    sortOrder: 4,
  },
]

const SALT_BOSS_STRATEGIES: Record<string, string> = {
  'the-sodden-knight': `## Strategy

The first real test of the island, fought in the wreck of your ship.

- **Overhead axe slam** — heavily telegraphed; roll through it and punish the long recovery.
- **Horizontal swing** — back off, let it whiff, then step in for one or two hits.
- He is slow but hits hard; never trade more than two hits before repositioning. Lightning damage speeds the kill.`,
  'kraekan-wyrm': `## Strategy

A massive serpent that coils around the arena — its body is both wall and weapon.

- **Lunging bite** — the most dangerous move; dash sideways the instant the head rears back.
- **Tail/body sweeps** — stay near the head where the hitboxes are thinnest and the punish windows are longest.
- Focus all damage on the head; ice damage exploits its fire affinity.`,
  'the-coveted': `## Strategy

An enormous bloated creature that reaches up from the pit below the Banquet Hall.

- **Grab attacks** — it swipes and grabs from the abyss; stay light on your feet and roll the moment a hand lunges.
- Punish the hands and face when they linger after an attack.
- It hits hard but slowly — bait an attack, deal damage, then reset. Fire damage works well; it resists Dark.`,
  'carsejaw-the-cruel': `## Strategy

A half-mad, chained prisoner who rampages through the Pitchwoods.

- **Wide swing combos** — give him room, roll through the final hit of a combo, then punish.
- Don't get greedy between his strings; his recovery is shorter than it looks.
- Lightning is his weakness — a charged elemental weapon shortens an otherwise grindy fight.`,
  'the-unspeakable-deep': `## Strategy

A horror dragged from the ocean by the island's curse — the prologue sets the tone with it.

- Its movements are deliberately disorienting; prioritise reading the wind-ups over its silhouette.
- Keep to the edges of the arena and punish only after its long, committed strikes.
- It resists Dark and Physical; Lightning and Holy damage are the most effective answers.`,
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDER MAGNOLIA — corrected data (real protagonist Lilac, real areas/bosses)
// ═══════════════════════════════════════════════════════════════════════════

const ENDER_MAGNOLIA_DESCRIPTION =
  'A spiritual sequel to Ender Lilies set in a land poisoned by a spreading miasma. Play as Lilac, an "Attuner" who awakens with no memories and the rare gift to purify corrupted Homunculi — machine-souls that fight at her side as she descends through the Lower, Central and Upper Stratums to uncover the truth of the catastrophe.'

const ENDER_MAGNOLIA_AREAS: AreaSeed[] = [
  { name: 'Subterranean Testing Site Ruins', description: 'The buried laboratory where Lilac awakens. Dormant Homunculi and the wreckage of old experiments fill its collapsed halls — the starting region of the Lower Stratum.', mapX: 42, mapY: 70, sortOrder: 1 },
  { name: 'Old City - Lower Stratum', description: 'The decayed streets of the city built above the ruins, choked with miasma. A central hub region connecting the Magicite Mine and the Tethered Steeple.', mapX: 35, mapY: 58, sortOrder: 2 },
  { name: 'Magicite Mine', description: 'A vast excavation where the miasma-rich mineral magicite was harvested. Now flooded and worked by deranged Homunculus laborers.', mapX: 20, mapY: 60, sortOrder: 3 },
  { name: 'Tethered Steeple', description: 'A towering spire wrapped in a living forest barrier, home to the Shackled Beast. The path upward toward the Central Stratum.', mapX: 52, mapY: 45, sortOrder: 4 },
  { name: 'Crystalline Realm', description: 'A glittering expanse where the catastrophe crystallised everything it touched. Beautiful, disorienting, and prowled by the Mad Knight Reibolg.', mapX: 65, mapY: 50, sortOrder: 5 },
  { name: 'Sorcerer Academy', description: 'The ruined seat of magical learning where Professor Eliza and her students conducted forbidden research into the miasma.', mapX: 60, mapY: 32, sortOrder: 6, spoilerLevel: 1 },
  { name: 'Steel District', description: 'An industrial sector dominated by the Arena Tower, where captured Homunculi are forced to fight. Combat Puppet No. 7 reigns at its summit.', mapX: 75, mapY: 35, sortOrder: 7, spoilerLevel: 1 },
  { name: 'Frost Estate Ruins', description: 'The frozen remains of a noble estate in the Upper Stratum, where the Frost Homunculus Lorna keeps a long, cold penance.', mapX: 70, mapY: 20, sortOrder: 8, spoilerLevel: 1 },
  { name: "Declan's Estate", description: 'The manor of Declan, the Fallen Sorcerer. Its halls hold the secrets of the family at the heart of the catastrophe.', mapX: 55, mapY: 18, sortOrder: 9, spoilerLevel: 2 },
  { name: 'Land of Origin', description: 'The source of the miasma and the journey’s end, accessible only in the late game. Where the truth of Lilac and the Homunculi is finally laid bare.', mapX: 50, mapY: 8, sortOrder: 10, spoilerLevel: 3 },
]

const ENDER_MAGNOLIA_BOSSES: BossSeed[] = [
  {
    name: 'Lito, the Child Test Subject',
    areaSlug: 'subterranean-testing-site-ruins',
    description: 'A small, lonely Homunculus and the first true boss. A close-quarters brawler who chains swipes into uppercuts, later layering on fire and ice.',
    attributes: { phases: 1, location: 'Subterranean Testing Site Ruins', rewards: ['Lito (Homunculus / Spirit)'], weaknesses: [] },
    content: `## Strategy

One of the gentlest fights in the game — a good place to learn the parry/dodge rhythm.

- **Swipe → Uppercut** — he swipes horizontally and can follow into an uppercut. Dash through or back off and punish the recovery.
- **Ice Slam** — he leaps and ground-pounds, releasing a freezing shockwave; jump or dash away from the impact.
- **Fiery Uppercut** — a flame wall briefly surrounds him on the uppercut; don’t be touching him when it triggers.

Stay close, punish after each committed move, and you’ll recruit Lito as a Homunculus on victory.`,
    sortOrder: 1,
  },
  {
    name: 'Garm, the Giant Gravedigger',
    areaSlug: 'old-city-lower-stratum',
    description: 'An enormous Homunculus wielding a massive shovel — the first major difficulty wall. A hard-hitting, aggressive boss that punishes greedy play.',
    attributes: { phases: 2, location: 'Old City - Lower Stratum', rewards: ['Upgrade materials'], weaknesses: [] },
    content: `## Strategy

The game’s first big skill check.

- **Shovel sweeps & slams** — wide, heavy swings with deceptive range. Dodge *through* them rather than backward.
- **Leaping smash** — telegraphed by a high jump; roll the instant he lands.
- **Phase 2** speeds up his combos and adds shockwaves along the ground — jump the waves and only punish after his longest swings.

Bring Autonomous Homunculi (the owls) to chip safe damage while you focus on dodging.`,
    sortOrder: 2,
  },
  {
    name: 'Yolvan',
    areaSlug: 'old-city-lower-stratum',
    description: 'A two-part Homunculus boss fought by the Clock Tower Plaza. Defeating it yields the Yolvan ability.',
    attributes: { phases: 2, location: 'Old City - Lower Stratum (Clock Tower Plaza)', rewards: ['Yolvan (Homunculus / Spirit)'], weaknesses: [] },
    sortOrder: 3,
  },
  {
    name: 'Shackled Beast',
    areaSlug: 'tethered-steeple',
    description: 'The bound guardian of the Tethered Steeple. Defeating it grants a counter/parry ability and the Shackled Beast Homunculus.',
    attributes: { phases: 2, location: 'Tethered Steeple', rewards: ['Shackled Beast (Homunculus / Spirit)', 'Counter/Parry ability'], weaknesses: [] },
    content: `## Strategy

A heavy, deliberate brawler whose attacks are designed to be read and countered.

- Watch for the wind-up on its lunges and slams — its tells are slow but its damage is high.
- The fight rewards patience; punish only after fully committed attacks and respect its reach.
- Victory unlocks the counter/parry mechanic that opens up several later fights.`,
    spoilerLevel: 1,
    sortOrder: 4,
  },
  {
    name: 'Mad Knight Reibolg',
    areaSlug: 'crystalline-realm',
    description: 'A crystallised knight driven mad, fought in the Crystalline Realm. An optional but rewarding duel required for one of the game’s endings.',
    attributes: { phases: 2, location: 'Crystalline Realm', rewards: ['Reibolg (Homunculus / Spirit)'], weaknesses: [] },
    spoilerLevel: 1,
    sortOrder: 5,
  },
  {
    name: 'Luiseach',
    areaSlug: 'sorcerer-academy',
    description: 'A Homunculus fought at the summit of the Sorcerer Academy after Professor Eliza. Recruiting it grants the Luiseach ability.',
    attributes: { phases: 2, location: 'Sorcerer Academy', rewards: ['Luiseach (Homunculus / Spirit)'], weaknesses: [] },
    spoilerLevel: 1,
    sortOrder: 6,
  },
  {
    name: 'Combat Puppet No. 7',
    areaSlug: 'steel-district',
    description: 'The undefeated champion of the Arena Tower, faced after four consecutive matches. A fast, technical duel against a master of rapid slashes and status effects.',
    attributes: { phases: 2, location: 'Steel District — Arena Tower', rewards: ['No. 7 (Homunculus / Spirit)', 'Lunar Manifestation traversal ability'], weaknesses: [] },
    content: `## Strategy

A speed and precision check at the top of the Arena Tower.

- **Rapid slash strings** — close, multi-hit combos; dodge through the final hit rather than trying to back out.
- He inflicts **status effects**, so don’t let pressure stack — create space and reset when needed.
- His Cooldown-type attacks come in bursts; learn the gaps between strings and punish there.

Beating him grants his **Lunar Manifestation**, which extends jumps and dashes to reach new areas.`,
    spoilerLevel: 1,
    sortOrder: 7,
  },
  {
    name: 'Declan, the Fallen Sorcerer',
    areaSlug: 'declans-estate',
    description: 'The master of the estate and a key figure in the catastrophe. A late-game boss whose magic ties directly into the story’s darkest secrets.',
    attributes: { phases: 2, location: "Declan's Estate", rewards: ['Story progression'], weaknesses: [] },
    spoilerLevel: 2,
    sortOrder: 8,
  },
]

const ENDER_MAGNOLIA_SPIRITS: ItemSeed[] = [
  {
    name: 'Nola',
    itemTypeSlug: 'spirits',
    description: 'Lilac’s first and most essential companion, gained very early. A Primary-type Homunculus who fluidly switches between sword, scythe and axe for your core melee combos.',
    content: `## Role

Nola is your **Primary** attacker and the backbone of nearly every build. She can shift between three weapons mid-combo:

- **Sword** — fast, balanced ground combo
- **Scythe** — wider, slower arcs with better reach
- **Axe** — heavy, high-stagger swings

## Notes

- Obtained shortly after the opening, before the first boss.
- Most upgrade investment early on should go to Nola, since she is always in your kit.`,
    attributes: { effects: ['Primary melee', 'Sword / Scythe / Axe stance'], howToObtain: 'Main story — Subterranean Testing Site Ruins (very early)' },
    sortOrder: 1,
  },
  {
    name: 'Lito',
    itemTypeSlug: 'spirits',
    description: 'The first Homunculus recruited through combat. A close-range fighter whose punches and uppercuts can be augmented with elemental force.',
    attributes: { effects: ['Close-range strikes'], howToObtain: 'Defeat Lito, the Child Test Subject in Subterranean Testing Site Ruins' },
    sortOrder: 2,
  },
  {
    name: 'Yolvan',
    itemTypeSlug: 'spirits',
    description: 'A Homunculus recruited from the two-part boss by the Clock Tower Plaza, adding a new offensive option to Lilac’s repertoire.',
    attributes: { effects: ['Offensive ability'], howToObtain: 'Defeat Yolvan in Old City - Lower Stratum' },
    sortOrder: 3,
  },
  {
    name: 'Muninn',
    itemTypeSlug: 'spirits',
    description: 'An Autonomous owl Homunculus gifted by the Attuner Heath. It attacks on its own while you focus on movement and your Primary, providing steady free damage.',
    attributes: { effects: ['Autonomous owl', 'Passive damage'], howToObtain: 'Gift from Attuner Heath at the Magicite Mine rest area' },
    sortOrder: 4,
  },
  {
    name: 'Shackled Beast',
    itemTypeSlug: 'spirits',
    description: 'A powerful Homunculus that grants a counter/parry ability, turning well-timed defence into devastating offence.',
    attributes: { effects: ['Counter / parry'], howToObtain: 'Defeat the Shackled Beast in the Tethered Steeple' },
    spoilerLevel: 1,
    sortOrder: 5,
  },
  {
    name: 'Reibolg',
    itemTypeSlug: 'spirits',
    description: 'The Mad Knight recruited from the Crystalline Realm. A heavy-hitting Homunculus whose recruitment is tied to one of the game’s endings.',
    attributes: { effects: ['Heavy strikes'], howToObtain: 'Defeat Mad Knight Reibolg in the Crystalline Realm' },
    spoilerLevel: 1,
    sortOrder: 6,
  },
  {
    name: 'Luiseach',
    itemTypeSlug: 'spirits',
    description: 'A Homunculus recruited at the top of the Sorcerer Academy after Professor Eliza, expanding Lilac’s magical options.',
    attributes: { effects: ['Magical ability'], howToObtain: 'Defeat Luiseach at the Sorcerer Academy' },
    spoilerLevel: 1,
    sortOrder: 7,
  },
  {
    name: 'Huginn',
    itemTypeSlug: 'spirits',
    description: 'The second Autonomous owl Homunculus, partner to Muninn. Together the owls provide constant hands-off damage to support any build.',
    attributes: { effects: ['Autonomous owl', 'Passive damage'], howToObtain: 'Steel District — after meeting Levy twice, given via Heath at the Relic Refinery' },
    spoilerLevel: 1,
    sortOrder: 8,
  },
  {
    name: 'No. 7',
    itemTypeSlug: 'spirits',
    description: 'The Arena Tower champion turned ally. A Cooldown-type Homunculus delivering rapid slashes and status effects, whose Lunar Manifestation also unlocks new traversal.',
    attributes: { effects: ['Rapid slashes', 'Status effects', 'Lunar Manifestation traversal'], howToObtain: 'Defeat Combat Puppet No. 7 atop the Arena Tower (Steel District)' },
    spoilerLevel: 1,
    sortOrder: 9,
  },
  {
    name: 'Lorna',
    itemTypeSlug: 'spirits',
    description: 'A Frost Homunculus living in penance in the Frost Estate Ruins. Her powerful Autonomous skills apply chilling pressure that works differently from the owls.',
    attributes: { effects: ['Frost', 'Autonomous skills'], howToObtain: 'Main story — Frost Estate Ruins (above the Dust-covered Sofa respite)' },
    spoilerLevel: 1,
    sortOrder: 10,
  },
]

const ENDER_MAGNOLIA_RELICS: ItemSeed[] = [
  {
    name: 'Chain Belt',
    itemTypeSlug: 'relics',
    description: 'A passive relic equipped to enhance Lilac’s combat capabilities. One of the earliest relics, useful as a baseline upgrade in any loadout.',
    attributes: { effects: ['Passive combat bonus'], howToObtain: 'Found in the Lower Stratum' },
    sortOrder: 11,
  },
  {
    name: 'Sanguinary Raven',
    itemTypeSlug: 'relics',
    description: 'A passive relic tied to lifesteal-style sustain, rewarding aggressive play by converting offence into survivability.',
    attributes: { effects: ['Sustain on combat'], howToObtain: 'Recovered through exploration' },
    sortOrder: 12,
  },
  {
    name: 'Attuner Pendant',
    itemTypeSlug: 'relics',
    description: 'A relic resonating with Lilac’s nature as an Attuner, boosting the effectiveness of her purified Homunculi.',
    attributes: { effects: ['Enhances Homunculi'], howToObtain: 'Exploration reward' },
    sortOrder: 13,
  },
  {
    name: 'Echo Device',
    itemTypeSlug: 'relics',
    description: 'A relic that amplifies repeated or sustained attacks, favouring builds that keep constant pressure on a single target.',
    attributes: { effects: ['Sustained-damage bonus'], howToObtain: 'Exploration reward' },
    sortOrder: 14,
  },
  {
    name: 'Pure Floral Necklace',
    itemTypeSlug: 'relics',
    description: 'A delicate relic associated with vitality and recovery, smoothing out attrition in longer encounters.',
    attributes: { effects: ['Recovery / vitality'], howToObtain: 'Exploration reward' },
    sortOrder: 15,
  },
  {
    name: 'Eye of the Ancients',
    itemTypeSlug: 'relics',
    description: 'A rare relic carrying the lingering power of the world before the catastrophe — a strong late-game passive for an optimised build.',
    attributes: { rarity: 'rare', effects: ['Powerful passive bonus'], howToObtain: 'Late-game exploration' },
    spoilerLevel: 1,
    sortOrder: 16,
  },
]

const ENDER_MAGNOLIA_NPCS: NpcSeed[] = [
  {
    name: 'tori',
    areaSlug: 'subterranean-testing-site-ruins',
    description: 'A small floating companion who wakes alongside Lilac and guides her through the early ruins. tori serves as Lilac’s voice and conscience throughout the journey.',
    attributes: { role: 'Companion / Guide', services: ['Story guidance', 'Lore'], questRelated: false },
    sortOrder: 1,
  },
  {
    name: 'Heath',
    areaSlug: 'magicite-mine',
    description: 'A fellow Attuner met during the journey. He aids Lilac by gifting Homunculi such as Muninn and Huginn and refining relics at his workshop.',
    attributes: { role: 'Attuner / Ally', services: ['Gifts Homunculi', 'Relic refinement'], questRelated: true },
    spoilerLevel: 1,
    sortOrder: 2,
  },
  {
    name: 'Levy',
    areaSlug: 'steel-district',
    description: 'A wandering figure encountered in the Steel District whose repeated meetings advance a side questline tied to obtaining the owl Homunculus Huginn.',
    attributes: { role: 'Quest NPC', services: ['Side quest'], questRelated: true },
    spoilerLevel: 1,
    sortOrder: 3,
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// Insert helpers
// ═══════════════════════════════════════════════════════════════════════════

async function getGameId(slug: string): Promise<string> {
  const game = await db.query.games.findFirst({ where: eq(schema.games.slug, slug) })
  if (!game) throw new Error(`[content-seed] Game '${slug}' not found — run db:seed:phase3 first`)
  return game.id
}

async function itemTypeMap(gameId: string): Promise<Record<string, string>> {
  const rows = await db.query.itemTypes.findMany({ where: eq(schema.itemTypes.gameId, gameId) })
  return Object.fromEntries(rows.map((t) => [t.slug, t.id]))
}

async function areaMap(gameId: string): Promise<Record<string, string>> {
  const rows = await db.query.areas.findMany({ where: eq(schema.areas.gameId, gameId) })
  return Object.fromEntries(rows.map((a) => [a.slug, a.id]))
}

async function insertItems(gameId: string, types: Record<string, string>, items: ItemSeed[]) {
  if (!items.length) return
  await db
    .insert(schema.items)
    .values(
      items.map((i) => ({
        gameId,
        itemTypeId: types[i.itemTypeSlug] ?? null,
        name: i.name,
        slug: slugify(i.name),
        description: i.description,
        content: i.content ?? null,
        spoilerLevel: i.spoilerLevel ?? 0,
        attributes: i.attributes,
        isPublished: true,
      }))
    )
    .onConflictDoNothing()
  console.warn(`[content-seed]   ${items.length} item(s) inserted`)
}

async function insertNpcs(gameId: string, areas: Record<string, string>, npcs: NpcSeed[]) {
  if (!npcs.length) return
  await db
    .insert(schema.npcs)
    .values(
      npcs.map((n) => ({
        gameId,
        areaId: areas[slugify(n.areaSlug)] ?? null,
        name: n.name,
        slug: slugify(n.name),
        description: n.description,
        content: n.content ?? null,
        spoilerLevel: n.spoilerLevel ?? 0,
        attributes: n.attributes,
        isPublished: true,
      }))
    )
    .onConflictDoNothing()
  console.warn(`[content-seed]   ${npcs.length} NPC(s) inserted`)
}

async function updateBossContent(gameId: string, strategies: Record<string, string>) {
  let updated = 0
  for (const [bossSlug, content] of Object.entries(strategies)) {
    const res = await db
      .update(schema.bosses)
      .set({ content })
      .where(and(eq(schema.bosses.gameId, gameId), eq(schema.bosses.slug, bossSlug)))
      .returning({ id: schema.bosses.id })
    updated += res.length
  }
  console.warn(`[content-seed]   ${updated} boss strategy/strategies updated`)
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function seedBlasphemous() {
  console.warn('\n[content-seed] ── Blasphemous ──────────────────────────')
  const gameId = await getGameId('blasphemous')
  const types = await itemTypeMap(gameId)
  const areas = await areaMap(gameId)
  await insertItems(gameId, types, BLASPHEMOUS_ITEMS)
  await insertNpcs(gameId, areas, BLASPHEMOUS_NPCS)
  await updateBossContent(gameId, BLASPHEMOUS_BOSS_STRATEGIES)
}

async function seedSaltAndSanctuary() {
  console.warn('\n[content-seed] ── Salt and Sanctuary ───────────────────')
  const gameId = await getGameId('salt-and-sanctuary')
  const types = await itemTypeMap(gameId)
  const areas = await areaMap(gameId)
  await insertItems(gameId, types, SALT_ITEMS)
  await insertNpcs(gameId, areas, SALT_NPCS)
  await updateBossContent(gameId, SALT_BOSS_STRATEGIES)
}

async function seedEnderMagnolia() {
  console.warn('\n[content-seed] ── Ender Magnolia (correcting data) ──────')
  const gameId = await getGameId('ender-magnolia')

  // The original phase-3 seed used placeholder areas/bosses with the wrong
  // protagonist. Remove them and re-seed with researched, accurate data.
  await db.delete(schema.bosses).where(eq(schema.bosses.gameId, gameId))
  await db.delete(schema.npcs).where(eq(schema.npcs.gameId, gameId))
  await db.delete(schema.areas).where(eq(schema.areas.gameId, gameId))
  console.warn('[content-seed]   cleared placeholder areas/bosses/npcs')

  // Fix the game description (was "Play as Blume" — wrong game's protagonist).
  await db
    .update(schema.games)
    .set({ description: ENDER_MAGNOLIA_DESCRIPTION })
    .where(eq(schema.games.id, gameId))

  // Areas
  await db
    .insert(schema.areas)
    .values(
      ENDER_MAGNOLIA_AREAS.map((a) => ({
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
    )
    .onConflictDoNothing()
  console.warn(`[content-seed]   ${ENDER_MAGNOLIA_AREAS.length} area(s) inserted`)

  const areas = await areaMap(gameId)
  const types = await itemTypeMap(gameId)

  // Bosses
  await db
    .insert(schema.bosses)
    .values(
      ENDER_MAGNOLIA_BOSSES.map((b) => ({
        gameId,
        areaId: areas[slugify(b.areaSlug)] ?? null,
        name: b.name,
        slug: slugify(b.name),
        description: b.description,
        content: b.content ?? null,
        spoilerLevel: b.spoilerLevel ?? 0,
        sortOrder: b.sortOrder,
        attributes: b.attributes,
        isPublished: true,
      }))
    )
    .onConflictDoNothing()
  console.warn(`[content-seed]   ${ENDER_MAGNOLIA_BOSSES.length} boss(es) inserted`)

  await insertItems(gameId, types, ENDER_MAGNOLIA_SPIRITS)
  await insertItems(gameId, types, ENDER_MAGNOLIA_RELICS)
  await insertNpcs(gameId, areas, ENDER_MAGNOLIA_NPCS)
}

async function publishGames() {
  console.warn('\n[content-seed] ── Publishing games ─────────────────────')
  for (const slug of ['blasphemous', 'salt-and-sanctuary', 'ender-magnolia']) {
    await db.update(schema.games).set({ isPublished: true }).where(eq(schema.games.slug, slug))
    console.warn(`[content-seed]   ${slug} published`)
  }
}

async function main() {
  await seedBlasphemous()
  await seedSaltAndSanctuary()
  await seedEnderMagnolia()
  await publishGames()
  console.warn('\n[content-seed] ✓ Phase 3 content seed complete.')
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
