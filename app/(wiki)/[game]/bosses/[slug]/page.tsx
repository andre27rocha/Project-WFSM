import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getBossBySlug } from '@/lib/supabase/queries/bosses'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

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
    openGraph: {
      title: boss.name,
      description: boss.description?.slice(0, 155) ?? '',
      images: boss.imageUrl ? [{ url: boss.imageUrl }] : [],
    },
  }
}

export default async function BossPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const boss = await getBossBySlug(game.id, slug)
  if (!boss || !boss.isPublished) notFound()

  const attrs = boss.attributes

  const hasStats =
    attrs.hp !== undefined ||
    attrs.phases !== undefined ||
    attrs.location ||
    (attrs.rewards ?? []).length > 0 ||
    (attrs.weaknesses ?? []).length > 0 ||
    (attrs.resistances ?? []).length > 0

  const infobox = hasStats ? (
    <aside className="float-right clear-right mb-4 ml-6 w-[260px] overflow-hidden rounded border border-wiki-border bg-[#1a1a2e]">
      {boss.imageUrl && (
        <div className="relative h-44 w-full">
          <Image src={boss.imageUrl} alt={boss.name} fill className="object-cover" priority />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-wiki-border bg-primary/10">
            <th
              colSpan={2}
              className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary"
            >
              {boss.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.hp !== undefined && (
            <tr className="border-b border-wiki-border/60">
              <td className="w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                HP
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.hp.toLocaleString()}</td>
            </tr>
          )}
          {attrs.phases !== undefined && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Phases
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.phases}</td>
            </tr>
          )}
          {attrs.location && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Location
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.location}</td>
            </tr>
          )}
          {(attrs.weaknesses ?? []).length > 0 && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Weak to
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">
                {attrs.weaknesses!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.resistances ?? []).length > 0 && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Resists
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">
                {attrs.resistances!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.rewards ?? []).length > 0 && (
            <tr>
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Drops
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">
                {attrs.rewards!.join(', ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  ) : null

  const details = (
    <div>
      {infobox}
      <div className="space-y-4">
        {boss.description && (
          <p className="text-sm leading-snug text-muted-foreground">{boss.description}</p>
        )}
        {boss.content && <WikiMarkdown content={boss.content} />}
      </div>
      <div className="clear-both" />
    </div>
  )

  return (
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'Bosses', href: `/${gameSlug}/bosses` },
          { label: boss.name },
        ]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-2xl font-bold text-foreground">
        {boss.name}
      </h1>

      {boss.spoilerLevel > 0 ? (
        <SpoilerBlock level={boss.spoilerLevel} label={boss.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </div>
  )
}
