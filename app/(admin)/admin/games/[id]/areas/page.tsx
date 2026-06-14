import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { getAllAreasByGame } from '@/lib/supabase/queries/areas'
import { deleteAreaAction } from './actions'
import { DeleteForm } from '@/components/admin/DeleteForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `Areas – ${game.name}` : 'Areas' }
}

export default async function AdminAreasPage({ params }: Props) {
  const { id } = await params
  const [game, allAreas] = await Promise.all([getGameById(id), getAllAreasByGame(id)])
  if (!game) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/games" className="transition-colors hover:text-primary">
              Games
            </Link>{' '}
            /{' '}
            <Link
              href={`/admin/games/${id}`}
              className="transition-colors hover:text-primary"
            >
              {game.name}
            </Link>{' '}
            / Areas
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">Areas</h1>
        </div>
        <Link
          href={`/admin/games/${id}/areas/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add Area
        </Link>
      </div>

      {allAreas.length === 0 ? (
        <p className="text-muted-foreground">No areas yet.</p>
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
              {allAreas.map((area) => (
                <tr key={area.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{area.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {area.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        area.isPublished
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {area.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/games/${id}/areas/${area.id}/edit`}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <DeleteForm
                        id={area.id}
                        deleteAction={deleteAreaAction}
                        redirectPath={`/admin/games/${id}/areas`}
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
