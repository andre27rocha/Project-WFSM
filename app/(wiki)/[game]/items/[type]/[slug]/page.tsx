import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getItemBySlug } from '@/lib/supabase/queries/items'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'

interface Props {
  params: Promise<{ game: string; type: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  const item = await getItemBySlug(game.id, slug)
  if (!item) return {}
  return {
    title: item.name,
    description: item.description?.slice(0, 155) ?? `${item.name} item in ${game.name}.`,
    openGraph: {
      title: item.name,
      description: item.description?.slice(0, 155) ?? '',
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
    },
  }
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-foreground',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-primary',
}

export default async function ItemPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const item = await getItemBySlug(game.id, slug)
  if (!item || !item.isPublished) notFound()

  const attrs = item.attributes
  const rarityColor = attrs.rarity ? (RARITY_COLORS[attrs.rarity] ?? 'text-foreground') : null

  const details = (
    <div className="space-y-8">
      {item.description && (
        <p className="text-lg leading-relaxed text-muted-foreground">{item.description}</p>
      )}

      {item.content && <WikiMarkdown content={item.content} />}

      {(attrs.rarity ||
        attrs.howToObtain ||
        attrs.stackable !== undefined ||
        (attrs.effects ?? []).length > 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Properties</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {attrs.rarity && (
              <>
                <dt className="text-muted-foreground">Rarity</dt>
                <dd className={`font-medium capitalize ${rarityColor ?? ''}`}>{attrs.rarity}</dd>
              </>
            )}
            {attrs.howToObtain && (
              <>
                <dt className="text-muted-foreground">How to Obtain</dt>
                <dd className="font-medium text-foreground">{attrs.howToObtain}</dd>
              </>
            )}
            {attrs.stackable !== undefined && (
              <>
                <dt className="text-muted-foreground">Stackable</dt>
                <dd className="font-medium text-foreground">{attrs.stackable ? 'Yes' : 'No'}</dd>
              </>
            )}
            {(attrs.effects ?? []).length > 0 && (
              <>
                <dt className="text-muted-foreground">Effects</dt>
                <dd className="font-medium text-foreground">{attrs.effects!.join(', ')}</dd>
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
        <Link href={`/${gameSlug}/items`} className="transition-colors hover:text-primary">
          Items
        </Link>{' '}
        / {item.name}
      </p>

      {item.imageUrl && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-6 text-3xl font-semibold text-foreground">{item.name}</h1>

      {item.spoilerLevel > 0 ? (
        <SpoilerBlock level={item.spoilerLevel} label={item.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </main>
  )
}
