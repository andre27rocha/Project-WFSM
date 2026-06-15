import { getGameBySlug } from '@/lib/supabase/queries/games'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'

interface Props {
  children: React.ReactNode
  params: Promise<{ game: string }>
}

export default async function GameLayout({ children, params }: Props) {
  const { game: gameSlug } = await params
  const game = await getGameBySlug(gameSlug)

  if (!game) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <WikiSidebar game={game} gameSlug={gameSlug} />
      <div className="min-w-0 flex-1 bg-wiki-content">{children}</div>
    </div>
  )
}
