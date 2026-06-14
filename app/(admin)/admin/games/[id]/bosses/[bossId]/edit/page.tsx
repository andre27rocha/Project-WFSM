import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBossById } from '@/lib/supabase/queries/bosses'
import { getAllAreasByGame } from '@/lib/supabase/queries/areas'
import { updateBossAction } from '../../actions'
import { BossForm } from '@/components/admin/BossForm'
import type { BossFormData } from '@/lib/admin/schemas'

interface Props {
  params: Promise<{ id: string; bossId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bossId } = await params
  const boss = await getBossById(bossId)
  return { title: boss ? `Edit ${boss.name}` : 'Edit Boss' }
}

export default async function EditBossPage({ params }: Props) {
  const { id, bossId } = await params
  const [boss, areas] = await Promise.all([getBossById(bossId), getAllAreasByGame(id)])
  if (!boss) notFound()

  const attrs = boss.attributes

  const defaultValues: Partial<BossFormData> = {
    name: boss.name,
    slug: boss.slug,
    areaId: boss.areaId ?? '',
    description: boss.description ?? '',
    content: boss.content ?? '',
    imageUrl: boss.imageUrl ?? '',
    spoilerLevel: boss.spoilerLevel,
    sortOrder: boss.sortOrder,
    isPublished: boss.isPublished,
    attrHp: attrs.hp?.toString() ?? '',
    attrPhases: attrs.phases?.toString() ?? '',
    attrLocation: attrs.location ?? '',
    attrRewards: (attrs.rewards ?? []).join(', '),
    attrWeaknesses: (attrs.weaknesses ?? []).join(', '),
    attrResistances: (attrs.resistances ?? []).join(', '),
  }

  const boundAction = updateBossAction.bind(null, bossId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit: {boss.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <BossForm
          action={boundAction}
          defaultValues={defaultValues}
          areas={areas.map((a) => ({ id: a.id, name: a.name }))}
          cancelHref={`/admin/games/${id}/bosses`}
        />
      </div>
    </div>
  )
}
