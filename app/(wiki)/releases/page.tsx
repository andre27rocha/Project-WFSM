import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getPublishedReleases } from '@/lib/supabase/queries/release-calendar'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

export function generateMetadata(): Metadata {
  return {
    title: 'Releases Calendar',
    description:
      'Upcoming and recently released metroidvania and soulsvania games. Filter by platform, genre, or status.',
    alternates: { canonical: `${siteConfig.url}/releases` },
    openGraph: {
      title: 'Releases Calendar — VaniaCodex',
      description: 'Upcoming metroidvania and soulsvania releases, filterable by platform and status.',
    },
    twitter: { card: 'summary_large_image' },
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = ['PC', 'PS5', 'PS4', 'Switch', 'Xbox', 'Mobile'] as const
const GENRES = ['metroidvania', 'soulsvania', 'hybrid'] as const
const STATUSES = ['announced', 'released', 'delayed'] as const

const STATUS_LABEL: Record<string, string> = {
  announced: 'Announced',
  released: 'Released',
  delayed: 'Delayed',
}

const STATUS_COLOUR: Record<string, string> = {
  announced: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  released: 'bg-green-500/20 text-green-300 border-green-500/30',
  delayed: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const GENRE_LABEL: Record<string, string> = {
  metroidvania: 'Metroidvania',
  soulsvania: 'Soulsvania',
  hybrid: 'Hybrid',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{
    platform?: string
    genre?: string
    status?: string
  }>
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded border px-3 py-1 text-xs transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-wiki-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  )
}

function buildFilterHref(
  current: { platform?: string; genre?: string; status?: string },
  toggle: { key: 'platform' | 'genre' | 'status'; value: string }
): string {
  const next = { ...current }
  if (next[toggle.key] === toggle.value) {
    delete next[toggle.key]
  } else {
    next[toggle.key] = toggle.value
  }
  const qs = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][]
  ).toString()
  return `/releases${qs ? `?${qs}` : ''}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReleasesPage({ searchParams }: Props) {
  const { platform, genre, status } = await searchParams

  const releases = await getPublishedReleases({
    platform: platform ?? undefined,
    genre: genre ?? undefined,
    status: status ?? undefined,
  })

  const activeFilters = { platform, genre, status }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <WikiBreadcrumb
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Releases Calendar' }]}
      />

      <h1 className="mb-2 text-2xl font-bold text-foreground">Releases Calendar</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Upcoming and recently released games in the metroidvania and soulsvania genres.
      </p>

      {/* Filters */}
      <div className="mb-6 space-y-3 rounded border border-wiki-border bg-[#1a1a2e]/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 w-14 shrink-0">
            Platform
          </span>
          <FilterChip
            label="All"
            href={buildFilterHref(activeFilters, { key: 'platform', value: platform ?? '' })}
            active={!platform}
          />
          {PLATFORMS.map((p) => (
            <FilterChip
              key={p}
              label={p}
              href={buildFilterHref(activeFilters, { key: 'platform', value: p })}
              active={platform === p}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 w-14 shrink-0">
            Genre
          </span>
          <FilterChip
            label="All"
            href={buildFilterHref(activeFilters, { key: 'genre', value: genre ?? '' })}
            active={!genre}
          />
          {GENRES.map((g) => (
            <FilterChip
              key={g}
              label={GENRE_LABEL[g] ?? g}
              href={buildFilterHref(activeFilters, { key: 'genre', value: g })}
              active={genre === g}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 w-14 shrink-0">
            Status
          </span>
          <FilterChip
            label="All"
            href={buildFilterHref(activeFilters, { key: 'status', value: status ?? '' })}
            active={!status}
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={STATUS_LABEL[s] ?? s}
              href={buildFilterHref(activeFilters, { key: 'status', value: s })}
              active={status === s}
            />
          ))}
        </div>
      </div>

      {/* Results */}
      {releases.length === 0 ? (
        <div className="rounded border border-wiki-border bg-[#1a1a2e]/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No releases match the selected filters.</p>
          <Link
            href="/releases"
            className="mt-3 inline-block text-sm text-primary hover:underline hover:underline-offset-2"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground/60">
            {releases.length} game{releases.length !== 1 ? 's' : ''}
          </p>
          <ul className="space-y-3">
            {releases.map((release) => (
              <li
                key={release.id}
                className="flex items-start gap-4 rounded border border-wiki-border bg-[#1a1a2e]/40 px-5 py-4 transition-colors hover:border-primary/30"
              >
                {/* Cover thumbnail */}
                {release.coverImageUrl ? (
                  <Image
                    src={release.coverImageUrl}
                    alt={release.name}
                    width={48}
                    height={64}
                    className="shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded border border-wiki-border bg-[#111218] text-[10px] text-muted-foreground/30">
                    No img
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-2">
                    {release.externalLink ? (
                      <a
                        href={release.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline hover:underline-offset-2"
                      >
                        {release.name}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-foreground">{release.name}</span>
                    )}

                    {/* Status badge */}
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOUR[release.status] ?? 'bg-muted/20 text-muted-foreground border-muted/30'}`}
                    >
                      {STATUS_LABEL[release.status] ?? release.status}
                    </span>
                  </div>

                  <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {release.developer && <span>{release.developer}</span>}
                    {release.releaseDate && (
                      <span>
                        {new Date(release.releaseDate + 'T00:00:00').toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {!release.releaseDate && <span className="italic">Date TBD</span>}
                    {release.genre && (
                      <span className="capitalize">{GENRE_LABEL[release.genre] ?? release.genre}</span>
                    )}
                  </div>

                  {release.description && (
                    <p className="text-xs leading-relaxed text-foreground/70">{release.description}</p>
                  )}

                  {/* Platform pills */}
                  {release.platforms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {release.platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded border border-wiki-border px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
