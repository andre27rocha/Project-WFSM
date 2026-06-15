import type { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { faqPageSchema, safeJsonLd } from '@/lib/seo/jsonld'

export function generateMetadata(): Metadata {
  return {
    title: 'Beginner Guide — What is a Metroidvania?',
    description:
      'New to metroidvanias? Learn what defines the genre, discover the core mechanics, find the best games to start with, and look up common terms in the genre glossary.',
    alternates: { canonical: `${siteConfig.url}/beginner-guide` },
    openGraph: {
      title: 'Beginner Guide — What is a Metroidvania? | VaniaCodex',
      description:
        'Your starting point for metroidvanias and soulsvaniass — genre history, core mechanics, recommended first games, and a glossary.',
    },
    twitter: { card: 'summary_large_image' },
  }
}

// ─── Content data ────────────────────────────────────────────────────────────

type StarterGame = {
  name: string
  developer: string
  year: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  wikiSlug?: string
}

const STARTER_GAMES: StarterGame[] = [
  {
    name: 'Hollow Knight',
    developer: 'Team Cherry',
    year: 2017,
    difficulty: 'Medium',
    description:
      'The modern gold standard. Tight platforming, deep lore, an enormous interconnected world, and a hauntingly beautiful aesthetic. If you only play one metroidvania, let it be this.',
  },
  {
    name: 'Ender Lilies: Quietus of the Knights',
    developer: 'Binary Haze Interactive',
    year: 2021,
    difficulty: 'Medium',
    description:
      'Atmospheric, melancholic, and mechanically rich. Lily wields the spirits of defeated knights to fight through a rain-cursed kingdom. Great combat variety and one of the best soundtracks in the genre.',
    wikiSlug: 'ender-lilies',
  },
  {
    name: 'Ori and the Blind Forest',
    developer: 'Moon Studios',
    year: 2015,
    difficulty: 'Easy',
    description:
      'The most accessible entry point — forgiving, visually stunning, and emotionally resonant. A perfect first metroidvania if you want to ease into the genre without stress.',
  },
  {
    name: 'Castlevania: Symphony of the Night',
    developer: 'Konami',
    year: 1997,
    difficulty: 'Easy',
    description:
      'The game that named the genre. Alucard explores Dracula\'s castle in an RPG-inflected adventure that still holds up. A piece of gaming history and essential context for understanding what came after.',
  },
  {
    name: 'Dead Cells',
    developer: 'Motion Twin',
    year: 2018,
    difficulty: 'Hard',
    description:
      'A roguelite-metroidvania hybrid with incredibly fluid combat. Each run is short but the unlockable progression persists. If you enjoy high-speed action over exploration, start here.',
  },
]

type GlossaryEntry = { term: string; definition: string }

const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Metroidvania',
    definition:
      'A portmanteau of Metroid and Castlevania — the two series that defined the genre. Refers to action-adventure games with interconnected maps, ability-gated exploration, and strong backtracking loops.',
  },
  {
    term: 'Soulsvania',
    definition:
      'A metroidvania that incorporates heavy Souls-like elements: stamina-based combat, punishing difficulty, enemy respawns on rest, and death mechanics that carry narrative weight.',
  },
  {
    term: 'Ability Gating',
    definition:
      'A design technique where areas are physically inaccessible until you acquire a specific ability (double jump, dash, wall climb). It\'s the mechanism that makes backtracking feel like discovery rather than tedium.',
  },
  {
    term: 'Backtracking',
    definition:
      'Returning to previously visited areas after gaining new abilities to access paths that were blocked before. In good metroidvanias, backtracking creates "aha!" moments rather than frustration.',
  },
  {
    term: 'Sequence Breaking',
    definition:
      'Bypassing the intended progression order using glitches, precise movement, or unintended routes. Common in speedruns and beloved by the community.',
  },
  {
    term: 'Power Fantasy',
    definition:
      'The arc most metroidvanias follow: you start weak and fragile, and end the game feeling nearly invincible. The contrast between your early and late power is a core emotional hook.',
  },
  {
    term: 'Fog Gate / Fog Wall',
    definition:
      'A visual or mechanical barrier that blocks progress until a condition is met — usually defeating a nearby boss or obtaining an item.',
  },
  {
    term: 'Non-linear Progression',
    definition:
      'A structure where multiple paths are open at once and there is no single prescribed order. The player chooses where to go, and the map design creates implicit guidance through difficulty.',
  },
  {
    term: 'Metroid-style (vs Castlevania-style)',
    definition:
      'Metroid-style games emphasise exploration of an alien/atmospheric world with minimal story. Castlevania-style games add RPG elements (levels, gear, stats) and heavier narrative. Most modern metroidvanias blend both.',
  },
  {
    term: 'Roguelite Elements',
    definition:
      'Procedurally generated or randomised runs combined with persistent unlocks that carry over between deaths. Some metroidvanias (Dead Cells, Rogue Legacy) incorporate this to add replayability.',
  },
]

type FaqItem = { question: string; answer: string }

const FAQ: FaqItem[] = [
  {
    question: 'Do I need to play Metroid or Castlevania to enjoy modern metroidvanias?',
    answer:
      'No. Hollow Knight, Ender Lilies, Ori, and virtually every modern entry in the genre are completely standalone. The genre name is historical — you need no prior knowledge to enjoy it.',
  },
  {
    question: 'Are metroidvanias hard?',
    answer:
      'It varies significantly. Ori and the Blind Forest is forgiving and designed for newcomers. Hollow Knight is moderately challenging with demanding bosses. Soulsvaniass like Blasphemous or Salt and Sanctuary are genuinely punishing. Start with a Medium-difficulty pick if you\'re unsure.',
  },
  {
    question: 'What is the difference between a metroidvania and a soulsvania?',
    answer:
      'Both share the interconnected map and ability-gated exploration of a metroidvania. Soulsvaniass additionally feature Souls-like mechanics: stamina management, enemy respawns when you rest at a checkpoint, and a death system where you lose resources and must retrieve them. The combat tends to be slower and more deliberate.',
  },
  {
    question: 'Should I use a controller?',
    answer:
      'Yes, strongly recommended. Metroidvanias involve precise platforming and rapid directional input. A gamepad (any modern controller works) makes this feel natural. Keyboard and mouse are possible but less comfortable for most players.',
  },
  {
    question: 'How long are metroidvanias?',
    answer:
      'Shorter than most open-world games: typically 10–20 hours for a first playthrough. Hollow Knight is longer at 25–40 hours depending on completion. Symphony of the Night can be finished in 6–8 hours. The tight scope is part of the appeal — you can fully explore a world without a 100-hour commitment.',
  },
  {
    question: 'I keep getting lost. Is that normal?',
    answer:
      'Yes, and it is intentional. Getting lost, finding a dead end, and later realising why you were blocked is a designed experience. Trust the map, mark areas you cannot access yet, and keep pushing forward. The sense of orientation that develops over a playthrough is deeply satisfying.',
  },
]

// ─── Section components ───────────────────────────────────────────────────────

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 border-b border-primary/30 pb-2 text-lg font-bold text-foreground first:mt-0"
    >
      {children}
    </h2>
  )
}

const DIFFICULTY_COLOUR: Record<StarterGame['difficulty'], string> = {
  Easy: 'text-green-400 border-green-400/40',
  Medium: 'text-yellow-400 border-yellow-400/40',
  Hard: 'text-red-400 border-red-400/40',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BeginnerGuidePage() {
  const jsonLd = faqPageSchema(`${siteConfig.url}/beginner-guide`, FAQ)

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <WikiBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Beginner Guide' }]} />

      <h1 className="mb-2 text-2xl font-bold text-foreground">Beginner Guide</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        New to metroidvanias? This guide covers what the genre is, the mechanics you will encounter
        in every game, where to start, and a glossary of terms you will see in reviews and
        discussions.
      </p>

      {/* ── What is a metroidvania ─────────────────────────────────────────── */}
      <section aria-labelledby="what-is">
        <SectionHeading id="what-is">What is a Metroidvania?</SectionHeading>
        <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
          <p>
            A <strong className="text-foreground">metroidvania</strong> is a genre of action-adventure
            game defined by two design pillars: an interconnected, non-linear map, and ability-gated
            progression. You explore a large world, encounter blocked paths, acquire new skills or
            items, and return to unlock what was previously inaccessible.
          </p>
          <p>
            The name is a portmanteau of{' '}
            <strong className="text-foreground">Metroid</strong> (Nintendo, 1986) and{' '}
            <strong className="text-foreground">Castlevania: Symphony of the Night</strong> (Konami,
            1997) — the two games most responsible for defining the formula. Metroid contributed the
            emphasis on spatial exploration and environmental storytelling. Symphony of the Night
            added RPG layers: experience points, equipment, and a stat system.
          </p>
          <p>
            Modern metroidvanias range from atmospheric indie titles (Hollow Knight, Ender Lilies)
            to challenging soulsvanias (Blasphemous, Salt and Sanctuary). What unites them is the
            satisfying loop of exploration, discovery, and the gradual accumulation of power that
            makes the world feel smaller as you grow stronger.
          </p>
        </div>
      </section>

      {/* ── Core mechanics ────────────────────────────────────────────────── */}
      <section aria-labelledby="mechanics">
        <SectionHeading id="mechanics">Core Mechanics</SectionHeading>
        <p className="mb-4 text-sm text-muted-foreground">
          Every metroidvania is built on a shared set of design conventions. Knowing them in advance
          removes the frustration of encountering them cold.
        </p>
        <ul className="space-y-4">
          {[
            {
              title: 'Ability gating',
              body: 'Paths are physically blocked until you acquire the right ability — a double jump, a dash, a specific weapon. This is how the genre controls pacing without invisible walls. When you hit a dead end, the question is always "what ability will open this?" not "is this a bug?"',
            },
            {
              title: 'Backtracking',
              body: 'Returning to old areas is not a chore — it is the reward. Every time you unlock a new ability, a portion of the map becomes newly accessible. Veteran players mark areas they could not reach and revisit them deliberately.',
            },
            {
              title: 'Non-linear progression',
              body: 'There is rarely a single prescribed path. Multiple routes are open at once, and the intended order is implied by difficulty rather than hard gates. You may discover later areas early if you are skilled enough.',
            },
            {
              title: 'Checkpoints and respawning',
              body: 'Metroidvanias use checkpoints (benches, save rooms, fires) rather than autosaves. Dying sends you back to the last checkpoint. In soulsvaniass, enemies respawn when you rest — a trade-off between safety and challenge.',
            },
            {
              title: 'The power fantasy arc',
              body: 'You begin fragile and end the game powerful. The contrast between how the opening areas felt when you first crossed them versus revisiting them with all your abilities is a deliberate, satisfying design choice.',
            },
          ].map(({ title, body }) => (
            <li key={title} className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3">
              <p className="mb-1 text-sm font-semibold text-primary">{title}</p>
              <p className="text-sm text-foreground/80">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Where to start ────────────────────────────────────────────────── */}
      <section aria-labelledby="starters">
        <SectionHeading id="starters">Where to Start</SectionHeading>
        <p className="mb-4 text-sm text-muted-foreground">
          Five curated picks for players new to the genre, in no particular order. Difficulty
          ratings reflect the genre — not games in general.
        </p>
        <ul className="space-y-4">
          {STARTER_GAMES.map((game) => (
            <li
              key={game.name}
              className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3"
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-2">
                {game.wikiSlug ? (
                  <Link
                    href={`/${game.wikiSlug}`}
                    className="text-sm font-semibold text-primary hover:underline hover:underline-offset-2"
                  >
                    {game.name}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-foreground">{game.name}</span>
                )}
                <span className="text-xs text-muted-foreground/60">
                  {game.developer} · {game.year}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLOUR[game.difficulty]}`}
                >
                  {game.difficulty}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{game.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Glossary ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="glossary">
        <SectionHeading id="glossary">Genre Glossary</SectionHeading>
        <p className="mb-4 text-sm text-muted-foreground">
          Terms you will encounter in reviews, discussions, and wikis.
        </p>
        <dl className="space-y-3">
          {GLOSSARY.map(({ term, definition }) => (
            <div key={term} className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3">
              <dt className="mb-0.5 text-sm font-semibold text-primary">{term}</dt>
              <dd className="text-sm text-foreground/80">{definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq">
        <SectionHeading id="faq">FAQ</SectionHeading>
        <dl className="space-y-4">
          {FAQ.map(({ question, answer }) => (
            <div key={question} className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3">
              <dt className="mb-1 text-sm font-semibold text-foreground">{question}</dt>
              <dd className="text-sm text-foreground/80">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <div className="mt-12 rounded border border-primary/30 bg-primary/5 px-6 py-5 text-center">
        <p className="mb-3 text-sm font-semibold text-foreground">Ready to dive in?</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Browse our in-depth wiki for Ender Lilies — bosses, spirits, relics, areas, and more.
        </p>
        <Link
          href="/ender-lilies"
          className="inline-block rounded border border-primary px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-background"
        >
          Explore the Ender Lilies Wiki
        </Link>
      </div>
    </div>
  )
}
