'use client'

import Image from 'next/image'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { TierListItem } from '@/types'

interface Props {
  item: TierListItem
  isOverlay?: boolean
}

export function TierListItemCard({ item, isOverlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex w-[80px] flex-col items-center gap-1 rounded border p-1.5 text-center select-none transition-colors ${
        isOverlay
          ? 'border-primary bg-surface shadow-xl shadow-black/50 scale-105'
          : 'border-wiki-border bg-surface hover:border-primary/60'
      }`}
      title={item.name}
    >
      {item.imageUrl ? (
        <div className="relative h-12 w-12 overflow-hidden rounded">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-wiki-border text-xs text-muted-foreground">
          ?
        </div>
      )}
      <span className="line-clamp-2 w-full text-[10px] leading-tight text-foreground/90">
        {item.name}
      </span>
    </div>
  )
}
