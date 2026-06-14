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

  const details = (
    <div className="space-y-8">
      {npc.description && (
        <p className="text-lg leading-relaxed text-muted-foreground">{npc.description}</p>
      )}

      {npc.content && <WikiMarkdown content={npc.content} />}

      {(attrs.role ||
        attrs.questRelated ||
        (attrs.services ?? []).length > 0 ||
        (attrs.dialogueHints ?? []).length > 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Details</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {attrs.role && (
              <>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium text-foreground">{attrs.role}</dd>
              </>
            )}
            {attrs.questRelated && (
              <>
                <dt className="text-muted-foreground">Quest</dt>
                <dd className="font-medium text-foreground">Yes</dd>
              </>
            )}
            {(attrs.services ?? []).length > 0 && (
              <>
                <dt className="text-muted-foreground">Services</dt>
                <dd className="font-medium text-foreground">{attrs.services!.join(', ')}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  )

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-6 text-sm text-muted-foreground">
        <Link href={`/${gameSlug}`} className="transition-colors hover:text-primary">
          {game.name}
        </Link>{' '}
        /{' '}
        <Link href={`/${gameSlug}/npcs`} className="transition-colors hover:text-primary">
          NPCs
        </Link>{' '}
        / {npc.name}
      </p>

      {npc.imageUrl && (
        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl">
          <Image src={npc.imageUrl} alt={npc.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-6 text-3xl font-semibold text-foreground">{npc.name}</h1>

      {npc.spoilerLevel > 0 ? (
        <SpoilerBlock level={npc.spoilerLevel} label={npc.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </main>
  )
}
