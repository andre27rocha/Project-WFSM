import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getItemById, getAllItemTypesByGame } from '@/lib/supabase/queries/items'
import { updateItemAction } from '../../actions'
import { ItemForm } from '@/components/admin/ItemForm'
import type { ItemFormData } from '@/lib/admin/schemas'

interface Props {
  params: Promise<{ id: string; itemId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemId } = await params
  const item = await getItemById(itemId)
  return { title: item ? `Edit ${item.name}` : 'Edit Item' }
}

export default async function EditItemPage({ params }: Props) {
  const { id, itemId } = await params
  const [item, itemTypes] = await Promise.all([getItemById(itemId), getAllItemTypesByGame(id)])
  if (!item) notFound()

  const attrs = item.attributes

  const defaultValues: Partial<ItemFormData> = {
    name: item.name,
    slug: item.slug,
    itemTypeId: item.itemTypeId ?? '',
    description: item.description ?? '',
    content: item.content ?? '',
    imageUrl: item.imageUrl ?? '',
    spoilerLevel: item.spoilerLevel,
    isPublished: item.isPublished,
    attrRarity: attrs.rarity ?? '',
    attrHowToObtain: attrs.howToObtain ?? '',
    attrStackable: attrs.stackable ?? false,
    attrEffects: (attrs.effects ?? []).join(', '),
  }

  const boundAction = updateItemAction.bind(null, itemId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit: {item.name}</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <ItemForm
          action={boundAction}
          defaultValues={defaultValues}
          itemTypes={itemTypes.map((t) => ({ id: t.id, name: t.name }))}
          cancelHref={`/admin/games/${id}/items`}
        />
      </div>
    </div>
  )
}
