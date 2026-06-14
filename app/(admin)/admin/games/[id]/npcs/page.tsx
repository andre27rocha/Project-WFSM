import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getGameById } from '@/lib/supabase/queries/games'
import { getAllNpcsByGame } from '@/lib/supabase/queries/npcs'
import { deleteNpcAction } from './actions'
import { DeleteForm } from '@/components/admin/DeleteForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  return { title: game ? `NPCs – ${game.name}` : 'NPCs' }
}

export default async function AdminNpcsPage({ params }: Props) {
  const { id } = await params
  const [game, allNpcs] = await Promise.all([getGameById(id), getAllNpcsByGame(id)])
  if (!game) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/games" className="transition-colors hover:text-primary">Games</Link>{' '}
            /{' '}
            <Link href={`/admin/games/${id}`} className="transition-colors hover:text-primary">{game.name}</Link>{' '}
            / NPCs
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">NPCs</h1>
        </div>
        <Link
          href={`/admin/games/${id}/npcs/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add NPC
        </Link>
      </div>

      {allNpcs.length === 0 ? (
        <p className="text-muted-foreground">No NPCs yet.</p>
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
              {allNpcs.map((npc) => (
                <tr key={npc.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{npc.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{npc.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${npc.isPublished ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {npc.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/games/${id}/npcs/${npc.id}/edit`} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                        Edit
                      </Link>
                      <DeleteForm id={npc.id} deleteAction={deleteNpcAction} redirectPath={`/admin/games/${id}/npcs`} />
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
