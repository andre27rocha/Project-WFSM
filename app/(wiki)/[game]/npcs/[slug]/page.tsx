import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getNpcBySlug } from '@/lib/supabase/queries/npcs'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'

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
    openGraph: {
      title: npc.name,
      description: npc.description?.slice(0, 155) ?? '',
      images: npc.imageUrl ? [{ url: npc.imageUrl }] : [],
    },
  }
}

export default async function NpcPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const npc = await getNpcBySlug(game.id, slug)
  if (!npc || !npc.isPublished) notFound()

  const attrs = npc.attributes

  const hasDetails =
    attrs.role ||
    attrs.questRelated ||
    (attrs.services ?? []).length > 0 ||
    (attrs.dialogueHints ?? []).length > 0

  const infobox = hasDetails && (
    <aside className="mb-6 w-full overflow-hidden rounded border border-border bg-card lg:mb-0 lg:w-56 lg:shrink-0 xl:w-64">
      {npc.imageUrl && (
        <div className="relative h-48 w-full">
          <Image src={npc.imageUrl} alt={npc.name} fill className="object-cover" priority />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-primary/10">
            <th
              colSpan={2}
              className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-primary"
            >
              Info
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.role && (
            <tr className="border-b border-border/40">
              <td className="w-24 px-3 py-1.5 text-xs text-muted-foreground">Role</td>
              <td className="px-3 py-1.5 font-medium text-foreground">{attrs.role}</td>
            </tr>
          )}
          {attrs.questRelated && (
            <tr className="border-b border-border/40">
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Quest</td>
              <td className="px-3 py-1.5 font-medium text-foreground">Yes</td>
            </tr>
          )}
          {(attrs.services ?? []).length > 0 && (
            <tr>
              <td className="px-3 py-1.5 text-xs text-muted-foreground">Services</td>
              <td className="px-3 py-1.5 font-medium text-foreground">
                {attrs.services!.join(', ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  )

  const details = (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-5">
        {npc.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{npc.description}</p>
        )}
        {npc.content && <WikiMarkdown content={npc.content} />}
      </div>
      {infobox}
    </div>
  )

  return (
    <div className="px-6 py-5">
      <p className="mb-3 text-xs text-muted-foreground">
        <Link href={`/${gameSlug}`} className="hover:text-primary transition-colors">
          {game.name}
        </Link>{' '}
        /{' '}
        <Link href={`/${gameSlug}/npcs`} className="hover:text-primary transition-colors">
          NPCs
        </Link>{' '}
        / {npc.name}
      </p>

      <h1 className="mb-5 text-2xl font-bold text-foreground">{npc.name}</h1>

      {npc.spoilerLevel > 0 ? (
        <SpoilerBlock level={npc.spoilerLevel} label={npc.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </div>
  )
}
