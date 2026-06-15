import type { CSSProperties } from 'react'
import { getGameBySlug } from '@/lib/supabase/queries/games'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { GameNav } from '@/components/wiki/GameNav'

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

  const bgImageUrl = game.bannerImageUrl ?? game.coverImageUrl

  const bgStyle: CSSProperties = bgImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.73), rgba(0,0,0,0.73)), url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }
    : {
        backgroundImage:
          'linear-gradient(160deg, #0d0d20 0%, #1a0830 40%, #0a1020 70%, #150a28 100%)',
      }

  return (
    <div style={bgStyle} className="min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col">
        <GameNav game={game} gameSlug={gameSlug} />
        <div className="flex">
          <WikiSidebar game={game} gameSlug={gameSlug} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
