import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAreaById } from '@/lib/supabase/queries/areas'
import { updateAreaAction } from '../../actions'
import { AreaForm } from '@/components/admin/AreaForm'
import type { AreaFormData } from '@/lib/admin/schemas'

interface Props {
  params: Promise<{ id: string; areaId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { areaId } = await params
  const area = await getAreaById(areaId)
  return { title: area ? `Edit ${area.name}` : 'Edit Area' }
}

export default async function EditAreaPage({ params }: Props) {
  const { id, areaId } = await params
  const area = await getAreaById(areaId)
  if (!area) notFound()

  const defaultValues: Partial<AreaFormData> = {
    name: area.name,
    slug: area.slug,
    description: area.description ?? '',
    content: area.content ?? '',
    imageUrl: area.imageUrl ?? '',
    mapImageUrl: area.mapImageUrl ?? '',
    spoilerLevel: area.spoilerLevel,
    sortOrder: area.sortOrder,
    isPublished: area.isPublished,
  }

  const boundAction = updateAreaAction.bind(null, areaId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit: {area.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <AreaForm
          action={boundAction}
          defaultValues={defaultValues}
          cancelHref={`/admin/games/${id}/areas`}
        />
      </div>
    </div>
  )
}
