/**
 * Ender Lilies: Quietus of the Knights — full content seed.
 * Run with: npm run db:seed
 *
 * All inserts use onConflictDoNothing so the script is safe to re-run.
 * Execution order: game → item_types → areas → bosses → items (spirits, relics) → npcs
 */
import { config } from 'dotenv'

// Must be first — loads DATABASE_URL before any drizzle/postgres init
config({ path: '.env.local' })

import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set in .env.local')

const client = postgres(url, { max: 1, prepare: false })
const db = drizzle(client, { schema })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Area data
// ---------------------------------------------------------------------------

const AREA_DATA = [
  {
    name: 'White Parish',
    description: 'The rain-soaked ruins of a great cathedral where Lily awakens. The Blight Rain never ceases here.',
    content: `## Overview

White Parish is the opening area of Ender Lilies and the place where Lily first awakens with no memories. The once-grand cathedral is now crumbling, its pews overturned and its stained glass shattered. The Blight Rain falls endlessly through broken ceilings, pooling in the aisles.

## Enemies

- **Blighted Servants** — slow, lurching enemies that swipe with corroded arms
- **Blighted Archers** — stationary enemies that fire Blight arrows at range
- **Rusted Knight** — heavily armoured enemies that block frontal attacks

## Notable Locations

- **Lily's Rest** — the altar where Lily begins her journey; the White Priest August first speaks to her here
- **Outer Courtyard** — a collapsed garden connecting the nave to the Underground Cemetery
- **Bell Tower** — a high vantage point with a relic chest and a shortcut lever`,
    mapX: 22,
    mapY: 28,
    sortOrder: 1,
    spoilerLevel: 0,
  },
  {
    name: "Witch's Thicket",
    description: 'A dense, corrupted forest where two witches hold dominion. Their magic twists the trees into labyrinthine walls.',
    content: `## Overview

The Witch's Thicket lies beyond the Parish walls. What was once a sacred forest used for gathering medicinal herbs has been warped by Blight energy and the magic of the witches who retreated here when the kingdom fell. Hanging lanterns cast sickly light between gnarled branches, and enchanted barriers block many passages until the right spirit is obtained.

## Enemies

- **Blighted Wolves** — fast, low to the ground, attack in pairs
- **Thorn Sprites** — tiny enemies that hurl thorn projectiles from the canopy
- **Witch Initiates** — humanoid enemies that cast small magical orbs
- **Giant Blighted Frog** — a large ambush enemy that leaps from pools

## Notable Locations

- **Witches' Confluence** — the clearing where Eleine and Miriam's territories meet
- **The Hanging Garden** — an elevated platform maze rich with relics
- **Hidden Spring** — a secret pool that restores full HP, activated by a nearby rune`,
    mapX: 18,
    mapY: 45,
    sortOrder: 2,
    spoilerLevel: 0,
  },
  {
    name: 'Underground Cemetery',
    description: 'Ancient burial grounds beneath the kingdom where the dead refuse to rest. Narrow corridors wind between towering crypts.',
    content: `## Overview

The Underground Cemetery predates the kingdom of End itself. Generations of royalty, knights, and common people were interred here in ever-deepening chambers. The Blight has reanimated many of them. The cemetery connects the Parish above to the Verboten Domain below via a series of locked iron gates.

## Enemies

- **Risen Dead** — shambling undead that grab and bite; staggers easily
- **Bone Archers** — skeletal archers positioned on ledges
- **Grave Wardens** — large armoured undead with wide sweeping attacks
- **Crypt Phantoms** — translucent enemies that pass through walls briefly

## Notable Locations

- **Royal Mausoleum** — the sealed tombs of the last three monarchs, containing a powerful relic behind a puzzle lock
- **Knight's Interment Hall** — where the Order of the White Knights were buried en masse; Gerrod's arena is here
- **The Ossuary** — a room of bones and dust where a hidden passage leads to the Cliffside Hamlet`,
    mapX: 38,
    mapY: 40,
    sortOrder: 3,
    spoilerLevel: 0,
  },
  {
    name: 'Verboten Domain',
    description: 'The restricted castle district once forbidden to all but the highest-ranking nobles. Blighted guards still follow their last orders.',
    content: `## Overview

The Verboten Domain encompasses the inner castle precincts: the throne wing, the war rooms, and the residential quarters of the old court. The Blighted soldiers here are among the most disciplined and dangerous in the kingdom, still maintaining formations after their corruption. Iron gates and magical seals require specific spirits to bypass.

## Enemies

- **Blighted Halberdiers** — reach enemies with wide sweeping polearms
- **Forbidden Guard Elites** — armoured enemies that shield-bash and counter-attack
- **Court Mages** — magic-using enemies that fire tracking orbs
- **Blighted Hounds** — fast hunting animals now leashed only to violence

## Notable Locations

- **The War Room** — a large hall with strategic maps still pinned to collapsed tables; contains a lore item about the Blight's origin
- **Royal Armory** — a room of rusted weapons where Faden's arena lies
- **Throne Hall Approach** — a grand corridor leading to a sealed throne room requiring all knight spirits`,
    mapX: 65,
    mapY: 38,
    sortOrder: 4,
    spoilerLevel: 0,
  },
  {
    name: 'Cliffside Hamlet',
    description: 'A ruined village perched on dramatic cliffs. The residents are gone — or worse, still here, changed beyond recognition.',
    content: `## Overview

Cliffside Hamlet was a prosperous market village before the Blight came. Its tiered buildings climb the cliff face, connected by rope bridges that have mostly frayed or fallen. Many of the residents refused to flee and gradually succumbed to the Blight in place. The vertical layout makes traversal treacherous — falling from upper levels deals significant damage.

## Enemies

- **Blighted Villagers** — former residents, erratic and aggressive in packs
- **Hamlet Militia** — lightly armoured enemies with crossbows and short swords
- **Cliff Crawlers** — creatures that cling to walls and drop from above
- **The Merchant** — a unique mini-boss variant that drops a key relic

## Notable Locations

- **The Market Square** — the central hub connecting all hamlet tiers; save shrine here
- **The Watchtower** — the highest point in the hamlet with a view of the kingdom and a powerful relic in a locked chest
- **Rope Bridge Traverse** — the connection to the Cliffside Hamlet's deeper section where Ribald waits`,
    mapX: 80,
    mapY: 25,
    sortOrder: 5,
    spoilerLevel: 0,
  },
  {
    name: 'Eternal Cloister',
    description: 'A great monastery and library where scholars sought to document and understand the Blight. Their obsession doomed them.',
    content: `## Overview

The Eternal Cloister is the largest structure in the kingdom after the central castle. Monks and scholars lived and worked here for centuries, and its library contains the most complete written record of the kingdom's history. When the Blight came, the scholars locked themselves inside and continued their research, convinced they could find a cure. Most perished in their experiments; a few became something else.

## Enemies

- **Blighted Monks** — enemies that chant to buff nearby allies; silence them first
- **Scholar Constructs** — magical animated suits of armour created by the researchers
- **Corrupted Librarians** — fast-moving enemies that throw heavy books and potions
- **Cloister Guards** — the monastery's own armed guardians, now Blighted

## Notable Locations

- **The Grand Library** — multi-storey room with climbable bookshelves and multiple lore scrolls
- **Research Chambers** — where Hoenir's arena is located, amid his failed experiments
- **The Relic Vault** — a sealed chamber accessible only with a specific key item, containing two high-tier relics`,
    mapX: 60,
    mapY: 18,
    sortOrder: 6,
    spoilerLevel: 0,
  },
  {
    name: 'Subterranean Hall',
    description: 'Vast engineered passages beneath the kingdom, built to move goods and people unseen. Now they carry only Blight.',
    content: `## Overview

The Subterranean Hall is a network of wide underground corridors originally built as a service passage system for the castle. Workers, supplies, and the kingdom's secrets passed through here unseen. The passages are wide enough to feel oppressive rather than claustrophobic, and the lack of any natural light means old lanterns are the only illumination — most of which have gone dark.

## Enemies

- **Sewer Rats** — large Blighted rodents that attack in swarms
- **Subterranean Knights** — a heavier variant of knight enemy with high HP
- **Fungal Creatures** — entities grown from Blight-accelerated mould, slow but hard-hitting
- **Tunnel Wraiths** — fast spectral enemies that emerge from the walls briefly

## Notable Locations

- **The Drainage Hub** — a large circular chamber where multiple passage branches meet; key shortcut node
- **Dorothea's Reservoir** — a flooded section of the hall where Dorothea has made her territory
- **The Collapsed Section** — a caved-in area requiring a specific spirit to bypass, leading to a shortcut to the Ancient Hollow`,
    mapX: 50,
    mapY: 58,
    sortOrder: 7,
    spoilerLevel: 0,
  },
  {
    name: 'Ancient Hollow',
    description: 'Deep underground ruins that predate the kingdom itself. What slumbered here was better left undisturbed.',
    content: `## Overview

The Ancient Hollow lies below even the Subterranean Hall, accessible only through a hidden collapse or by Spirit-assisted passage. The ruins here use a different architectural language from anything above — older, more organic in design, with materials that resist the Blight entirely. The creatures here predate the Blight and have developed their own relationship with Lily's journey.

## Enemies

- **Ancient Sentinels** — large stone-like guardians that activate when approached; slow but devastating
- **Deep Crawlers** — pale, eyeless creatures adapted to total darkness
- **Root Walkers** — entities made of ancient root material; absorb some physical damage
- **The Hollow Guardian** — a unique mid-area enemy guarding the path to the inner sanctum

## Notable Locations

- **The Primordial Chamber** — a vast room with a ceiling too high to see, containing the oldest lore inscriptions in the game
- **Ulv's Sanctum** — a sealed arena where the Mad Knight waits
- **The Deep Spring** — a healing spring accessible only after defeating the inner sanctum guardian`,
    mapX: 48,
    mapY: 75,
    sortOrder: 8,
    spoilerLevel: 0,
  },
  {
    name: 'Stockade',
    description: 'The kingdom\'s prison complex, home to its worst criminals and most dangerous political prisoners. The Blight found fertile ground here.',
    content: `## Overview

The Stockade housed the kingdom's worst offenders — murderers, traitors, those deemed too dangerous for society. The prison guards were among the most ruthless of the kingdom's forces, and many prisoners were subjected to harsh conditions. When the Blight came, it found no shortage of suffering here to accelerate. Both guards and prisoners now roam the halls equally corrupted.

## Enemies

- **Blighted Wardens** — heavy enemies with stun batons and chains; can grab Lily
- **Prisoner Hordes** — fast, reckless enemies with no armour but high aggression
- **Execution Knights** — elite prison guards armed with weighted maces
- **Chain Wraiths** — spectral enemies that move along the ceiling chains

## Notable Locations

- **Cell Block A** — the general population wing; several hidden items in breakable cells
- **The Deep Keep** — maximum security section where Warrior Lambach is confined
- **Interrogation Chamber** — a room with lore items describing the crimes of specific prisoners`,
    mapX: 20,
    mapY: 65,
    sortOrder: 9,
    spoilerLevel: 0,
  },
  {
    name: "End's Depths",
    description: 'The deepest point of the fallen kingdom, where the Blight originated. Lily\'s journey leads here inevitably.',
    content: `## Overview

End's Depths is the final area of the game, accessible only after gathering all main spirits. The architecture here has been entirely consumed by the Blight, which has crystallised the stone walls and pooled in luminous lakes on the ground. The air itself feels wrong — heavy with meaning and with dread.

The true origin of the Blight and the fate of the kingdom is revealed here through environmental storytelling and the final confrontation.`,
    mapX: 48,
    mapY: 90,
    sortOrder: 10,
    spoilerLevel: 2,
  },
]

// ---------------------------------------------------------------------------
// Boss data
// ---------------------------------------------------------------------------

const BOSS_DATA = [
  {
    name: 'Julius, Last Knight',
    areaSlug: 'white-parish',
    description: 'The mightiest knight of the old order, corrupted by the Blight but still bearing the discipline of his training. He serves as Lily\'s first major trial.',
    content: `## Overview

Julius was the last surviving knight of the White Order before the Blight took him. He towers over ordinary enemies, clad in corroded plate armour that still bears the crest of the kingdom. Despite his corruption he retains his combat training, and every attack carries the weight of a lifetime of swordsmanship.

## Phase 1

Julius opens with wide horizontal slashes that sweep the full width of the arena. His slam attack buries his sword in the ground, creating a shockwave on either side. He also performs a running charge that ends with an overhead cleave.

**Key tells:**
- Horizontal slash: sword lifts to his shoulder → dodge *into* him, not away
- Ground slam: sword raises overhead slowly → position to the side before impact
- Running charge: he backs to the far wall → jump over the shockwave at the end

## Phase 2 (below 50% HP)

Julius emits Blight energy on each slash, extending their range and adding a lingering energy wave. His charge now includes a follow-up rising slash after landing.

**Key tells:**
- The energy wave from slashes travels horizontally; jump or hug a wall to avoid it
- After the charge's overhead cleave, dash backwards before the rising slash activates

## Strategy Tips

- Stay at mid range: too close and you get caught by sweep start; too far and you chase the shockwave
- Use Lily's dash through his horizontal slashes — dash toward him at the moment of swing
- Julius staggers briefly after the ground slam; that is the primary DPS window
- The Worn Charm relic's minor physical resistance noticeably reduces his damage`,
    attributes: {
      hp: 2400,
      phases: 2,
      location: 'White Parish — Cathedral Nave',
      rewards: ["Julius's Spirit", 'Ancient Pendant (Relic)'],
      weaknesses: ['Magic', 'Lightning'],
      resistances: ['Physical'],
    },
    sortOrder: 1,
    spoilerLevel: 0,
  },
  {
    name: 'Gerrod, the Headless Knight',
    areaSlug: 'underground-cemetery',
    description: 'A massive knight whose head was severed in battle long before the Blight came. He compensates for his blindness with relentless, crashing charges.',
    content: `## Overview

Gerrod is the Blighted remnant of a knight who was beheaded for desertion. His spirit was so anchored to his guilt and shame that even the Blight could not fully consume him. Without a head, he cannot see — he charges on sound and vibration, making him predictable but extraordinarily hard-hitting when he connects.

## Phase 1

Gerrod charges horizontally across the arena repeatedly, covering the full width in a single lunge. Between charges he performs a ground stomp that creates radial cracks — stand still when this happens, or the vibration causes him to home in immediately.

**Key tells:**
- Charge: he lowers his shoulder and *pauses half a second* → jump the moment he launches
- Ground stomp: he raises one foot high and stamps → jump immediately on the stamp impact

## Phase 2 (below 40% HP)

Gerrod begins performing double charges in rapid succession without pause. He also adds a spinning attack where he rotates with arms outstretched before launching into a charge.

**Key tells:**
- Double charge: after the first charge ends, do NOT land and dash away — stay in the air, he charges back instantly
- Spinning attack: a full spin animation is the tell → get to the edge of the arena and jump over the launch

## Strategy Tips

- Never stand in the direct horizontal centre of the arena during his idle — he will charge at the next vibration
- The space *behind* Gerrod after a charge is the safest attack window
- His stomp pattern gives consistent damage opportunities; bait the stomp and punish
- Wall jump relics or the Ancient Pendant help if chip damage from the stomp becomes a threat`,
    attributes: {
      hp: 3100,
      phases: 2,
      location: 'Underground Cemetery — Knight Interment Hall',
      rewards: ["Gerrod's Spirit", 'Stone Ring (Relic)'],
      weaknesses: ['Fire', 'Magic'],
      resistances: ['Physical', 'Dark'],
    },
    sortOrder: 2,
    spoilerLevel: 0,
  },
  {
    name: 'Eleine, Witch of the Lake',
    areaSlug: 'witchs-thicket',
    description: 'A water witch who retreated to a sacred lake deep in the Thicket. She commands a vast serpent familiar and rains homing water bullets from above.',
    content: `## Overview

Eleine was one of the most powerful witches in the kingdom before the Blight took her. She and her serpent familiar, whom she called Ames, formed a symbiotic bond that amplified both their power. The Blight only deepened this bond, and in her corrupted state Eleine no longer distinguishes herself from Ames — they fight as one.

## Phase 1

Eleine floats at mid-height, firing bursts of three homing water bullets that curve toward Lily. Ames attacks from the floor and ceiling with head lunges. Eleine is the priority target; Ames cannot be killed.

**Key tells:**
- Water bullet burst: Eleine's hand glows blue → bullets release with a short arc delay, dash *through* the group rather than away
- Ames floor lunge: shadow appears below Lily → jump; Ames head emerges from floor
- Ames ceiling drop: Ames disappears from view → watch for ceiling shadow, move laterally

## Phase 2 (below 45% HP)

Eleine descends and merges partially with Ames, becoming more aggressive. She now fires eight-directional bullet patterns and uses Ames for coordinated pincer attacks.

**Key tells:**
- Eight-way spread: fires simultaneously in all cardinal and diagonal directions → hug close to Eleine between two spread directions
- Pincer: Ames appears on both floor and ceiling simultaneously → jump while dashing laterally to split the two attacks

## Strategy Tips

- Eleine takes reduced damage when Ames is actively attacking — wait for Ames to retreat
- Julius's Spirit's wide slash hits Eleine reliably regardless of her vertical position
- The Stone Ring relic significantly reduces water bullet damage
- Do not try to position above Eleine in Phase 2 — the ceiling is Ames's territory`,
    attributes: {
      hp: 3800,
      phases: 2,
      location: "Witch's Thicket — Lake Shore Arena",
      rewards: ["Eleine's Spirit", 'Liquid Form (Relic)'],
      weaknesses: ['Lightning', 'Fire'],
      resistances: ['Water', 'Cold'],
    },
    sortOrder: 3,
    spoilerLevel: 0,
  },
  {
    name: 'Faden, the Mutated Soldier',
    areaSlug: 'verboten-domain',
    description: 'A royal soldier whose exposure to concentrated Blight caused catastrophic mutation. His body has grown four additional lance-wielding arms.',
    content: `## Overview

Faden was a Forbidden Guard assigned to the deepest Verboten Domain when the Blight concentrations were highest. Prolonged exposure twisted him into something barely recognisable. He experiences constant pain, which the Blight has transmuted into perpetual, mindless aggression. The lances growing from his mutated limbs were once ceremonial weapons — he now wields them with brutish power.

## Phase 1

Faden throws lances that embed in the ground and create persistent Blight hazard zones for several seconds. He charges with multiple arms at once, and occasionally slams all lance-arms downward in an AoE.

**Key tells:**
- Lance throw: a lance-arm pulls back briefly → the lance travels in a straight line; move perpendicular to his facing direction
- Multi-arm charge: he hunches low with all arms trailing behind → jump and dash over the charge path
- AoE slam: all arms raise overhead → move to maximum range; the slam radius is large but has clear outer edges

## Phase 2 (below 50% HP)

Faden enters a frenzy, throwing lances faster and adding a spinning lance whirl that lasts several seconds. The hazard zones from embedded lances now stack.

**Key tells:**
- Lance frenzy: rapid-fire throws with shorter wind-up → read arm-pull direction and continuously reposition
- Spinning whirl: he extends all arms and rotates → find the safe distance band (too close is lethal, too far hits the lances)

## Strategy Tips

- Lances embedded in the ground are deadly; always know where they are
- Faden's movement is slow between attacks — maximise mobility to keep ground clear
- Gerrod's Spirit charge attack passes through Faden's lances and punishes reliably
- The Fleeting Form relic's reduced dash cooldown is extremely valuable in Phase 2`,
    attributes: {
      hp: 4200,
      phases: 2,
      location: 'Verboten Domain — Royal Armoury',
      rewards: ["Faden's Spirit", 'Iron Presence (Relic)'],
      weaknesses: ['Magic', 'Holy'],
      resistances: ['Physical'],
    },
    sortOrder: 4,
    spoilerLevel: 0,
  },
  {
    name: 'Miriam, Witch of Thorns',
    areaSlug: 'witchs-thicket',
    description: 'The second witch of the Thicket, who weaponised the forest itself. She commands living thorn walls and projectile storms.',
    content: `## Overview

Miriam was the more controlled of the two lake witches — methodical and precise where Eleine was passionate and intuitive. The Blight accelerated her connection to the forest's thorn plants, giving her total control over the Thicket's most dangerous vegetation. She is a more calculated fight than Eleine, with punishing patterns for mistimed approaches.

## Phase 1

Miriam fires slow-moving thorn clusters that split on contact with walls or floor. She erects moving thorn walls that cross the arena vertically, and performs a thorn dash leaving a trail of spike patches.

**Key tells:**
- Thorn cluster: a glowing cluster leaves her hand → can be destroyed by attacking; easier to cut down than dodge
- Thorn wall: a dark mass forms at one edge → two walls cross the arena at different speeds; find the gap in timing
- Thorn dash: she coils briefly before launching forward → the trail is permanent for ~5 seconds; memorise where she dashed

## Phase 2 (below 40% HP)

Miriam becomes fully entwined with the thorn network, summoning additional walls and adding an AoE thorn eruption from all existing spike patches simultaneously.

**Key tells:**
- Spike eruption: existing patches pulse once before erupting → identify clear ground ahead of time; this is the main Phase 2 threat
- Triple wall: she summons three walls simultaneously at different speeds → prioritise reading the fastest wall first

## Strategy Tips

- Destroying thorn clusters early prevents them from clogging the arena
- Memorise the thorn dash path; it limits safe movement for several seconds
- Hoenir's Spirit beam pierces thorn walls and deals damage to Miriam behind them
- Bring the Dead Knight's Ring for extra burst during the limited attack windows in Phase 2`,
    attributes: {
      hp: 3600,
      phases: 2,
      location: "Witch's Thicket — Thorn Glade",
      rewards: ["Miriam's Spirit", "Witch's Talisman (Relic)"],
      weaknesses: ['Fire', 'Ice'],
      resistances: ['Dark', 'Poison'],
    },
    sortOrder: 5,
    spoilerLevel: 0,
  },
  {
    name: 'Hoenir, the Scholar',
    areaSlug: 'eternal-cloister',
    description: 'The head of the Cloister\'s research division, who believed knowledge of the Blight could defeat it. His research consumed him — literally.',
    content: `## Overview

Hoenir was brilliant and obsessive in equal measure. When the other scholars fled or succumbed passively, Hoenir continued his experiments, injecting himself with controlled doses of Blight to better understand its mechanism. The result is an entity of immense magical power with no remaining human motivation beyond destruction. His fighting style reflects his scientific mind: methodical, varied, and deliberately complex.

## Phase 1

Hoenir teleports around the arena, firing homing magical orbs from each position. He also charges and fires a straight piercing beam that sweeps slowly after hitting a wall.

**Key tells:**
- Teleport + orbs: teleport flash is instant → orbs are fired immediately; target was Lily's position at time of teleport, not after
- Sweeping beam: he holds still and charges an arm → beam fires and sweeps in a 90-degree arc; jump or stand at max beam length to find the pivot point

## Phase 2 (below 50% HP)

Hoenir adds a multi-target orb spread that fires simultaneously from three teleport positions, and upgrades his beam to a cross-beam that sweeps both directions.

**Key tells:**
- Multi-target spread: three brief flashes before firing → dash direction before all three orbs release; one direction is almost always clear
- Cross-beam: arms extend in opposite directions → find the corner not in the sweep path and stay there through both sweeps

## Strategy Tips

- Hoenir's homing orbs track well initially but lose tracking after a second; lead them into a turn before dashing through
- Attack windows open at every teleport landing — he has a brief pause before acting
- Eleine's Spirit homing bullets naturally seek him between teleports without aim adjustment
- The Scholar's Memoir relic dramatically boosts Hoenir Spirit beam damage for the return encounter`,
    attributes: {
      hp: 3400,
      phases: 2,
      location: 'Eternal Cloister — Research Chambers',
      rewards: ["Hoenir's Spirit", "Scholar's Memoir (Relic)"],
      weaknesses: ['Physical', 'Lightning'],
      resistances: ['Magic', 'Fire'],
    },
    sortOrder: 6,
    spoilerLevel: 0,
  },
  {
    name: 'Dorothea, Witch of the Drowned City',
    areaSlug: 'subterranean-hall',
    description: 'A water witch who flooded a section of the Subterranean Hall to create her domain. She commands ring-shaped waves and water elemental servants.',
    content: `## Overview

Dorothea was not a court witch — she came from a coastal village that was abandoned after flooding made it uninhabitable. She sought the Subterranean Hall as a new home and claimed the drainage reservoir as her domain. The Blight amplified her natural affinity for water into something extraordinary and deadly. She is protective rather than aggressive by nature, but the Blight has erased the difference.

## Phase 1

Dorothea fires large expanding rings of water that travel outward from her position. She summons water elementals that orbit her and fire projectiles. She also performs a vertical water pillar attack at Lily's position.

**Key tells:**
- Water rings: she extends arms wide → rings travel at a consistent speed; jump precisely when the ring reaches Lily; double-jump if a second ring immediately follows
- Elementals: she gestures to summon → attack the elementals immediately; they fire rapidly if left alive
- Water pillar: she looks directly at Lily and points down → move laterally, the pillar has a slight delay

## Phase 2 (below 45% HP)

Dorothea submerges partially and attacks from the water floor, adding upward water geysers beneath Lily's feet and increasing ring frequency.

**Key tells:**
- Geyser: the floor ripples under Lily's feet → move immediately; geysers have a short but consistent delay
- Double ring: after a submerge she fires two rings in quick succession → the jump timing for the second ring is earlier than expected because it travels slightly faster

## Strategy Tips

- Water ring timing is the core skill test; practice the jump early-landing rhythm
- Kill elementals immediately; the combination of elemental fire and rings is the main source of fatal damage
- Julius's wide slashes easily hit multiple elementals at once
- Liquid Form relic is highly effective here, reducing both ring and geyser damage`,
    attributes: {
      hp: 4000,
      phases: 2,
      location: 'Subterranean Hall — Drainage Reservoir',
      rewards: ["Dorothea's Spirit", 'Prayer Beads (Relic)'],
      weaknesses: ['Lightning', 'Ice'],
      resistances: ['Water', 'Physical'],
    },
    sortOrder: 7,
    spoilerLevel: 0,
  },
  {
    name: 'Ribald, the Crumbling Knight',
    areaSlug: 'cliffside-hamlet',
    description: 'An ancient knight whose armour and body have become one with stone. He crumbles with each blow, growing more erratic as he falls apart.',
    content: `## Overview

Ribald is one of the oldest knights in the kingdom's history, having served four successive monarchs. His armour was never replaced; over decades it fused to his body and calcified into something between metal and stone. The Blight found him already partially mineral, and the result is an enemy who is more statue than man — until provoked.

## Phase 1

Ribald is slow but each attack covers enormous area. He performs a two-hit hammer swing, a ground pound that creates wide radial cracks, and a rolling attack where he tucks into a ball and crosses the arena.

**Key tells:**
- Hammer swing: weapon lifts fully overhead and pauses → dodge the first swing; immediately dodge again as the backswing follows
- Ground pound: he crouches low and slams → the cracks radiate outward; jump when cracks form beneath Lily
- Roll: he tucks and a grinding stone sound occurs → jump over the roll or dash through it as he passes

## Phase 2 (below 50% HP)

Ribald literally begins to crumble, shedding stone chunks that impact the ground and breaking some of his attacking limbs — which paradoxically makes him faster because they no longer slow him down. His roll now bounces off walls.

**Key tells:**
- Falling stone chunks: random debris falls while he moves → keep moving to avoid being caught in debris fields
- Bouncing roll: reads the wall angles to predict where he exits the roll; the bouncing pattern is consistent after the first wall hit

## Strategy Tips

- Ribald's slowness in Phase 1 allows for consistent ground pound baits; his window is long
- The Phase 2 rolling bounce is the hardest pattern — stop and read the bounce angles rather than blindly dodging
- Miriam's thorn spread damages him from safe range and applies consistent pressure
- Iron Presence relic reduces the knockback from debris impacts in Phase 2`,
    attributes: {
      hp: 5200,
      phases: 2,
      location: 'Cliffside Hamlet — Rope Bridge Platform',
      rewards: ["Ribald's Spirit", "Knight's Code (Relic)"],
      weaknesses: ['Magic', 'Water'],
      resistances: ['Physical', 'Lightning'],
    },
    sortOrder: 8,
    spoilerLevel: 0,
  },
  {
    name: 'Ulv, the Mad Knight',
    areaSlug: 'ancient-hollow',
    description: 'A knight who voluntarily surrendered his sanity in exchange for power. In the Ancient Hollow, he found what he was looking for — and it destroyed what remained of him.',
    content: `## Overview

Ulv was an exceptional knight who believed that rational thought constrained potential. He sought to tap into something older and more primal beneath the Blight, deliberately exposing himself to Ancient Hollow energies that predated the kingdom entirely. The process worked: he became extraordinarily powerful. He also lost everything that made him human.

## Phase 1

Ulv attacks with sword combos of three to five hits, faster than any knight encountered before. He uses a gap-closing dash slash, a rising uppercut, and a brief counter window where attacking during a specific animation results in a punish combo.

**Key tells:**
- Sword combo: begins with a lunging step → count the hits; the combo length varies but the pause *after* it is always the same duration
- Dash slash: he vanishes briefly → reappears directly at Lily's current position; dash the moment he vanishes
- Counter window: he lowers his weapon while watching Lily → attacking here triggers his counter; wait out the window

## Phase 2 (below 35% HP)

Ulv gains Ancient Hollow energy traces and his combos extend by one to two hits each. He adds a multi-hit spin attack and his dash slash now has a follow-up rising strike.

**Key tells:**
- Extended combos: the extra hits come with *no wind-up change* — react to hit sounds rather than animations; count as before
- Spin attack: he bends forward → the spin is wide but has a consistent radius; back away to edge distance and dash through when he commits
- Dash-slash follow-up: after the dash slash lands → the rising strike comes immediately; a second dash in the same direction escapes it

## Strategy Tips

- Ulv is the hardest main knight boss; patience and pattern counting are essential
- Never attack during the counter window — wait the full animation before punishing
- Dorothea's water rings are useful here: they cover wide area and pressure Ulv between his own attacks
- The Battle Cry relic converts Phase 2's damage pressure into an offensive opportunity`,
    attributes: {
      hp: 5800,
      phases: 2,
      location: 'Ancient Hollow — Ulv\'s Sanctum',
      rewards: ["Ulv's Spirit", "Battle Cry (Relic)"],
      weaknesses: ['Holy', 'Fire'],
      resistances: ['Physical', 'Dark'],
    },
    sortOrder: 9,
    spoilerLevel: 0,
  },
  {
    name: 'Bastel, the Charmed One',
    areaSlug: 'eternal-cloister',
    description: 'An optional boss: a court entertainer who mastered illusion magic and now uses it to fight with mirror selves and butterfly swarms.',
    content: `## Overview

Bastel was the crown's favoured illusionist, known for spectacular performances involving dozens of butterfly puppets. When the Blight came, his illusionary creations manifested independently, and Bastel merged with his own art. He is optional and can be skipped, but his spirit is useful for the late game.

## Phase 1

Bastel creates two mirror copies of himself that attack simultaneously. Only one copy is the real Bastel; the copies flicker briefly when they attack. He also releases butterfly swarms that home on Lily.

**Key tells:**
- Real Bastel: the real copy *flickers very slightly* before attacking, while the illusions attack cleanly; focus on the flicker tell
- Butterfly swarm: the real Bastel raises both arms → swarm is released; dodge through the swarm or lure it into a wall

## Phase 2 (below 50% HP)

Bastel increases copies to three and adds a phase where all copies rush simultaneously from different angles.

## Strategy Tips

- The flicker distinction is subtle — stay calm and don't rush to attack all three targets
- Butterflies can be individually destroyed for a brief breather
- This fight rewards observation more than reaction speed`,
    attributes: {
      hp: 3200,
      phases: 2,
      location: 'Eternal Cloister — Illusionist\'s Gallery',
      rewards: ["Bastel's Spirit", 'Crow\'s Eye (Relic)'],
      weaknesses: ['Fire', 'Physical'],
      resistances: ['Magic', 'Illusion'],
    },
    sortOrder: 10,
    spoilerLevel: 1,
  },
  {
    name: 'Warrior Lambach',
    areaSlug: 'stockade',
    description: 'An optional boss: an enormous warrior imprisoned for crimes against the crown. In the Stockade, his Blight corruption has made him a colossus.',
    content: `## Overview

Lambach was a general who turned against the king in a failed coup attempt. His physical size and strength were legendary even before the Blight. The prison was barely sufficient to hold him when he was human. The Blight broke all remaining restraints.

## Phase 1

Lambach uses a shield bash with a wide shockwave and a leaping sword strike that cracks the arena floor. He also performs a horizontal shield sweep at ground level.

**Key tells:**
- Shield bash: shield pulls back to his side → shockwave expands from impact point; jump the shockwave ring
- Leap strike: he jumps straight up, pauses, then crashes down → move laterally as he reaches apex; the cracks spread outward from landing
- Shield sweep: he lowers his shield to floor level → this is a low attack; jump over it

## Strategy Tips

- Attack from behind after the leap strike landing — that is the clearest punish window
- Faden's Spirit lance pins Lambach in place briefly, creating a reliable damage window
- Warrior Lambach rewards learning exactly two or three punish windows and repeating them`,
    attributes: {
      hp: 6500,
      phases: 1,
      location: 'Stockade — The Deep Keep',
      rewards: ["Warrior Lambach's Spirit", "Warrior's Crest (Relic)"],
      weaknesses: ['Magic', 'Lightning'],
      resistances: ['Physical', 'Fire'],
    },
    sortOrder: 11,
    spoilerLevel: 1,
  },
  {
    name: 'Clad, the Flame Knight',
    areaSlug: 'subterranean-hall',
    description: 'An optional boss: a knight consumed by Blight fire. Every attack scorches the arena; attrition against him is impossible.',
    content: `## Overview

Clad was the captain of a flame-weapon unit that used incendiary devices against the Blight in early days of the outbreak. The weapons worked but the Blight countered by infusing the fire itself with its corruption. Clad was caught in a Blight-fire explosion and has burned ever since, yet cannot die.

## Phase 1

Clad performs dash attacks that leave long fire trails on the ground. His sword slash creates fire arcs that persist briefly. He also stomps to erupt fire pillars in a radius around himself.

**Key tells:**
- Dash trail: he ignites and rushes forward → the trail persists 4–5 seconds; track all trails to maintain a mental map of safe ground
- Fire arc slash: sword glows orange → arc travels horizontally; jump over it or land exactly at its edge
- Fire stomp: he raises a foot with a flame animation → move to max stomp radius immediately

## Phase 2 (below 50% HP)

The fire trails extend in duration and Clad performs a multi-dash sequence leaving crossing trails that shrink safe ground dramatically.

## Strategy Tips

- Ground management is the entire fight — never stop mentally mapping safe tiles
- Ice-aspected attacks, if available, clear fire patches
- Clad's Remains relic (obtained from defeating him) grants fire immunity — invaluable on a replay
- Sprint constantly; never settle in one position`,
    attributes: {
      hp: 5500,
      phases: 2,
      location: 'Subterranean Hall — Flame Corridor',
      rewards: ["Clad's Spirit", "Clad's Remains (Relic)"],
      weaknesses: ['Water', 'Ice'],
      resistances: ['Fire', 'Physical'],
    },
    sortOrder: 12,
    spoilerLevel: 1,
  },
  {
    name: 'Nelumbo',
    areaSlug: 'ancient-hollow',
    description: 'An optional boss: an entity that manifests as a colossal lotus flower. Each petal is an independent weapon.',
    content: `## Overview

Nelumbo is not a person but an entity that grew in the deep waters of the Ancient Hollow over centuries. The Blight gave it awareness and aggression. It fights by animating its petal-platforms, creating an ever-shifting arena.

## Phase 1

Nelumbo attacks from multiple floating petal platforms that each glow before striking downward. The central flower is the target, but it is only vulnerable during brief openings.

**Key tells:**
- Petal strike: a specific petal glows brightly before swinging → move off that petal before the glow completes
- Vulnerability window: the central flower opens fully → attack the core immediately; the window is short

## Strategy Tips

- The petal platform positions change between attacks — re-read the arena layout after each wave
- Solarum's solar beams can hit the central flower from long range during the vulnerability window
- A long-range spirit is strongly recommended`,
    attributes: {
      hp: 4800,
      phases: 1,
      location: 'Ancient Hollow — Deep Spring Pool',
      rewards: ["Nelumbo's Spirit", 'Ancestral Protection (Relic)'],
      weaknesses: ['Fire', 'Lightning'],
      resistances: ['Water', 'Physical'],
    },
    sortOrder: 13,
    spoilerLevel: 1,
  },
  {
    name: 'Solarum, the Elder Witch',
    areaSlug: 'witchs-thicket',
    description: 'An optional boss: the oldest surviving witch, who calls down beams of concentrated Blight light. Her age and power make her the hardest optional boss.',
    content: `## Overview

Solarum predates the kingdom itself. She was ancient before the first stone of the White Parish was laid. The witches Eleine and Miriam were her students — the lineage of lake magic began with her. The Blight found her in deep mediation and interpreted her stillness as receptivity. The resulting fusion is as close to a god as the game contains.

## Phase 1

Solarum calls down solar beams that track Lily's position and persist for several seconds. She fires slow-moving orbs of concentrated light that explode on a delay. She also creates a barrier of sun orbs that orbits her position.

**Key tells:**
- Solar beam: a crosshair marks above Lily → the beam follows for 1.5 seconds before striking; run in one direction rather than repositioning repeatedly
- Delayed orbs: fired at angles, not at Lily directly → track the orb's arc and pre-position
- Barrier: she charges for 2 seconds → the orbiting barrier appears; find the gap between two orbs and stay in it

## Phase 2 (below 40% HP)

Solarum adds a full-arena solar pillar from above that fills 90% of the floor, leaving only the far edges safe.

## Strategy Tips

- The hardest optional boss by a significant margin; knowledge of all patterns is required
- A full relic loadout tuned for survivability is recommended over damage-dealing relics
- Her weak point is that the solar beam tracks *before* firing, not during — commit to a direction
- Defeating Solarum unlocks an optional lore cutscene revealing the pre-kingdom history`,
    attributes: {
      hp: 7200,
      phases: 2,
      location: "Witch's Thicket — Ancient Clearing",
      rewards: ["Solarum's Spirit", 'Ancient Lamp (Relic)'],
      weaknesses: ['Dark', 'Water'],
      resistances: ['Fire', 'Holy', 'Light'],
    },
    sortOrder: 14,
    spoilerLevel: 1,
  },
]

// ---------------------------------------------------------------------------
// Spirit data  (item_type = 'spirits')
// ---------------------------------------------------------------------------

const SPIRIT_DATA = [
  {
    name: "Julius's Spirit",
    description: 'The purified spirit of the Last Knight. Summons Julius to deliver powerful wide slashes that cleave through groups of enemies.',
    content: `## Moveset

Summons Julius to perform a **two-hit wide slash combo** with significant horizontal range. The first hit sweeps right to left; the second returns left to right. Both hits carry heavy knockback.

**Charge Input:** Hold the spirit button to add a third downward cleave with a ground shockwave.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Two-hit combo, base damage | — |
| 2 | Third hit added (charge or auto-extended) | 5 Shards |
| 3 | Each hit emits a Blight energy wave extending range | 12 Shards |

## Tips

- Effective against groups due to wide arc coverage
- The charge cleave + shockwave is one of the highest single-hit damage sources in the game
- Level 3 energy waves pass through enemy shields`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Julius, Last Knight in White Parish', effects: ['Wide slash combo', 'Heavy knockback'] },
    sortOrder: 1,
  },
  {
    name: "Gerrod's Spirit",
    description: 'The purified spirit of the Headless Knight. Summons Gerrod to charge forward with massive momentum, crashing through enemies.',
    content: `## Moveset

Summons Gerrod to **charge forward** in a straight horizontal line, passing through any enemies in the path. The charge can be steered slightly during its first half-second.

**Charge Input:** Longer hold before release increases the charge distance and damage.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Single charge, base damage | — |
| 2 | Second charge immediately follows the first | 5 Shards |
| 3 | Charge leaves a brief shockwave trail behind Gerrod | 12 Shards |

## Tips

- The level 2 double charge doubles damage output with the same input
- Useful for crossing gaps safely — charge timing can carry Lily across gaps while Gerrod charges ahead
- Poor against single fast-moving targets; excels against positioned groups`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Gerrod, the Headless Knight in Underground Cemetery', effects: ['Horizontal charge', 'Passes through enemies'] },
    sortOrder: 2,
  },
  {
    name: "Eleine's Spirit",
    description: 'The purified spirit of the Lake Witch. Summons Eleine to fire a burst of homing water bullets that seek the nearest enemy.',
    content: `## Moveset

Fires **three homing water bullets** that independently track the nearest enemy. Bullets persist until hitting an enemy or wall.

**Charge Input:** Fires six bullets instead of three, each with improved tracking.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 3 homing bullets | — |
| 2 | 5 homing bullets | 6 Shards |
| 3 | 7 homing bullets; bullets deal splash on impact | 14 Shards |

## Tips

- Excellent for airborne targets and fast-moving enemies
- Level 3 splash damage triggers on each bullet — very effective against groups
- Synergises with Scholar's Memoir relic which also boosts magic projectile spirits`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Eleine, Witch of the Lake in Witch\'s Thicket', effects: ['Homing projectiles', 'Water element'] },
    sortOrder: 3,
  },
  {
    name: "Faden's Spirit",
    description: 'The purified spirit of the Mutated Soldier. Summons Faden to throw a lance that pins enemies in place on hit.',
    content: `## Moveset

Throws a **single lance** in a straight line that pins any enemy hit to the ground for 1.5 seconds.

**Charge Input:** Throws two lances in a V spread, increasing area coverage.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 1 lance, 1.5s pin | — |
| 2 | Pin duration increased to 2.5 seconds | 6 Shards |
| 3 | Pinned enemies take 25% increased damage from all sources | 14 Shards |

## Tips

- Invaluable for crowd control against heavy enemies
- Level 3's damage amplification synergises with every other spirit
- Does not pin bosses, but applies a stagger that interrupts attack animations`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Faden, the Mutated Soldier in Verboten Domain', effects: ['Pin mechanic', 'Crowd control'] },
    sortOrder: 4,
  },
  {
    name: "Miriam's Spirit",
    description: 'The purified spirit of the Witch of Thorns. Fires a spread of thorn projectiles that deal multiple hits.',
    content: `## Moveset

Fires **five thorn projectiles** in a spread pattern (cone forward). Each thorn deals independent damage.

**Charge Input:** Fires nine thorns in a wider arc, covering a full half-circle forward.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 5 thorns, standard spread | — |
| 2 | 7 thorns; thorns now pierce one enemy | 7 Shards |
| 3 | 9 thorns; each thorn leaves a thorn patch on impact for 3 seconds | 15 Shards |

## Tips

- High damage against large or stationary targets where multiple thorns connect
- Level 3 thorn patches create persistent damage zones excellent for boss fights
- Witch's Talisman relic increases all thorn damage by 20%`,
    attributes: { rarity: 'rare' as const, howToObtain: "Defeat Miriam, Witch of Thorns in Witch's Thicket", effects: ['Multi-hit spread', 'Thorn patches (Lv3)'] },
    sortOrder: 5,
  },
  {
    name: "Hoenir's Spirit",
    description: 'The purified spirit of the Scholar. Fires a piercing magic beam that passes through all enemies in a straight line.',
    content: `## Moveset

Fires a **sustained magic beam** in a straight line for 0.8 seconds, hitting every enemy in its path multiple times.

**Charge Input:** Beam width doubles and duration extends to 1.5 seconds.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Standard beam width, 0.8s | — |
| 2 | Beam forks at walls, reflecting once | 7 Shards |
| 3 | Beam leaves a magic residue zone for 2 seconds that damages enemies passing through | 16 Shards |

## Tips

- Deals the highest raw damage against single large targets of any spirit
- Level 2 wall reflection is useful in enclosed arenas
- Scholar's Memoir relic significantly boosts beam damage — the pairing is a defining build`,
    attributes: { rarity: 'epic' as const, howToObtain: 'Defeat Hoenir, the Scholar in Eternal Cloister', effects: ['Piercing beam', 'High single-target damage'] },
    sortOrder: 6,
  },
  {
    name: "Dorothea's Spirit",
    description: 'The purified spirit of the Witch of the Drowned City. Creates expanding water rings from Lily\'s position.',
    content: `## Moveset

Creates **three expanding water rings** that travel outward from Lily in concentric circles, each ring dealing damage on contact.

**Charge Input:** Creates five rings with increased individual damage.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 3 rings, base damage | — |
| 2 | 5 rings; rings persist slightly longer | 8 Shards |
| 3 | 7 rings; outermost ring deals bonus damage on enemies hit more than twice | 16 Shards |

## Tips

- Excellent for melee range — enemies that are close get hit by all rings
- Level 3 bonus damage rewards consistent close-range usage against slow enemies
- Liquid Form relic has no effect on Dorothea's own spirit, but reduces chip damage from water-using enemies encountered alongside using this spirit`,
    attributes: { rarity: 'epic' as const, howToObtain: 'Defeat Dorothea, Witch of the Drowned City in Subterranean Hall', effects: ['Area rings', 'Melee-range burst'] },
    sortOrder: 7,
  },
  {
    name: "Ribald's Spirit",
    description: 'The purified spirit of the Crumbling Knight. Summons Ribald\'s shield for a powerful bash that launches enemies.',
    content: `## Moveset

Summons Ribald's **stone shield for a forward bash** with heavy knockback and brief stagger on hit.

**Charge Input:** The bash extends into a two-hit combo where the second hit creates a small rock-fall AoE.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Single bash, high knockback | — |
| 2 | Bash now reflects projectiles back at the source | 8 Shards |
| 3 | Blocked projectiles deal 150% of their original damage on reflection | 18 Shards |

## Tips

- Level 2+ reflection turns dangerous projectile patterns into offensive opportunities
- One of the few spirits that interacts defensively rather than offensively
- Works exceptionally well in areas with ranged enemies`,
    attributes: { rarity: 'epic' as const, howToObtain: 'Defeat Ribald, the Crumbling Knight in Cliffside Hamlet', effects: ['Shield bash', 'Projectile reflection (Lv2+)'] },
    sortOrder: 8,
  },
  {
    name: "Ulv's Spirit",
    description: 'The purified spirit of the Mad Knight. Summons Ulv to perform a lightning-fast sword flurry of four rapid hits.',
    content: `## Moveset

Summons Ulv for a **four-hit rapid sword flurry**, each hit dealing moderate damage in quick succession.

**Charge Input:** Extends the flurry to seven hits and adds a final heavy slam.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 4-hit flurry | — |
| 2 | Each hit applies a stacking damage debuff (3 stacks max) | 9 Shards |
| 3 | The charge flurry final slam stuns enemies for 1.5 seconds | 20 Shards |

## Tips

- Highest hit count of any melee spirit — ideal for enemies with many i-frames between phases
- Level 2 stacking debuff rewards sustained use of Ulv over fight duration
- Dead Knight's Ring relic boosts Ulv's damage substantially at all levels`,
    attributes: { rarity: 'epic' as const, howToObtain: "Defeat Ulv, the Mad Knight in Ancient Hollow", effects: ['Rapid multi-hit', 'Damage stacking (Lv2+)'] },
    sortOrder: 9,
  },
  {
    name: "Bastel's Spirit",
    description: 'The purified spirit of the Charmed One. Releases a homing swarm of butterflies that separately seek and orbit nearby enemies.',
    content: `## Moveset

Releases **five homing butterflies** that seek the nearest enemies and orbit them, dealing damage over time for 4 seconds.

**Charge Input:** Releases ten butterflies and increases per-butterfly duration to 6 seconds.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 5 butterflies, 4s duration | — |
| 2 | 7 butterflies; butterflies create a confusion effect on weak enemies | 8 Shards |
| 3 | 10 butterflies; confused enemies have a 20% chance to attack each other | 18 Shards |

## Tips

- The confusion effect at level 2+ is unique — no other spirit has crowd control of this type
- Best used on dense enemy groups where butterflies split across multiple targets
- Crow's Eye relic increases item drops from confused/friendly-fire kills`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Bastel, the Charmed One in Eternal Cloister', effects: ['Homing swarm', 'Confusion (Lv2+)'] },
    sortOrder: 10,
  },
  {
    name: "Warrior Lambach's Spirit",
    description: 'The purified spirit of the imprisoned warrior. Summons Lambach to perform a shield block followed by a devastating counter slash.',
    content: `## Moveset

Summons Lambach who **blocks the next hit** taken within 2 seconds, then immediately counter-slashes the attacker for high damage.

**Charge Input:** The counter slash becomes an AoE slam that hits all nearby enemies.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Block + counter slash | — |
| 2 | Block also reflects 50% of absorbed damage back as a projectile | 10 Shards |
| 3 | Counter slash applies a 30% defence reduction to the target for 5 seconds | 20 Shards |

## Tips

- The only spirit with a true block mechanic — invaluable on high-damage boss hits
- Level 3 defence reduction synergises with all other spirits fired immediately after
- Requires precise timing but the defensive utility is unmatched`,
    attributes: { rarity: 'epic' as const, howToObtain: 'Defeat Warrior Lambach in Stockade', effects: ['Hit block', 'Counter-attack', 'Defence reduction (Lv3)'] },
    sortOrder: 11,
  },
  {
    name: "Clad's Spirit",
    description: 'The purified spirit of the Flame Knight. Summons Clad to dash forward leaving a long fire trail that burns enemies.',
    content: `## Moveset

Summons Clad who **dashes forward** leaving a fire trail that persists for 3 seconds, burning any enemy that passes through it.

**Charge Input:** The dash covers the full arena width and the trail lasts 5 seconds.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Forward dash, 3s fire trail | — |
| 2 | Trail damage per second increased; Clad leaves two parallel trails | 9 Shards |
| 3 | Trail ignites enemies, causing them to deal fire damage to nearby enemies for 3 seconds | 18 Shards |

## Tips

- The persistent trail damages enemies even while Lily is focused on dodging
- Level 3 ignite creates a chain-damage effect in groups
- Clad's Remains relic grants fire immunity — useful if the player wants to walk through their own trails`,
    attributes: { rarity: 'rare' as const, howToObtain: 'Defeat Clad, the Flame Knight in Subterranean Hall', effects: ['Fire trail', 'Persistent damage'] },
    sortOrder: 12,
  },
  {
    name: "Nelumbo's Spirit",
    description: 'The purified spirit of the Ancient Lotus. Blooms petal waves in all eight directions simultaneously.',
    content: `## Moveset

Blooms **eight petal projectiles** simultaneously in cardinal and diagonal directions, each petal dealing damage on contact.

**Charge Input:** Adds a second bloom 0.5 seconds after the first, doubling the hit pattern.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | 8-directional petal bloom | — |
| 2 | Petals slow enemies they hit for 2 seconds | 9 Shards |
| 3 | Double bloom (charge is now automatic at Lv3) | 20 Shards |

## Tips

- Excellent at 360-degree coverage — no blind spot
- Level 2 slow pairs well with other high-damage spirits applied immediately after
- Level 3 automatic double bloom at base cast is extremely powerful for the cost`,
    attributes: { rarity: 'epic' as const, howToObtain: 'Defeat Nelumbo in Ancient Hollow', effects: ['360-degree attack', 'Slow (Lv2+)'] },
    sortOrder: 13,
  },
  {
    name: "Solarum's Spirit",
    description: 'The purified spirit of the Elder Witch. Calls down a solar beam from above that tracks enemy position for 1 second before striking.',
    content: `## Moveset

Marks a target location with a tracking crosshair that follows the nearest enemy for 1 second, then **drops a solar beam** dealing massive damage at the marked point.

**Charge Input:** Calls down three beams targeting the three nearest enemies simultaneously.

## Upgrades

| Level | Effect | Upgrade Cost |
|-------|--------|--------------|
| 1 | Single tracking beam | — |
| 2 | Beam leaves a burning zone for 3 seconds on impact | 12 Shards |
| 3 | Charge fires three beams; all beams are homing and require no tracking window | 24 Shards |

## Tips

- Highest single-hit damage in the game at Lv3 charge with three simultaneous beams
- The 1-second tracking window in Lv1-2 can miss fast enemies; lead the target
- Scholar's Memoir relic stacks with Solarum's Spirit for truly exceptional damage`,
    attributes: { rarity: 'legendary' as const, howToObtain: "Defeat Solarum, the Elder Witch in Witch's Thicket", effects: ['Tracking solar beam', 'Highest damage potential'] },
    sortOrder: 14,
  },
]

// ---------------------------------------------------------------------------
// Relic data  (item_type = 'relics')
// ---------------------------------------------------------------------------

const RELIC_DATA = [
  {
    name: 'Worn Charm',
    description: 'A faded amulet found near Lily\'s resting place in the White Parish. Provides minor protection against all damage.',
    attributes: { rarity: 'common' as const, howToObtain: 'Found in White Parish — Cathedral Nave (starting area)', effects: ['Reduces all damage taken by 3%'] },
    sortOrder: 1,
  },
  {
    name: "Knight's Talisman",
    description: 'A talisman recovered from a fallen White Knight. Attunes the bearer to resist physical blows.',
    attributes: { rarity: 'uncommon' as const, howToObtain: "Dropped by Rusted Knight enemies in White Parish", effects: ['Reduces physical damage taken by 12%'] },
    sortOrder: 2,
  },
  {
    name: 'Magical Talisman',
    description: 'A witch-crafted ward that deflects magical energy. Originally distributed to civilians during the Blight outbreak.',
    attributes: { rarity: 'uncommon' as const, howToObtain: "Found in Witch's Thicket — Hanging Garden chest", effects: ['Reduces magical damage taken by 12%'] },
    sortOrder: 3,
  },
  {
    name: 'Ancient Pendant',
    description: 'A pendant inscribed with the runes of the old kingdom. The inscription reads: "May the bearer endure."',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Reward for defeating Julius, Last Knight', effects: ['Increases maximum HP by 15%'] },
    sortOrder: 4,
  },
  {
    name: "Dead Knight's Ring",
    description: 'A ring etched with battle runes on its inner face. Worn knights once called it a reminder of their oath to fight always.',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Found in Underground Cemetery — Royal Mausoleum puzzle chest', effects: ['Increases all spirit damage by 10%'] },
    sortOrder: 5,
  },
  {
    name: "Witch's Talisman",
    description: 'A charm braided from Thicket materials and witch hair. Resonates with witch-origin spirits.',
    attributes: { rarity: 'uncommon' as const, howToObtain: "Reward for defeating Miriam, Witch of Thorns", effects: ['Increases damage of witch-origin spirits (Eleine, Miriam, Dorothea, Solarum, Nelumbo, Bastel) by 20%'] },
    sortOrder: 6,
  },
  {
    name: "Scholar's Memoir",
    description: 'Torn pages from a scholar\'s personal research diary. The handwriting becomes increasingly frantic toward the final entry.',
    attributes: { rarity: 'rare' as const, howToObtain: 'Reward for defeating Hoenir, the Scholar', effects: ['Increases magic beam potency (Hoenir Spirit) by 35%', 'Increases all magic projectile damage by 8%'] },
    sortOrder: 7,
  },
  {
    name: 'Fleeting Form',
    description: 'A relic imbued with wind magic by an unknown practitioner. The bearer moves as though lighter than air.',
    attributes: { rarity: 'uncommon' as const, howToObtain: "Found in Witch's Thicket — Hidden Spring secret room", effects: ['Reduces dash recovery time by 25%'] },
    sortOrder: 8,
  },
  {
    name: 'Iron Presence',
    description: 'A heavy iron token stamped with the crest of the Forbidden Guard. Its weight grounds the bearer against even massive impacts.',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Reward for defeating Faden, the Mutated Soldier', effects: ['Reduces knockback on hit by 60%'] },
    sortOrder: 9,
  },
  {
    name: 'Battle Cry',
    description: 'A warrior\'s totem carved from bone. The instinct it carries is older than the kingdom.',
    attributes: { rarity: 'rare' as const, howToObtain: "Reward for defeating Ulv, the Mad Knight", effects: ['Increases attack power by 20% for 8 seconds after taking damage'] },
    sortOrder: 10,
  },
  {
    name: 'Prayer Beads',
    description: 'A string of prayer beads worn smooth with years of use. Each bead carries a fragment of sincere prayer.',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Reward for defeating Dorothea, Witch of the Drowned City', effects: ['Slowly regenerates HP over time (1% per 10 seconds)'] },
    sortOrder: 11,
  },
  {
    name: 'Stone Ring',
    description: 'A ring carved from the same ancient stone found in the deepest cemetery chambers. Practically indestructible.',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Reward for defeating Gerrod, the Headless Knight', effects: ['Increases physical defence by 18%'] },
    sortOrder: 12,
  },
  {
    name: "Knight's Code",
    description: 'A fragment of the White Order\'s Honor Code, bound in cracked leather. The relevant passage reads: "A knight kneels only to death — never before."',
    attributes: { rarity: 'rare' as const, howToObtain: 'Reward for defeating Ribald, the Crumbling Knight', effects: ['Increases all damage dealt by 40% when HP is below 30%'] },
    sortOrder: 13,
  },
  {
    name: 'Rusted Ring',
    description: 'A weathered ring of unknown origin, its gemstone long since fallen out. The setting still holds something invisible.',
    attributes: { rarity: 'common' as const, howToObtain: 'Found in Underground Cemetery — Ossuary hidden passage', effects: ['Increases the effectiveness of all spirit upgrades by 10%'] },
    sortOrder: 14,
  },
  {
    name: "Clad's Remains",
    description: 'Ash wrapped in scorched cloth — all that can be gathered of what Clad once was. The ash never cools.',
    attributes: { rarity: 'rare' as const, howToObtain: 'Reward for defeating Clad, the Flame Knight', effects: ['Grants complete immunity to fire damage'] },
    sortOrder: 15,
  },
  {
    name: "Crow's Eye",
    description: 'A preserved crow\'s eye taken from the Thicket. Crows saw the Blight coming before any human did.',
    attributes: { rarity: 'common' as const, howToObtain: "Found in Witch's Thicket — Bell in Hidden Canopy area", effects: ['Increases item drop rate from all enemies by 25%'] },
    sortOrder: 16,
  },
  {
    name: 'Ancestral Protection',
    description: 'A shield-shaped amulet passed through seventeen generations of a family none can now name. The protection is in the love that preserved it.',
    attributes: { rarity: 'epic' as const, howToObtain: 'Reward for defeating Nelumbo in Ancient Hollow', effects: ['Grants 0.5 seconds of invincibility when hit (15-second cooldown)'] },
    sortOrder: 17,
  },
  {
    name: 'Liquid Form',
    description: 'A sealed vial of stagnant water from the deepest flooded chamber. The water does not evaporate, no matter how long the vial remains open.',
    attributes: { rarity: 'uncommon' as const, howToObtain: 'Reward for defeating Eleine, Witch of the Lake', effects: ['Reduces water and cold damage taken by 35%'] },
    sortOrder: 18,
  },
  {
    name: "Warrior's Crest",
    description: 'A crest bearing the Stockade warden\'s emblem. The warden\'s philosophy was: the prisoner who breaks last, breaks the jailer.',
    attributes: { rarity: 'rare' as const, howToObtain: 'Reward for defeating Warrior Lambach', effects: ['Increases attack speed of heavy knight spirits (Julius, Gerrod, Ribald, Ulv, Lambach) by 15%'] },
    sortOrder: 19,
  },
  {
    name: 'Ancient Lamp',
    description: 'A lamp that never goes out, burning with light that predates the Blight and seems to push it back. Its origin is unknown.',
    attributes: { rarity: 'epic' as const, howToObtain: "Reward for defeating Solarum, the Elder Witch", effects: ['Reveals hidden passages and breakable walls', 'Reduces damage from Blight-type attacks by 10%'] },
    sortOrder: 20,
  },
]

// ---------------------------------------------------------------------------
// NPC data
// ---------------------------------------------------------------------------

const NPC_DATA = [
  {
    name: 'August, the White Priest',
    areaSlug: 'white-parish',
    description: 'A gentle spirit in white robes who awakens alongside Lily and becomes her guide and companion. He speaks with calm certainty and deep sorrow.',
    content: `## Role

August is Lily's primary companion throughout the journey. He appears as a spirit — translucent and unable to affect the physical world directly — but his presence provides Lily with counsel, warnings, and emotional support. He prays silently over the corrupted beings Lily defeats and purifies.

## Background

August served as a high priest of the White Parish during the kingdom's final years. He was not a warrior but a shepherd — his duty was the spiritual welfare of the people. When the Blight Rain began, he organised evacuation efforts and remained behind to ensure the last survivors escaped. He perished at the altar where Lily later awakens.

## Dialogue Notes

- At the start of each major area: provides brief lore context and a word of caution
- After defeating a boss: offers a short prayer for the fallen and reflects on their life before the Blight
- At save shrines: comments on Lily's condition and sometimes shares memories of the kingdom
- His tone shifts subtly darker as the true nature of the Blight becomes clear

## Lore

August has a secret he does not immediately reveal. His connection to Lily goes deeper than a chance encounter — the nature of this connection is the emotional core of the game's final act.`,
    attributes: { role: 'Guide / Companion Spirit', questRelated: true, services: ['Area lore', 'Boss lore', 'Narrative'], dialogueHints: ['Knows more than he initially reveals', 'His prayers name each boss by their pre-Blight self'] },
    sortOrder: 1,
    spoilerLevel: 0,
  },
  {
    name: 'Argar, the Blacksmith',
    areaSlug: 'subterranean-hall',
    description: 'A broad, gruff spirit of a master blacksmith who lingers near his old underground workshop. He can enhance the spirits Lily carries.',
    content: `## Role

Argar is the upgrade NPC. By spending spirit shards (dropped by enemies), Lily can pay Argar to enhance her spirits to higher levels, unlocking additional moves and damage.

## Background

Argar was one of the most respected craftsmen in the kingdom. He forged or repaired weapons for three generations of White Knights. When the Blight came, he refused to leave his workshop — he believed the problem was a lack of proper weapons and that he could fix it. He worked until the Blight took him, still at his forge.

His spirit remains there because he never finished his last commission: a sword for a young knight who never came to collect it. He speaks of this obliquely and with quiet grief.

## Services

| Service | Cost |
|---------|------|
| Spirit Upgrade Lv1 → Lv2 | 5 Shards |
| Spirit Upgrade Lv2 → Lv3 | 12–24 Shards (varies by spirit) |

## Dialogue Notes

- Gruff and businesslike on first meeting; warms slowly across multiple visits
- Occasionally asks about the spirit Lily just upgraded — curious about them as people, not just weapons
- Has a running joke about Lily's small hands being unsuitable for proper swordwork`,
    attributes: { role: 'Blacksmith / Upgrade NPC', questRelated: false, services: ['Spirit upgrades'], dialogueHints: ['Mentions an unfinished commission', 'Respects strength and craft above all'] },
    sortOrder: 2,
    spoilerLevel: 0,
  },
  {
    name: 'Edgar, the Fallen Watchman',
    areaSlug: 'verboten-domain',
    description: 'An aged former guard of the Forbidden Domain who abandoned his post and still wanders the halls, unable to leave or find peace.',
    content: `## Role

Edgar is an optional lore NPC encountered in the Verboten Domain. He does not sell items or upgrade anything — he only talks. Each conversation reveals additional context about the Forbidden Domain's history and the events leading to the Blight's arrival inside the castle walls.

## Background

Edgar was a senior officer of the Forbidden Guard who served forty years protecting the inner castle precincts. Near the end, he was given orders he knew were wrong — orders that contributed directly to the spread of the Blight within the Domain. He obeyed. He has not forgiven himself.

## Dialogue Notes

- Can be found in three locations across the Verboten Domain on subsequent visits
- His dialogue provides the backstory of the royal court's response to the Blight
- Final dialogue (post-Faden defeat): reveals the name of the knight who gave him the wrong orders, connecting to a broader lore thread

## Lore Significance

Edgar's testimony fills critical gaps in the political history of End's fall. Players who speak with him at all three locations receive the full account of how the Verboten Domain fell from within.`,
    attributes: { role: 'Lore NPC', questRelated: false, services: ['Area lore', 'Kingdom history'], dialogueHints: ['Has three conversation stages across three locations', 'Carries guilt for following immoral orders'] },
    sortOrder: 3,
    spoilerLevel: 0,
  },
  {
    name: 'Yuki, Witch Apprentice',
    areaSlug: 'witchs-thicket',
    description: 'A young witch who retained her senses when her mentor fell to the Blight. She survived alone in the Thicket through cleverness and small protective magic.',
    content: `## Role

Yuki is encountered twice in the Witch's Thicket — once before the Eleine fight and once after Miriam's defeat. She is initially wary of Lily but comes to trust her. She provides context for both witches' histories and is the only surviving person who knew them personally.

## Background

Yuki was the youngest of Eleine's apprentices. She was sent on an errand to gather herbs at the outer Thicket when the Blight overcame her mentor. By the time she returned, Eleine was already gone. Yuki is not strong enough to fight — she hid, learned small barrier spells to ward off the Blighted creatures, and waited for someone to come.

## Dialogue Notes

- First encounter: cautious, tests Lily by asking about the outside world
- Post-Eleine: grief-stricken but grateful; shares Eleine's history and her relationship with Ames
- Post-Miriam: asks Lily whether Miriam seemed afraid at the end; does not want an honest answer

## Lore Significance

Yuki's account of the witches is the most personal lore in the game — she loved her teachers and mourns them, unlike the inscriptions and notes that describe them objectively.`,
    attributes: { role: 'Lore NPC / Survivor', questRelated: false, services: ['Witch lore', 'Thicket history'], dialogueHints: ['Two conversation stages — before Eleine, after Miriam', 'Her final question has no good answer'] },
    sortOrder: 4,
    spoilerLevel: 0,
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1 — Game ----------------------------------------------------------------
  console.warn('[seed] Ensuring game exists…')
  await db.insert(schema.games).values({
    name: 'Ender Lilies: Quietus of the Knights',
    slug: 'ender-lilies',
    description:
      'A dark fantasy action-RPG set in the rain-soaked kingdom of End. ' +
      'Play as Lily, a young girl awakened amid ruins, and uncover the tragedy ' +
      'that befell the land by purifying fallen knights and wielding their spirits in battle.',
    developer: 'Binary Haze Interactive',
    releaseYear: 2021,
    gameConfig: {
      bosses: true,
      npcs: true,
      areas: true,
      relics: true,
      spirits: true,
      tierlist: true,
    },
    isPublished: true,
  }).onConflictDoUpdate({
    target: schema.games.slug,
    set: {
      isPublished: true,
      gameConfig: {
        bosses: true,
        npcs: true,
        areas: true,
        relics: true,
        spirits: true,
        tierlist: true,
      },
    },
  })

  const game = await db.query.games.findFirst({
    where: eq(schema.games.slug, 'ender-lilies'),
  })
  if (!game) throw new Error('Game not found after insert')
  const gameId = game.id
  console.warn(`[seed] Game ID: ${gameId}`)

  // 2 — Item types ----------------------------------------------------------
  console.warn('[seed] Inserting item types…')
  await db.insert(schema.itemTypes).values([
    { gameId, name: 'Spirits', slug: 'spirits', sortOrder: 1 },
    { gameId, name: 'Relics', slug: 'relics', sortOrder: 2 },
  ]).onConflictDoNothing()

  const itemTypeRows = await db.query.itemTypes.findMany({
    where: eq(schema.itemTypes.gameId, gameId),
  })
  const spiritTypeId = itemTypeRows.find(t => t.slug === 'spirits')?.id
  const relicTypeId = itemTypeRows.find(t => t.slug === 'relics')?.id
  if (!spiritTypeId || !relicTypeId) throw new Error('Item types not found after insert')

  // 3 — Areas ---------------------------------------------------------------
  console.warn('[seed] Inserting areas…')
  await db.insert(schema.areas).values(
    AREA_DATA.map(a => ({
      gameId,
      name: a.name,
      slug: slugify(a.name),
      description: a.description,
      content: a.content,
      mapX: a.mapX,
      mapY: a.mapY,
      sortOrder: a.sortOrder,
      spoilerLevel: a.spoilerLevel,
      isPublished: true,
    }))
  ).onConflictDoUpdate({
    target: [schema.areas.gameId, schema.areas.slug],
    set: {
      mapX: sql`excluded.map_x`,
      mapY: sql`excluded.map_y`,
    },
  })

  const areaRows = await db.query.areas.findMany({
    where: eq(schema.areas.gameId, gameId),
  })
  const areaMap = Object.fromEntries(areaRows.map(a => [a.slug, a.id]))

  // 4 — Bosses --------------------------------------------------------------
  console.warn('[seed] Inserting bosses…')
  await db.insert(schema.bosses).values(
    BOSS_DATA.map(b => ({
      gameId,
      areaId: areaMap[b.areaSlug] ?? null,
      name: b.name,
      slug: slugify(b.name),
      description: b.description,
      content: b.content,
      sortOrder: b.sortOrder,
      spoilerLevel: b.spoilerLevel,
      attributes: b.attributes,
      isPublished: true,
    }))
  ).onConflictDoNothing()

  // 5 — Spirits (items) -----------------------------------------------------
  console.warn('[seed] Inserting spirits…')
  await db.insert(schema.items).values(
    SPIRIT_DATA.map(s => ({
      gameId,
      itemTypeId: spiritTypeId,
      name: s.name,
      slug: slugify(s.name),
      description: s.description,
      content: s.content,
      spoilerLevel: 0,
      attributes: s.attributes,
      isPublished: true,
    }))
  ).onConflictDoNothing()

  // 6 — Relics (items) ------------------------------------------------------
  console.warn('[seed] Inserting relics…')
  await db.insert(schema.items).values(
    RELIC_DATA.map(r => ({
      gameId,
      itemTypeId: relicTypeId,
      name: r.name,
      slug: slugify(r.name),
      description: r.description,
      content: null,
      spoilerLevel: 0,
      attributes: r.attributes,
      isPublished: true,
    }))
  ).onConflictDoNothing()

  // 7 — NPCs ----------------------------------------------------------------
  console.warn('[seed] Inserting NPCs…')
  await db.insert(schema.npcs).values(
    NPC_DATA.map(n => ({
      gameId,
      areaId: areaMap[n.areaSlug] ?? null,
      name: n.name,
      slug: slugify(n.name),
      description: n.description,
      content: n.content,
      spoilerLevel: n.spoilerLevel,
      isPublished: true,
      attributes: n.attributes,
    }))
  ).onConflictDoNothing()

  console.warn('[seed] ✓ All Ender Lilies content seeded successfully.')
  await client.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
