import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { getPublishedAchievementsByGame } from '@/lib/supabase/queries/achievements'
import { AchievementTracker } from '@/components/wiki/AchievementTracker'
import { WikiBreadcrumb } from '@/components/wiki/WikiBreadcrumb'

interface Props {
  params: Promise<{ game: string }>
  searchParams: Promise<{ done?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)
  if (!game) return {}
  return {
    title: `100% Guide – ${game.name}`,
    description: `Track your progress towards 100% completion in ${game.name}. Check off achievements as you go and share your progress with a link.`,
    alternates: { canonical: `${siteConfig.url}/${gameSlug}/guide/100` },
  }
}

export default async function HundredPercentGuidePage({ params, searchParams }: Props) {
  const { game: gameSlug } = await params
  const { done } = await searchParams

  const game = await getGameBySlug(gameSlug)
  if (!game || !game.isPublished) notFound()
  if (!game.gameConfig.achievements) notFound()

  const achievements = await getPublishedAchievementsByGame(game.id)

  // IDs from the URL ?done= param seed the initial client-side state.
  const initialCompleted = done ? done.split(',').filter(Boolean) : []

  return (
    <div className="px-6 py-5">
      <WikiBreadcrumb
        crumbs={[{ label: game.name, href: `/${gameSlug}` }, { label: '100% Guide' }]}
      />
      <h1 className="mb-1 border-b border-primary/40 pb-1 text-xl font-bold text-foreground">
        100% Guide
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Check off achievements as you complete them. Progress is saved in your browser — use{' '}
        <strong className="text-foreground/80">Copy progress link</strong> to share or back it up.
      </p>

      {achievements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No achievements listed yet.</p>
      ) : (
        <AchievementTracker
          achievements={achievements}
          gameSlug={gameSlug}
          initialCompleted={initialCompleted}
        />
      )}
    </div>
  )
}
