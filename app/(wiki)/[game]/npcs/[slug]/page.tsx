import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getNpcBySlug } from '@/lib/supabase/queries/npcs'
import { getCommentsByEntity } from '@/lib/supabase/queries/comments'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { WikiImage } from '@/components/wiki/WikiImage'
import { WikiPage } from '@/components/wiki/WikiPage'
import { Comments } from '@/components/wiki/Comments'
import { breadcrumbSchema, safeJsonLd } from '@/lib/seo/jsonld'

interface Props {
  params: Promise<{ game: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const npc = await getNpcBySlug(game.id, slug)
  if (!npc) return {}
  return {
    title: npc.name,
    description: npc.description?.slice(0, 155) ?? `${npc.name} NPC in ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/npcs/${slug}` },
    openGraph: {
      title: npc.name,
      description: npc.description?.slice(0, 155) ?? '',
      images: npc.imageUrl ? [{ url: npc.imageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

const labelCls =
  'w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground'

export default async function NpcPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const npc = await getNpcBySlug(game.id, slug)
  if (!npc || !npc.isPublished) notFound()

  const rawComments = await getCommentsByEntity(game.id, 'npc', npc.id)
  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const jsonLd = breadcrumbSchema([
    { name: game.name, url: `${siteConfig.url}/${gameSlug}` },
    { name: 'NPCs', url: `${siteConfig.url}/${gameSlug}/npcs` },
    { name: npc.name },
  ])

  const attrs = npc.attributes
  const metaParts = [npc.area?.name, attrs.role].filter(Boolean)

  const infobox = (
    <aside className="border-wiki-border bg-wiki-card float-right clear-right mb-5 ml-6 w-[280px] overflow-hidden rounded border shadow-lg shadow-black/20 sm:w-[260px]">
      <div className="relative h-52 w-full">
        <WikiImage
          src={npc.imageUrl}
          alt={npc.name}
          fill
          sizes="280px"
          priority
          className="object-cover"
        />
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-wiki-border bg-primary/10 border-b">
            <th
              colSpan={2}
              className="text-primary px-3 py-1.5 text-left text-[11px] font-bold tracking-wide uppercase"
            >
              {npc.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.role && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Role</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.role}</td>
            </tr>
          )}
          {npc.area && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Location</td>
              <td className="text-foreground px-3 py-1.5 text-sm">
                <Link
                  href={`/${gameSlug}/areas/${npc.area.slug}`}
                  className="text-primary transition-colors hover:underline hover:underline-offset-2"
                >
                  {npc.area.name}
                </Link>
              </td>
            </tr>
          )}
          {attrs.questRelated && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Quest</td>
              <td className="text-foreground px-3 py-1.5 text-sm">Yes</td>
            </tr>
          )}
          {(attrs.services ?? []).length > 0 && (
            <tr>
              <td className={labelCls}>Services</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.services!.join(', ')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  )

  const details = (
    <>
      {infobox}
      <div className="space-y-4">
        {npc.description && (
          <p className="text-foreground/85 text-base leading-relaxed">{npc.description}</p>
        )}
        {npc.content && <WikiMarkdown content={npc.content} />}
      </div>
      <div className="clear-both" />
    </>
  )

  return (
    <WikiPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'NPCs', href: `/${gameSlug}/npcs` },
          { label: npc.name },
        ]}
      />
      <h1 className="text-foreground mb-2 text-3xl font-bold">{npc.name}</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      {metaParts.length > 0 && (
        <p className="text-muted-foreground mb-6 text-sm">{metaParts.join(' · ')}</p>
      )}

      {npc.spoilerLevel > 0 ? (
        <SpoilerBlock level={npc.spoilerLevel} label={npc.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments comments={comments} gameId={game.id} entityType="npc" entityId={npc.id} />
    </WikiPage>
  )
}
