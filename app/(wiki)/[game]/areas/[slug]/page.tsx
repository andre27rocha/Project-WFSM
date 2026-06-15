import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getAreaBySlug } from '@/lib/supabase/queries/areas'
import { getPublishedBossesByGameWithArea } from '@/lib/supabase/queries/bosses'
import { getPublishedNpcsByGame } from '@/lib/supabase/queries/npcs'
import { getCommentsByEntity } from '@/lib/supabase/queries/comments'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'
import { SectionHeader } from '@/components/wiki/SectionHeader'
import { Comments } from '@/components/wiki/Comments'
import { breadcrumbSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const area = await getAreaBySlug(game.id, slug)
  if (!area) return {}
  return {
    title: area.name,
    description: area.description?.slice(0, 155) ?? `${area.name} area guide for ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/areas/${slug}` },
    openGraph: {
      title: area.name,
      description: area.description?.slice(0, 155) ?? '',
      images: area.imageUrl ? [{ url: area.imageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function AreaPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const area = await getAreaBySlug(game.id, slug)
  if (!area || !area.isPublished) notFound()

  const [rawComments, allBosses, allNpcs] = await Promise.all([
    getCommentsByEntity(game.id, 'area', area.id),
    getPublishedBossesByGameWithArea(game.id),
    getPublishedNpcsByGame(game.id),
  ])
  const areaBosses = allBosses.filter((b) => b.areaId === area.id)
  const areaNpcs = allNpcs.filter((n) => n.areaId === area.id)

  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const jsonLd = breadcrumbSchema([
    { name: game.name, url: `${siteConfig.url}/${gameSlug}` },
    { name: 'Areas', url: `${siteConfig.url}/${gameSlug}/areas` },
    { name: area.name },
  ])

  const infobox = (
    <aside className="border-wiki-border bg-wiki-card float-right clear-right mb-5 ml-6 w-[280px] overflow-hidden rounded border shadow-lg shadow-black/20 sm:w-[260px]">
      <div className="relative h-44 w-full">
        <WikiImage
          src={area.imageUrl}
          alt={area.name}
          fill
          sizes="280px"
          priority
          className="object-cover"
        />
      </div>
      <div className="border-wiki-border bg-primary/10 text-primary border-b px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase">
        {area.name}
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="border-wiki-border/60 border-b">
            <td className="border-wiki-border/60 text-muted-foreground w-[90px] border-r bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold">
              Bosses
            </td>
            <td className="text-foreground px-3 py-1.5 text-sm">{areaBosses.length}</td>
          </tr>
          <tr>
            <td className="border-wiki-border/60 text-muted-foreground border-r bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold">
              NPCs
            </td>
            <td className="text-foreground px-3 py-1.5 text-sm">{areaNpcs.length}</td>
          </tr>
        </tbody>
      </table>
    </aside>
  )

  const details = (
    <>
      {infobox}
      <div className="space-y-4">
        {area.description && (
          <p className="text-foreground/85 text-base leading-relaxed">{area.description}</p>
        )}
        {area.content && <WikiMarkdown content={area.content} />}
      </div>

      {area.mapImageUrl && (
        <div className="mt-8">
          <SectionHeader>Area Map</SectionHeader>
          <div className="border-wiki-border overflow-hidden rounded border">
            <WikiImage
              src={area.mapImageUrl}
              alt={`${area.name} map`}
              width={1200}
              height={800}
              className="h-auto w-full"
            />
          </div>
        </div>
      )}

      {areaBosses.length > 0 && (
        <div className="mt-8">
          <SectionHeader>Bosses in {area.name}</SectionHeader>
          <ul className="divide-wiki-border border-wiki-border bg-surface/30 divide-y rounded border">
            {areaBosses.map((boss) => (
              <li key={boss.id}>
                <Link
                  href={`/${gameSlug}/bosses/${boss.slug}`}
                  className="group hover:bg-surface/60 flex items-center gap-2.5 px-3 py-2.5 transition-colors"
                >
                  <span className="shrink-0 rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                    Boss
                  </span>
                  <span className="text-foreground group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors">
                    {boss.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {areaNpcs.length > 0 && (
        <div className="mt-8">
          <SectionHeader>NPCs in {area.name}</SectionHeader>
          <ul className="divide-wiki-border border-wiki-border bg-surface/30 divide-y rounded border">
            {areaNpcs.map((npc) => (
              <li key={npc.id}>
                <Link
                  href={`/${gameSlug}/npcs/${npc.slug}`}
                  className="group hover:bg-surface/60 flex items-center gap-2.5 px-3 py-2.5 transition-colors"
                >
                  <span className="shrink-0 rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-300 uppercase">
                    NPC
                  </span>
                  <span className="text-foreground group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors">
                    {npc.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="clear-both" />
    </>
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'Areas', href: `/${gameSlug}/areas` },
          { label: area.name },
        ]}
      />
      <h1 className="text-foreground mb-2 text-3xl font-bold">{area.name}</h1>
      <div className="from-primary/60 mb-6 h-0.5 w-full bg-gradient-to-r to-transparent" />

      {area.spoilerLevel > 0 ? (
        <SpoilerBlock level={area.spoilerLevel} label={area.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments comments={comments} gameId={game.id} entityType="area" entityId={area.id} />
    </WikiPage>
  )
}
