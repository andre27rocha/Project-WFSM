import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getBossBySlug } from '@/lib/supabase/queries/bosses'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'

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

  const infobox = hasStats && (
    <aside className="mb-6 w-full overflow-hidden rounded border border-border bg-card lg:mb-0 lg:w-56 lg:shrink-0 xl:w-64">
      {boss.imageUrl && (
        <div className="relative h-48 w-full">
          <Image src={boss.imageUrl} alt={boss.name} fill className="object-cover" priority />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-primary/10">
            <th
              colSpan={2}
              className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-primary"
            >
              Stats
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.hp !== undefined && (
            <tr className="border-b border-border/40">
              <td className="w-24 px-3 py-1.5 text-xs text-muted-foreground">HP</td>
              <td className="px-3 py-1.5 font-medium text-foreground">
                {attrs.hp.toLocaleString()}
              </td>
            </tr>
          )}
          {attrs.phases !== undefined && (
            <tr className="border-b border-border/40">
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Phases</td>
              <td className="px-3 py-1.5 font-medium text-foreground">{attrs.phases}</td>
            </tr>
          )}
          {attrs.location && (
            <tr className="border-b border-border/40">
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Location</td>
              <td className="px-3 py-1.5 font-medium text-foreground">{attrs.location}</td>
            </tr>
          )}
          {(attrs.weaknesses ?? []).length > 0 && (
            <tr className="border-b border-border/40">
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Weak</td>
              <td className="px-3 py-1.5 font-medium text-foreground">
                {attrs.weaknesses!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.resistances ?? []).length > 0 && (
            <tr className="border-b border-border/40">
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Resist</td>
              <td className="px-3 py-1.5 font-medium text-foreground">
                {attrs.resistances!.join(', ')}
              </td>
            </tr>
          )}
          {(attrs.rewards ?? []).length > 0 && (
            <tr>
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Drops</td>
              <td className="px-3 py-1.5 font-medium text-foreground">
                {attrs.rewards!.join(', ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  )

  const details = (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-5">
        {boss.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{boss.description}</p>
        )}
        {boss.content && <WikiMarkdown content={boss.content} />}
      </div>

      {/* Infobox — right column on desktop, top on mobile */}
      {infobox}
    </div>
  )

  return (
    <div className="px-6 py-5">
      {/* Breadcrumb */}
      <p className="mb-3 text-xs text-muted-foreground">
        <Link href={`/${gameSlug}`} className="hover:text-primary transition-colors">
          {game.name}
        </Link>{' '}
        /{' '}
        <Link href={`/${gameSlug}/bosses`} className="hover:text-primary transition-colors">
          Bosses
        </Link>{' '}
        / {boss.name}
      </p>

      {/* Page title — full width, no image here (image is in infobox) */}
      <h1 className="mb-5 text-2xl font-bold text-foreground">{boss.name}</h1>

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
