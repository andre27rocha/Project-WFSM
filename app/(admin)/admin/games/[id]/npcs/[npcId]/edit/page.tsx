import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getNpcById } from '@/lib/supabase/queries/npcs'
import { getAllAreasByGame } from '@/lib/supabase/queries/areas'
import { updateNpcAction } from '../../actions'
import { NpcForm } from '@/components/admin/NpcForm'
import type { NpcFormData } from '@/lib/admin/schemas'

interface Props {
  params: Promise<{ id: string; npcId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { npcId } = await params
  const npc = await getNpcById(npcId)
  return { title: npc ? `Edit ${npc.name}` : 'Edit NPC' }
}

export default async function EditNpcPage({ params }: Props) {
  const { id, npcId } = await params
  const [npc, areas] = await Promise.all([getNpcById(npcId), getAllAreasByGame(id)])
  if (!npc) notFound()

  const attrs = npc.attributes

  const defaultValues: Partial<NpcFormData> = {
    name: npc.name,
    slug: npc.slug,
    areaId: npc.areaId ?? '',
    description: npc.description ?? '',
    content: npc.content ?? '',
    imageUrl: npc.imageUrl ?? '',
    spoilerLevel: npc.spoilerLevel,
    isPublished: npc.isPublished,
    attrRole: attrs.role ?? '',
    attrQuestRelated: attrs.questRelated ?? false,
    attrServices: (attrs.services ?? []).join(', '),
    attrDialogueHints: (attrs.dialogueHints ?? []).join(', '),
  }

  const boundAction = updateNpcAction.bind(null, npcId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit: {npc.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <NpcForm
          action={boundAction}
          defaultValues={defaultValues}
          areas={areas.map((a) => ({ id: a.id, name: a.name }))}
          cancelHref={`/admin/games/${id}/npcs`}
        />
      </div>
    </div>
  )
}
