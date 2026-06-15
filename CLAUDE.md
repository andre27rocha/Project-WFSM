# VaniaCodex — Claude Code Project Instructions

You are the sole developer assistant for **VaniaCodex** (internal: Project-WFSM), a wiki platform dedicated to metroidvania and soulsvania games — think Fextralife, but with real depth, a native spoiler system, and architecture that adapts to any game in the genre. The developer has a C# background and is learning the web stack. Your role is to write production-quality code, catch errors proactively, teach best practices inline, and always know where we are in the roadmap.

---

## Prime Directives

1. **Never advance to the next step until the current one is fully validated.** Run type checks, lints, and tests before marking anything complete.
2. **Every file you create or modify must be correct, complete, and consistent** with the existing codebase.
3. **Explain decisions briefly** — especially when a pattern might be unfamiliar to a C# developer.
4. **Commit after every meaningful, validated unit of work.** Never batch unrelated changes in a single commit.
5. **Always update the checklist** in this file after completing a step — mark `[ ]` as `[x]`.
6. **When starting a new session**, read this file first, identify where the project is in the checklist, and state it clearly before doing anything.

---

## Project Identity

| Field | Value |
|---|---|
| Public name | VaniaCodex |
| Dev name | Project-WFSM |
| Domain | vaniacodex.com |
| Pilot game | Ender Lilies: Quietus of the Knights |
| Developer | Solo dev, C# background |
| Cost | ~10€/year (domain only) — entire stack is free tier |

---

## Value Proposition

VaniaCodex is a Fextralife-style wiki dedicated **exclusively** to metroidvanias and soulsvanias. What makes it different:

- Deep coverage of games Fextralife treats as secondary
- **Native spoiler toggle** on every page (4 levels)
- **Adaptable architecture** — optional modules per game (rings, charms, weapons, spells…)
- Fast, responsive, **no ads** — brand promise, never break this
- Cross-game vision: genre glossary, comparisons, beginner guides
- Releases calendar for upcoming genre games
- Tier lists per game and globally
- AI chatbot per game (Phase 5, RAG-based)

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG + SSR + API routes |
| Language | TypeScript (strict mode) | Familiar to C# devs |
| Styling | Tailwind CSS + shadcn/ui | Brand tokens in CSS vars |
| Database | Supabase (PostgreSQL) | Free tier, SQL |
| ORM | Drizzle ORM + drizzle-zod | Schema = source of truth |
| Validation | Zod | All forms + env vars |
| Forms | React Hook Form + Zod | Admin panel forms |
| Drag & Drop | dnd-kit | Tier lists |
| Markdown | react-markdown | Content + admin preview |
| Maps | Leaflet.js + react-leaflet | Interactive area maps |
| Search | Supabase Full-Text Search | Migrate to Algolia if needed |
| Images | Supabase Storage | Never use public/ folder |
| Analytics | Umami (self-hosted Vercel) | Privacy-first, no GDPR banner |
| Deploy | Vercel | Auto CI/CD from GitHub |
| i18n | next-intl | English now, PT-ready |
| Version control | GitHub | CI/CD from day 1 |

---

## Brand Tokens (use these exactly, never approximate)

```
Background base:    #111218
Surface / cards:    #1a1a2e
Accent (amber):     #EF9F27   ← ALWAYS this exact value, never approximate
Primary text:       #e8e8e8
Secondary text:     #888888
Font (UI):          Inter (400 / 500 / 600)
Font (code/slugs):  JetBrains Mono
Visual tone:        Modern, dark mode, clean UI
```

**Logo:** Book-labyrinth + logotype
- "Vania" in white (`#e8e8e8`)
- "Codex" in amber (`#EF9F27`)
- Icon: book with labyrinth interior — codex + interconnected maps

---

## URL Structure

| Page | URL |
|---|---|
| Homepage | `/` |
| Game page | `/[game]` |
| Boss list | `/[game]/bosses` |
| Boss detail | `/[game]/bosses/[slug]` |
| Item list by type | `/[game]/items/[type]` |
| Item detail | `/[game]/items/[type]/[slug]` |
| NPC list | `/[game]/npcs` |
| NPC detail | `/[game]/npcs/[slug]` |
| Area detail | `/[game]/areas/[slug]` |
| Game tier list | `/[game]/tierlist` |
| Global tier list | `/tierlist` |
| Releases calendar | `/releases` |
| Admin panel | `/admin` |

---

## Adaptable Architecture

### The problem
Every game has unique mechanics: Hollow Knight has Charms, Ender Lilies has Relics, Salt & Sanctuary has Skills, others have none of these.

### The solution
Each game has a `game_config` (jsonb) column in the `games` table that enables/disables modules:

```json
{ "relics": true, "spirits": true, "rings": false, "spells": false, "charms": false }
```

This config lives in the database — **no deploy needed to change it**. The frontend reads `game_config` and renders only active modules.

```typescript
// ✅ Always read from game_config
const showRelics = game.game_config?.relics === true

// ❌ Never hardcode per game
const showRelics = game.slug === 'ender-lilies'
```

### Universal modules (always present for every game)
- Overview / Lore
- Bosses
- NPCs
- Interactive map
- Achievements / 100% Guide
- Spoiler toggles
- Comments

### Optional modules (enabled per game via game_config)

| Module | Example game |
|---|---|
| Relics | Ender Lilies |
| Spirits / Companions | Ender Lilies |
| Charms | Hollow Knight |
| Rings | Dark Souls |
| Skill Trees | Salt & Sanctuary |
| Prayers / Spells | Blasphemous, Elden Ring |
| Weapon Types | Most soulsvanias |
| Rosary Beads | Blasphemous |
| Sword Hearts | Blasphemous |

### Dynamic vs Static content
- **Dynamic (DB)** — anything repeatable: items, bosses, NPCs. One template page renders from Supabase. Adding content = adding a DB row.
- **Static (handcrafted)** — unique pages: game homepage, interactive map, narrative guides.

---

## Pilot Game: Ender Lilies

### Why Ender Lilies?
- Loyal community but existing wiki is weak
- Well-defined mechanics (good for testing adaptable architecture)
- Rich lore with lots of documentation space
- Manageable size for a solo MVP

### game_config for Ender Lilies
```json
{ "relics": true, "spirits": true, "bosses": true, "npcs": true, "areas": true }
```

### Content to cover
- All Bosses (strategies + drops + lore)
- All Spirits (moveset, upgrades, combos) — Ender Lilies exclusive module
- All Relics (passive equippables)
- All NPCs
- Interactive map per area
- 100% guide / Achievements
- Compiled lore (item descriptions + dialogues)
- Beginner guide for the genre
- Multiple endings (spoiler level 3)

---

## Future Games (Phase 3)

| Game | Unique modules |
|---|---|
| Blasphemous | Prayers, Rosary Beads, Sword Hearts |
| Salt and Sanctuary | Skill Trees, Weapon Types |
| Ender Magnolia | TBD — similar to Ender Lilies |

---

## Spoiler System

Central requirement: every page must support hidden content.

### Spoiler levels
- **Level 0** — No spoilers (visible to everyone)
- **Level 1** — Boss / location spoiler
- **Level 2** — Lore / story spoiler
- **Level 3** — Ending / major twist

### Technical implementation
- Global toggle in header ("Show spoilers: OFF/ON")
- Inline toggle per content block
- Preference stored in localStorage
- **SEO-safe: content stays in DOM, hidden via CSS only — never conditionally removed**

```tsx
// ✅ SEO-safe — content stays in DOM
<div className={cn('spoiler-content', { 'spoiler-hidden': !revealed })}>
  {children}
</div>

// ❌ Removes content from DOM — kills SEO
{revealed && <div>{children}</div>}
```

---

## Comments System

- Comments section on every page (boss, item, NPC, area)
- Fextralife-style — community tips and notes
- No authentication — anyone can comment (name optional)
- **Comments visible immediately** — no manual approval
- Upvotes on comments — highest voted shown first
- Vote stored in localStorage (anti-double-vote in MVP)
- Admin can delete comments in the panel
- No external dependencies (no Disqus, no Giscus)

---

## Tier Lists

### Per game
- Tier list for items, weapons, relics, spirits, etc.
- Categories defined by the game's `game_config`
- Interactive in browser (drag & drop via dnd-kit)
- **No users:** state stored in URL (`?tier=S:item1,item2|A:item3`)
- User drags, copies link, shares

### Global page
- Tier list of all games in the wiki
- Same URL-sharing mechanic

---

## Database Schema

### Table: `games`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, gen_random_uuid() |
| `name` | text | Game name |
| `slug` | text | URL slug (e.g. `ender-lilies`) |
| `description` | text | Markdown |
| `cover_image_url` | text | Supabase Storage URL |
| `release_year` | int | |
| `developer` | text | |
| `genre` | text | metroidvania / soulsvania / hybrid |
| `is_published` | bool | Default false |
| `game_config` | jsonb | Active modules e.g. `{ "relics": true, "spirits": true }` |

### Table: `areas`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games |
| `name` | text | |
| `slug` | text | |
| `description` | text | Markdown |
| `image_url` | text | |
| `map_x` | float | X coordinate for Leaflet.js |
| `map_y` | float | Y coordinate for Leaflet.js |
| `spoiler_level` | int | 0–3 |
| `is_published` | bool | Default false |

### Table: `item_types`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games |
| `name` | text | e.g. Relic, Charm, Ring, Spirit, Prayer |
| `slug` | text | |
| `icon_url` | text | Type icon |

### Table: `items`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games |
| `item_type_id` | uuid | FK → item_types |
| `name` | text | |
| `description` | text | Markdown |
| `image_url` | text | |
| `how_to_obtain` | text | |
| `area_id` | uuid | FK → areas |
| `spoiler_level` | int | 0–3 |
| `is_published` | bool | Default false |
| `attributes` | jsonb | Unique fields per type/game |
| `slug` | text | |

### Table: `bosses`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games |
| `area_id` | uuid | FK → areas |
| `name` | text | |
| `slug` | text | |
| `description` | text | Markdown |
| `image_url` | text | |
| `lore` | text | Markdown |
| `strategy` | text | Markdown |
| `spoiler_level` | int | 0–3 |
| `is_published` | bool | Default false |
| `attributes` | jsonb | e.g. `{ "phases": 2, "weaknesses": ["fire"] }` |

### Table: `npcs`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games |
| `area_id` | uuid | FK → areas |
| `name` | text | |
| `slug` | text | |
| `description` | text | Markdown |
| `image_url` | text | |
| `lore` | text | Markdown |
| `spoiler_level` | int | 0–3 |
| `is_published` | bool | Default false |

### Table: `releases`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Game name |
| `slug` | text | |
| `description` | text | |
| `cover_image_url` | text | |
| `developer` | text | |
| `release_date` | date | Launch date or estimate |
| `platforms` | jsonb | e.g. `["PC", "PS5", "Switch"]` |
| `genre` | text | metroidvania / soulsvania / hybrid |
| `status` | text | announced / released / delayed |
| `external_link` | text | Steam, official site, etc. |

### Table: `comments`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `page_type` | text | boss / item / npc / area |
| `page_id` | uuid | ID of the commented entity |
| `author_name` | text | Optional, anonymous if empty |
| `content` | text | Simple Markdown |
| `upvotes` | int | Default 0 — sort by upvotes |
| `created_at` | timestamp | |

### Table: `tierlists` (Phase 5)
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `game_id` | uuid | FK → games (null = global tier list) |
| `name` | text | e.g. "Best Spirits", "All Games" |
| `slug` | text | |
| `item_type_id` | uuid | FK → item_types (null = game tier list) |
| `tiers` | jsonb | e.g. `{ "S": [], "A": [], "B": [], "C": [], "D": [] }` |

### Table relationships
```
games
  ├── areas          (game_id)
  ├── item_types     (game_id)
  ├── items          (game_id, item_type_id, area_id)
  ├── bosses         (game_id, area_id)
  ├── npcs           (game_id, area_id)
  └── tierlists      (game_id, item_type_id)

releases   (independent — releases calendar)
comments   (independent — by page_type + page_id)
```

---

## Admin Panel

Own panel in Next.js — route `/admin`, password-protected, no external dependencies.

### Authentication
- Login with password via environment variable (`ADMIN_PASSWORD`)
- Session in secure cookie
- `middleware.ts` blocks `/admin` without valid session

### Dashboard
- Counters: number of games, bosses, items, NPCs published
- Quick shortcuts to each section

### CRUD scope (MVP)
- **Games** — create, edit, publish/unpublish, manage `game_config`
- **Areas** — create, edit, map coordinates
- **Item types** — create, edit, associate to game
- **Items** — create, edit, image upload, spoiler level
- **Bosses** — create, edit, image upload, spoiler level
- **NPCs** — create, edit, image upload, spoiler level
- **Releases** — create, edit, manage status
- **Comments** — list by game/page, delete

### Text editor
- Markdown with live preview (textarea + preview side by side)
- Library: `react-markdown`
- Stored as plain text in DB

---

## SEO

- Clean, consistent URLs
- Schema.org markup (`VideoGame`, `ItemList`)
- Auto sitemap per game via `app/sitemap.ts`
- `robots.txt` blocks `/admin`
- Avoid duplicate content across games
- Every `page.tsx` must export `generateMetadata`

---

## Image Rights

- Screenshots taken by admin — allowed
- High-res official art — avoid
- Footer: "All game assets belong to their respective owners"
- Credits page with publishers
- Takedown policy — remove immediately if requested
- Check fan content policy per publisher

---

## Monetization (no ads — brand promise, never break this)

- Ko-fi / Patreon
- Steam / Humble Bundle affiliate links
- Partnerships with indie developers

---

## Validation Gates

**Run ALL of these before declaring any step done:**

```bash
# TypeScript — zero errors allowed
npx tsc --noEmit

# ESLint — zero warnings allowed in new files
npx eslint . --ext .ts,.tsx --max-warnings 0

# Tests — all must pass
npx vitest run

# Build — must succeed without errors
npx next build
```

If any check fails: **stop, fix, re-validate before continuing.** Never leave a failing check with a "TODO: fix later" comment.

---

## Git Workflow

### Commit format (Conventional Commits)
```
<type>(<scope>): <short description>

[optional body — why, not what]
```

**Types:** `feat` | `fix` | `chore` | `refactor` | `test` | `docs` | `style`

**Scopes:** `db` | `admin` | `wiki` | `auth` | `seo` | `i18n` | `map` | `comments` | `tierlist` | `config`

**Examples:**
```
feat(db): add drizzle schema for games and areas tables
feat(admin): create CRUD form for bosses with image upload
fix(spoiler): prevent spoiler content flash on initial render
chore(config): add eslint rules for import ordering
test(slugify): add unit tests for edge cases
```

### Commit rules
- One concern per commit — never mix schema changes with UI changes
- Commit messages in **English**
- Commit only after all validation gates pass
- Never commit: `.env*`, `node_modules/`, Supabase service role keys, build artifacts

### Branch strategy
```
main          — always deployable
dev           — active development, merges into main via PR
feat/<name>   — for larger isolated features
```

---

## TypeScript Rules

- `strict: true` in `tsconfig.json` — non-negotiable
- No `any` — use `unknown` and narrow, or create a proper type
- All Supabase query return types must be explicitly typed via Drizzle inferred types
- Prefer `type` over `interface` for data shapes; use `interface` for extensible contracts
- Export types from a central `types/` directory when shared across 2+ files

```typescript
// ✅ Good
const boss = await getBossById(id) // returns Boss | null, fully typed

// ❌ Never
const boss: any = await supabase.from('bosses').select('*')
```

---

## File & Folder Conventions

```
vaniacodex/
├── app/
│   ├── (wiki)/
│   │   ├── page.tsx              # Homepage
│   │   ├── releases/             # Releases calendar
│   │   ├── tierlist/             # Global tier list
│   │   └── [game]/
│   │       ├── page.tsx          # Game homepage
│   │       ├── bosses/
│   │       │   ├── page.tsx      # Boss list
│   │       │   └── [slug]/page.tsx
│   │       ├── npcs/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       ├── areas/
│   │       │   └── [slug]/page.tsx
│   │       ├── items/[type]/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       └── tierlist/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx          # Dashboard
│   │       ├── games/
│   │       ├── bosses/
│   │       ├── items/
│   │       ├── npcs/
│   │       ├── areas/
│   │       ├── releases/
│   │       └── comments/
│   └── api/
├── components/
│   ├── ui/                       # shadcn/ui — do not modify directly
│   ├── wiki/
│   │   ├── SpoilerBlock.tsx
│   │   ├── BossCard.tsx
│   │   ├── ItemCard.tsx
│   │   ├── TierList.tsx
│   │   └── Comments.tsx
│   ├── admin/
│   └── layout/                   # Header, Footer, Sidebar
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookie-based)
│   │   └── queries/              # ALL DB queries live here
│   │       ├── games.ts
│   │       ├── bosses.ts
│   │       ├── items.ts
│   │       ├── npcs.ts
│   │       ├── areas.ts
│   │       └── comments.ts
│   ├── i18n/
│   ├── seo/
│   └── utils/
│       ├── slugify.ts
│       └── slugify.test.ts
├── db/
│   ├── schema.ts                 # Single source of truth — all Drizzle definitions
│   └── migrations/               # Drizzle-generated only — never edit manually
├── hooks/
├── types/
│   └── index.ts
├── constants/
├── config/
│   ├── env.ts                    # Zod-validated env vars
│   └── site.ts                   # Site-wide constants
├── styles/
│   └── globals.css
├── messages/
│   └── en.json
└── middleware.ts                 # Protects /admin routes
```

### Rules
- **No inline DB queries in components or pages** — always import from `lib/supabase/queries/`
- **No hardcoded strings** that belong in `config/site.ts` or `messages/en.json`
- Component files: PascalCase (`BossCard.tsx`)
- Utility/hook files: camelCase (`useLocalStorage.ts`)
- Never put logic inside `page.tsx` — delegate to components and query functions
- Images always go to Supabase Storage — never `public/`
- Tests colocated with the file they test (`*.test.ts`)

---

## Component Rules

- All components must have explicit prop types (no implicit `any`)
- Use Server Components by default; add `'use client'` only when necessary (event handlers, hooks, browser APIs)
- Never use `useEffect` to fetch data — use Server Components or React Query
- The spoiler system must be SEO-safe: content stays in the DOM, hidden via CSS only

---

## Error Handling

- All async functions must handle errors explicitly — no unhandled promise rejections
- DB queries return `T | null` on not-found, throw on unexpected errors
- API routes return typed error responses: `{ error: string, code: string }`
- Use `notFound()` from Next.js for 404 cases in page components
- Never expose internal error messages to the client in production

```typescript
// ✅ Pattern for query functions
export async function getBossById(id: string): Promise<Boss | null> {
  try {
    const result = await db.query.bosses.findFirst({ where: eq(bosses.id, id) })
    return result ?? null
  } catch (error) {
    console.error('[getBossById]', error)
    throw new Error('Failed to fetch boss')
  }
}
```

---

## Env Variables

Never access `process.env` directly outside of `config/env.ts`:

```typescript
// config/env.ts — validated at startup with Zod
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(12),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

Required in `.env.local` (never commit this file):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
```

---

## Development Workflow (Step-by-Step Protocol)

When implementing any feature, follow this exact sequence:

```
1. PLAN    — State what you're about to build and why, in 2-3 sentences
2. SCHEMA  — If DB changes are needed, write and validate the Drizzle schema first
3. BUILD   — Implement the feature
4. LINT    — Run ESLint, fix all issues
5. TYPES   — Run tsc --noEmit, fix all issues
6. TEST    — Write or update tests, run vitest
7. BUILD   — Run next build, fix any errors
8. COMMIT  — Write a conventional commit message and commit
9. REPORT  — State what was done, update checklist in CLAUDE.md, state next step
```

**Never skip steps. Never combine steps for speed.**

---

## What "Done" Means

A task is **done** when:
1. `tsc --noEmit` passes with zero errors
2. `eslint` passes with zero warnings in touched files
3. `vitest run` passes with zero failures
4. `next build` succeeds
5. The feature works as intended in the browser
6. A conventional commit has been made with a clear message
7. No `// TODO`, `// FIXME`, or `console.log` left in committed code
8. The checklist item in this file is marked `[x]`

---

## Things to Never Do

- Never use `any` in TypeScript
- Never write DB queries inside components or page files
- Never hardcode `#EF9F27` as a one-off — use the Tailwind config token
- Never commit `.env*` files
- Never use `dangerouslySetInnerHTML` for user-generated content
- Never skip validation gates to "save time"
- Never use `localStorage` for anything security-related
- Never call Supabase with the service role key on the client side
- Never show ads — brand promise
- Never conditionally remove spoiler content from DOM (SEO would break)
- Never hardcode module availability per game slug — always use `game_config`

---

## Phase 1 Checklist — Foundation ✅ COMPLETE

- [x] Init Next.js project with TypeScript strict mode
- [x] Configure ESLint + Prettier with project rules
- [x] Configure Tailwind with brand tokens
- [x] Install and configure shadcn/ui
- [x] Setup `config/env.ts` with Zod validation
- [x] Setup `config/site.ts` with site constants
- [x] Create Supabase project and configure Drizzle schema (`db/schema.ts`) — 9 tables
- [x] Run first Drizzle migration — validate all tables exist in Supabase
- [x] Setup Supabase client and server helpers in `lib/supabase/`
- [x] Implement `SpoilerBlock.tsx` component with localStorage persistence
- [x] Implement base layout (Header, Footer) with brand identity
- [x] Implement admin auth via middleware + cookie
- [x] Implement admin dashboard with game/boss/item/NPC/area CRUD
- [x] Implement dynamic page templates for boss, item, NPC, area
- [x] Setup `app/sitemap.ts` and `app/robots.ts`
- [x] Deploy to Vercel — build passes in CI
- [ ] Setup Umami analytics (deferred — not blocking Phase 2)

---

## Phase 2 Checklist — Ender Lilies MVP

- [x] Add Ender Lilies entry to `games` table with correct `game_config`
- [x] Game homepage at `/ender-lilies` — modules from `game_config`, nav to each section
- [x] Populate all areas in DB
- [x] Populate all bosses in DB (strategies + drops + lore)
- [x] Populate all Spirits in DB (moveset, upgrades, combos)
- [x] Populate all Relics in DB
- [x] Populate all NPCs in DB
- [x] Interactive map with Leaflet.js — areas with pins for bosses, NPCs, items
- [x] Comments system on every entity page (boss, item, NPC, area)
- [ ] SEO on-page — meta tags, schema.org (`VideoGame`, `ItemList`), sitemap update
- [ ] Tier list for items/spirits — dnd-kit drag & drop, state in URL
- [ ] 100% guide / Achievements page
- [ ] Beginner guide for the genre

---

## Phase 3 Checklist — Global Features

- [ ] Releases calendar page at `/releases` — visual calendar + filterable list
- [ ] Global game tier list at `/tierlist` — same URL-sharing mechanic
- [ ] Full-text search — Supabase FTS across bosses, items, NPCs, areas
- [ ] Add Blasphemous to `games` table with `game_config` (prayers, rosary beads, sword hearts)
- [ ] Identify Blasphemous-specific modules and add to schema if needed
- [ ] Populate Blasphemous content (bosses, items, NPCs, areas)
- [ ] Add Salt and Sanctuary to `games` table with `game_config` (skill trees, weapon types)
- [ ] Populate Salt and Sanctuary content
- [ ] Add Ender Magnolia to `games` table
- [ ] Populate Ender Magnolia content
- [ ] Evaluate IGDB API integration for auto-populating `releases` table
- [ ] Validate `game_config` correctly shows/hides modules per game on frontend
- [ ] QA: confirm Ender Lilies pages unaffected by new schema additions

---

## Phase 4 Checklist — Community & Growth

- [ ] Setup Umami analytics (if not done in Phase 1)
- [ ] Analytics review — identify top traffic pages
- [ ] Discord server for the project
- [ ] Ko-fi / Patreon page setup
- [ ] Steam / Humble Bundle affiliate links on game pages
- [ ] Credits page with publisher attributions
- [ ] Takedown policy page

---

## Phase 5 Checklist — AI & Advanced Features

- [ ] AI chatbot per game — RAG with wiki DB as context
- [ ] Model selection: Claude Haiku or GPT-4o mini (low cost)
- [ ] Rate limiting by IP for chatbot
- [ ] Only activate chatbot on games with complete wiki
- [ ] Tier list management in admin panel (Phase 5 DB-backed tier lists)
- [ ] Tier list sharing improvements