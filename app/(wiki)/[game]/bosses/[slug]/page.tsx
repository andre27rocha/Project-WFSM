import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getBossBySlug } from '@/lib/supabase/queries/bosses'
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
  const boss = await getBossBySlug(game.id, slug)
  if (!boss) return {}
  return {
    title: boss.name,
    description: boss.description?.slice(0, 155) ?? `${boss.name} boss guide for ${game.name}.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/bosses/${slug}` },
    openGraph: {
      title: boss.name,
      description: boss.description?.slice(0, 155) ?? '',
      images: boss.imageUrl ? [{ url: boss.imageUrl }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

const labelCls =
  'w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground'

export default async function BossPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const boss = await getBossBySlug(game.id, slug)
  if (!boss || !boss.isPublished) notFound()

  const rawComments = await getCommentsByEntity(game.id, 'boss', boss.id)
  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const jsonLd = breadcrumbSchema([
    { name: game.name, url: `${siteConfig.url}/${gameSlug}` },
    { name: 'Bosses', url: `${siteConfig.url}/${gameSlug}/bosses` },
    { name: boss.name },
  ])

  const attrs = boss.attributes
  const metaParts = [
    boss.area?.name,
    attrs.hp !== undefined ? `${attrs.hp.toLocaleString()} HP` : null,
    attrs.phases !== undefined
      ? `${attrs.phases} ${attrs.phases === 1 ? 'phase' : 'phases'}`
      : null,
  ].filter(Boolean)

  const infobox = (
    <aside className="border-wiki-border bg-wiki-card float-right clear-right mb-5 ml-6 w-[280px] overflow-hidden rounded border shadow-lg shadow-black/20 sm:w-[260px]">
      <div className="relative h-52 w-full">
        <WikiImage
          src={boss.imageUrl}
          alt={boss.name}
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
              {boss.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.hp !== undefined && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>HP</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.hp.toLocaleString()}</td>
            </tr>
          )}
          {attrs.phases !== undefined && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Phases</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.phases}</td>
            </tr>
          )}
          {(boss.area || attrs.location) && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Location</td>
              <td className="text-foreground px-3 py-1.5 text-sm">
                {boss.area ? (
                  <Link
                    href={`/${gameSlug}/areas/${boss.area.slug}`}
                    className="text-primary transition-colors hover:underline hover:underline-offset-2"
                  >
                    {boss.area.name}
                  </Link>
                ) : (
                  attrs.location
                )}
              </td>
            </tr>
          )}
          {(attrs.weaknesses ?? []).length > 0 && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Weak to</td>
              <td className="text-foreground px-3 py-1.5 text-sm">
                {attrs.weaknesses!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.resistances ?? []).length > 0 && (
            <tr className="border-wiki-border/60 border-b">
              <td className={labelCls}>Resists</td>
              <td className="text-foreground px-3 py-1.5 text-sm">
                {attrs.resistances!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.rewards ?? []).length > 0 && (
            <tr>
              <td className={labelCls}>Drops</td>
              <td className="text-foreground px-3 py-1.5 text-sm">{attrs.rewards!.join(', ')}</td>
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
        {boss.description && (
          <p className="text-foreground/85 text-base leading-relaxed">{boss.description}</p>
        )}
        {boss.content && <WikiMarkdown content={boss.content} />}
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
          { label: 'Bosses', href: `/${gameSlug}/bosses` },
          { label: boss.name },
        ]}
      />
      <h1 className="text-foreground mb-2 text-3xl font-bold">{boss.name}</h1>
      <div className="from-primary/60 mb-3 h-0.5 w-full bg-gradient-to-r to-transparent" />
      {metaParts.length > 0 && (
        <p className="text-muted-foreground mb-6 text-sm">{metaParts.join(' · ')}</p>
      )}

      {boss.spoilerLevel > 0 ? (
        <SpoilerBlock level={boss.spoilerLevel} label={boss.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments comments={comments} gameId={game.id} entityType="boss" entityId={boss.id} />
    </WikiPage>
  )
}
