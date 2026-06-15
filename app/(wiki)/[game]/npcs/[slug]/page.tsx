import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getNpcBySlug } from '@/lib/supabase/queries/npcs'
import { getCommentsByEntity } from '@/lib/supabase/queries/comments'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'
import { Comments } from '@/components/wiki/Comments'

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

  const rawComments = await getCommentsByEntity(game.id, 'npc', npc.id)
  const comments = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    upvotes: c.upvotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const attrs = npc.attributes

  const hasDetails =
    attrs.role ||
    attrs.questRelated ||
    (attrs.services ?? []).length > 0 ||
    (attrs.dialogueHints ?? []).length > 0

  const infobox = hasDetails ? (
    <aside className="float-right clear-right mb-4 ml-6 w-[260px] overflow-hidden rounded border border-wiki-border bg-[#1a1a2e]">
      {npc.imageUrl && (
        <div className="relative h-44 w-full">
          <Image src={npc.imageUrl} alt={npc.name} fill className="object-cover" priority />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-wiki-border bg-primary/10">
            <th
              colSpan={2}
              className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-primary"
            >
              {npc.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {attrs.role && (
            <tr className="border-b border-wiki-border/60">
              <td className="w-[90px] border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Role
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">{attrs.role}</td>
            </tr>
          )}
          {attrs.questRelated && (
            <tr className="border-b border-wiki-border/60">
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Quest
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">Yes</td>
            </tr>
          )}
          {(attrs.services ?? []).length > 0 && (
            <tr>
              <td className="border-r border-wiki-border/60 bg-[#111218]/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Services
              </td>
              <td className="px-3 py-1.5 text-sm text-foreground">
                {attrs.services!.join(', ')}
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
        {npc.description && (
          <p className="text-sm leading-snug text-muted-foreground">{npc.description}</p>
        )}
        {npc.content && <WikiMarkdown content={npc.content} />}
      </div>
      <div className="clear-both" />
    </div>
  )

  return (
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[
          { label: game.name, href: `/${gameSlug}` },
          { label: 'NPCs', href: `/${gameSlug}/npcs` },
          { label: npc.name },
        ]}
      />
      <h1 className="mb-4 border-b border-primary/40 pb-1 text-2xl font-bold text-foreground">
        {npc.name}
      </h1>

      {npc.spoilerLevel > 0 ? (
        <SpoilerBlock level={npc.spoilerLevel} label={npc.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}

      <Comments
        comments={comments}
        gameId={game.id}
        entityType="npc"
        entityId={npc.id}
      />
    </div>
  )
}
