import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getAreaBySlug } from '@/lib/supabase/queries/areas'
import { SpoilerBlock } from '@/components/wiki/SpoilerBlock'
import { WikiMarkdown } from '@/components/wiki/WikiMarkdown'

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
    openGraph: {
      title: area.name,
      description: area.description?.slice(0, 155) ?? '',
      images: area.imageUrl ? [{ url: area.imageUrl }] : [],
    },
  }
}

export default async function AreaPage({ params }: Props) {
  const { game: gameSlug, slug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()

  const area = await getAreaBySlug(game.id, slug)
  if (!area || !area.isPublished) notFound()

  const details = (
    <div className="space-y-8">
      {area.description && (
        <p className="text-lg leading-relaxed text-muted-foreground">{area.description}</p>
      )}

      {area.content && <WikiMarkdown content={area.content} />}

      {area.mapImageUrl && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Map</h2>
          <div className="relative w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={area.mapImageUrl}
              alt={`${area.name} map`}
              width={1200}
              height={800}
              className="h-auto w-full"
            />
          </div>
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
        <Link href={`/${gameSlug}/areas`} className="transition-colors hover:text-primary">
          Areas
        </Link>{' '}
        / {area.name}
      </p>

      {area.imageUrl && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl">
          <Image src={area.imageUrl} alt={area.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-6 text-3xl font-semibold text-foreground">{area.name}</h1>

      {area.spoilerLevel > 0 ? (
        <SpoilerBlock level={area.spoilerLevel} label={area.name}>
          {details}
        </SpoilerBlock>
      ) : (
        details
      )}
    </main>
  )
}
