import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllGames } from '@/lib/supabase/queries/games'
import { deleteGameAction } from './actions'
import { DeleteForm } from '@/components/admin/DeleteForm'

export const metadata: Metadata = { title: 'Games' }

export default async function AdminGamesPage() {
  const allGames = await getAllGames()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Games</h1>
        <Link
          href="/admin/games/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add Game
        </Link>
      </div>

      {allGames.length === 0 ? (
        <p className="text-muted-foreground">No games yet. Add your first one.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allGames.map((game) => (
                <tr key={game.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <Link
                      href={`/admin/games/${game.id}`}
                      className="transition-colors hover:text-primary"
                    >
                      {game.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {game.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        game.isPublished
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {game.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/games/${game.id}/edit`}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <DeleteForm
                        id={game.id}
                        deleteAction={deleteGameAction}
                        redirectPath="/admin/games"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
