'use client'

import { useDroppable } from '@dnd-kit/core'
import type { TierLevel, TierListItem } from '@/types'
import { TierListItemCard } from './TierListItem'

const TIER_ROW_STYLE: Record<TierLevel, string> = {
  S: 'border-red-500/30 bg-red-500/5',
  A: 'border-orange-500/30 bg-orange-500/5',
  B: 'border-yellow-500/30 bg-yellow-500/5',
  C: 'border-blue-500/30 bg-blue-500/5',
  D: 'border-purple-500/30 bg-purple-500/5',
}

const TIER_LABEL_STYLE: Record<TierLevel, string> = {
  S: 'bg-red-500 text-white',
  A: 'bg-orange-500 text-white',
  B: 'bg-yellow-500 text-black',
  C: 'bg-blue-500 text-white',
  D: 'bg-purple-500 text-white',
}

interface Props {
  tier: TierLevel
  items: TierListItem[]
}

export function TierListTier({ tier, items }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div
      className={`flex min-h-[80px] overflow-hidden rounded border transition-all ${TIER_ROW_STYLE[tier]} ${
        isOver ? 'ring-2 ring-primary/70 ring-offset-1 ring-offset-background' : ''
      }`}
    >
      <div
        className={`flex w-14 shrink-0 items-center justify-center text-2xl font-black ${TIER_LABEL_STYLE[tier]}`}
        aria-label={`Tier ${tier}`}
      >
        {tier}
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-wrap gap-2 p-2"
      >
        {items.map((item) => (
          <TierListItemCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <span className="flex items-center self-center px-2 text-xs italic text-muted-foreground/40">
            Drop here
          </span>
        )}
      </div>
    </div>
  )
}
