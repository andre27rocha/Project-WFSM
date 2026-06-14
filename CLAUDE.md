# VaniaCodex — Claude Code Project Instructions

You are the sole developer assistant for **VaniaCodex** (internal: Project-WFSM), a wiki platform dedicated to metroidvania and soulsvania games. The developer has a C# background and is learning the web stack. Your role is to write production-quality code, catch errors proactively, and teach best practices inline.

---

## Prime Directives

1. **Never advance to the next step until the current one is fully validated.** Run type checks, lints, and tests before marking anything complete.
2. **Every file you create or modify must be correct, complete, and consistent** with the existing codebase.
3. **Explain decisions briefly** — especially when a pattern might be unfamiliar to a C# developer.
4. **Commit after every meaningful, validated unit of work.** Never batch unrelated changes in a single commit.

---

## Project Context

- **Public name:** VaniaCodex | **Dev name:** Project-WFSM
- **Domain:** vaniacodex.com
- **Pilot game:** Ender Lilies: Quietus of the Knights
- **Developer:** Solo dev, C# background

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM + drizzle-zod |
| Validation | Zod |
| Forms | React Hook Form + Zod |
| Drag & Drop | dnd-kit (tier lists) |
| Markdown | react-markdown |
| Maps | Leaflet.js + react-leaflet |
| i18n | next-intl (English first, PT-ready) |
| Analytics | Umami (self-hosted) |
| Deploy | Vercel |

### Brand Tokens (use these, never approximate)

```
Background base:    #111218
Surface / cards:    #1a1a2e
Accent (amber):     #EF9F27   ← always this exact value
Primary text:       #e8e8e8
Secondary text:     #888888
Font (UI):          Inter (400 / 500 / 600)
Font (code/slugs):  JetBrains Mono
```

---

## Validation Gates

**Run these checks before declaring any step done:**

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

If any check fails: **stop, fix, re-validate before continuing.** Do not leave a failing check with a "TODO: fix later" comment.

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
- Commit only after validation gates pass
- Never commit: `.env*`, `node_modules/`, Supabase service role keys, build artifacts

### Branch strategy (solo dev, simplified)
```
main          — always deployable, protected
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
│   ├── (wiki)/               # Public-facing wiki routes
│   │   ├── page.tsx          # Homepage
│   │   ├── releases/
│   │   ├── tierlist/
│   │   └── [game]/
│   │       ├── page.tsx
│   │       ├── bosses/[slug]/page.tsx
│   │       ├── npcs/[slug]/page.tsx
│   │       ├── areas/[slug]/page.tsx
│   │       ├── items/[type]/[slug]/page.tsx
│   │       └── tierlist/page.tsx
│   ├── (admin)/
│   │   └── admin/            # Protected admin panel
│   └── api/                  # API route handlers
├── components/
│   ├── ui/                   # shadcn/ui base components (do not modify directly)
│   ├── wiki/                 # Wiki-specific components
│   │   ├── SpoilerBlock.tsx
│   │   ├── BossCard.tsx
│   │   ├── ItemCard.tsx
│   │   ├── TierList.tsx
│   │   └── Comments.tsx
│   ├── admin/                # Admin panel components
│   └── layout/               # Header, Footer, Sidebar
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── queries/          # All DB queries live here — never inline queries in components
│   │       ├── games.ts
│   │       ├── bosses.ts
│   │       ├── items.ts
│   │       ├── npcs.ts
│   │       └── comments.ts
│   ├── i18n/
│   ├── seo/
│   └── utils/
│       ├── slugify.ts
│       └── slugify.test.ts   # Tests colocated with the file they test
├── db/
│   ├── schema.ts             # Single source of truth — all Drizzle schema definitions
│   └── migrations/           # Drizzle-generated migrations only — never edit manually
├── hooks/                    # Custom React hooks
├── types/                    # Shared TypeScript types
│   └── index.ts
├── constants/
├── config/
│   └── site.ts               # Site-wide constants (name, domain, nav, etc.)
├── styles/
│   └── globals.css
└── messages/
    └── en.json               # i18n strings
```

### Rules
- **No inline DB queries in components or pages.** Always import from `lib/supabase/queries/`.
- **No hardcoded strings** that belong in `config/site.ts` or `messages/en.json`.
- Component files: PascalCase (`BossCard.tsx`)
- Utility/hook files: camelCase (`useLocalStorage.ts`)
- Never put logic inside `page.tsx` — delegate to components and query functions.

---

## Database Schema Conventions (Drizzle)

- All tables use `uuid` primary keys with `gen_random_uuid()` default
- All tables that have content have `is_published: boolean` defaulting to `false`
- All content tables have `spoiler_level: integer` defaulting to `0`
- All slugs must be unique within their game scope
- The `attributes` (jsonb) column must always have a documented structure in a comment
- `game_config` (jsonb) on the `games` table controls which modules are active — **never hardcode module availability in components**; always read from `game_config`

```typescript
// ✅ Correct — read from game_config
const showRelics = game.game_config?.relics === true

// ❌ Never
const showRelics = game.slug === 'ender-lilies'
```

---

## Component Rules

- All components must have explicit prop types (no implicit `any`)
- Use Server Components by default; add `'use client'` only when necessary (event handlers, hooks, browser APIs)
- Never use `useEffect` to fetch data — use Server Components or React Query
- The spoiler system must be SEO-safe: content stays in the DOM, hidden via CSS only

```tsx
// ✅ SEO-safe spoiler
<div className={cn('spoiler-content', { 'spoiler-hidden': !revealed })}>
  {children}
</div>

// ❌ Removes content from DOM — bad for SEO
{revealed && <div>{children}</div>}
```

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

## SEO Requirements

Every `page.tsx` must export a `generateMetadata` function. Minimum fields:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${boss.name} | VaniaCodex`,
    description: boss.description.slice(0, 155),
    openGraph: { ... },
  }
}
```

- Sitemap must be auto-generated via `app/sitemap.ts`
- `robots.txt` must block `/admin`
- Schema.org markup for `VideoGame` and `ItemList` entities

---

## Admin Panel Rules

- Route `/admin` is protected via `middleware.ts` using a secure cookie
- Admin password stored in `ADMIN_PASSWORD` env variable — never hardcoded
- All admin forms use React Hook Form + Zod for validation
- Image uploads go to Supabase Storage — never `public/`
- Admin never uses `DELETE` cascades without a confirmation dialog
- Markdown editor: textarea + live preview side by side using `react-markdown`

---

## Env Variables

Always use this pattern. Never access `process.env` directly outside of `config/`:

```typescript
// config/env.ts — validated at startup with Zod
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(12),
})

export const env = envSchema.parse(process.env)
```

Required variables for `.env.local` (never commit this file):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
9. REPORT  — State what was done and what the next step is
```

**Never skip steps. Never combine steps for speed.**

---

## Phase 1 Checklist (Your Starting Point)

Work through these in order. Check each off only after all validation gates pass:

- [x] Init Next.js project with TypeScript strict mode
- [x] Configure ESLint + Prettier with project rules
- [x] Configure Tailwind with brand tokens from this document
- [x] Install and configure shadcn/ui
- [x] Setup `config/env.ts` with Zod validation
- [x] Setup `config/site.ts` with site constants
- [x] Create Supabase project and configure Drizzle schema (`db/schema.ts`)
- [x] Run first Drizzle migration — validate tables exist in Supabase
- [x] Setup Supabase client and server helpers in `lib/supabase/`
- [x] Implement `SpoilerBlock.tsx` component with localStorage persistence
- [ ] Implement base layout (Header, Footer) with brand identity
- [ ] Implement admin auth via middleware + cookie
- [ ] Implement admin dashboard with game/boss/item/NPC/area CRUD
- [ ] Implement dynamic page templates for boss, item, NPC, area
- [ ] Setup `app/sitemap.ts` and `app/robots.ts`
- [ ] Deploy to Vercel — confirm build passes in CI
- [ ] Setup Umami analytics

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
