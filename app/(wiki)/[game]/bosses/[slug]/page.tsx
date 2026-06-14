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

  const details = (
    <div className="space-y-8">
      {boss.description && (
        <p className="text-lg leading-relaxed text-muted-foreground">{boss.description}</p>
      )}

      {boss.content && <WikiMarkdown content={boss.content} />}

      {(attrs.hp !== undefined ||
        attrs.phases !== undefined ||
        attrs.location ||
        (attrs.rewards ?? []).length > 0 ||
        (attrs.weaknesses ?? []).length > 0 ||
        (attrs.resistances ?? []).length > 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Stats &amp; Info</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {attrs.hp !== undefined && (
              <>
                <dt className="text-muted-foreground">HP</dt>
                <dd className="font-medium text-foreground">{attrs.hp.toLocaleString()}</dd>
              </>
            )}
            {attrs.phases !== undefined && (
              <>
                <dt className="text-muted-foreground">Phases</dt>
                <dd className="font-medium text-foreground">{attrs.phases}</dd>
              </>
            )}
            {attrs.location && (
              <>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium text-foreground">{attrs.location}</dd>
              </>
            )}
            {(attrs.weaknesses ?? []).length > 0 && (
              <>
                <dt className="text-muted-foreground">Weaknesses</dt>
                <dd className="font-medium text-foreground">{attrs.weaknesses!.join(', ')}</dd>
              </>
            )}
            {(attrs.resistances ?? []).length > 0 && (
              <>
                <dt className="text-muted-foreground">Resistances</dt>
                <dd className="font-medium text-foreground">{attrs.resistances!.join(', ')}</dd>
              </>
            )}
            {(attrs.rewards ?? []).length > 0 && (
              <>
                <dt className="text-muted-foreground">Rewards</dt>
                <dd className="font-medium text-foreground">{attrs.rewards!.join(', ')}</dd>
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
        <Link href={`/${gameSlug}/bosses`} className="transition-colors hover:text-primary">
          Bosses
        </Link>{' '}
        / {boss.name}
      </p>

      {boss.imageUrl && (
        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl">
          <Image src={boss.imageUrl} alt={boss.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-6 text-3xl font-semibold text-foreground">{boss.name}</h1>

      {boss.spoilerLevel > 0 ? (
        <SpoilerBlock level={boss.spoilerLevel} label={boss.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </main>
  )
}
