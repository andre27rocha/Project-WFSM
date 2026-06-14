import Link from 'next/link'
import { getAllGames } from '@/lib/supabase/queries/games'

export default async function AdminDashboardPage() {
  const allGames = await getAllGames()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to the VaniaCodex admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-3xl font-bold text-foreground">{allGames.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {allGames.length === 1 ? 'Game' : 'Games'}
          </p>
          <Link
            href="/admin/games"
            className="mt-4 inline-block text-xs text-primary transition-opacity hover:opacity-80"
          >
            Manage Games →
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-3xl font-bold text-foreground">
            {allGames.filter((g) => g.isPublished).length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Published</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-3xl font-bold text-foreground">
            {allGames.filter((g) => !g.isPublished).length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Drafts</p>
        </div>
      </div>

      {allGames.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No games yet.</p>
          <Link
            href="/admin/games/new"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add your first game
          </Link>
        </div>
      )}
    </div>
  )
}
