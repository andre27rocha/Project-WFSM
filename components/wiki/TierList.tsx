'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { TIER_LEVELS, encodeUrlTierState, getDefaultTierState } from '@/lib/utils/tierlist'
import { TierListTier } from './TierListTier'
import { TierListItemCard } from './TierListItem'
import type { TierLevel, TierListState, TierListItem } from '@/types'

interface Props {
  items: TierListItem[]
  initialState: TierListState
  isGlobal: boolean
}

export function TierList({ items, initialState, isGlobal }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<TierListState>(initialState)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // PointerSensor: 8px threshold prevents accidental drag on click.
  // TouchSensor: 250ms hold delay for mobile, 5px tolerance for scroll.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const itemsById = Object.fromEntries(items.map((i) => [i.id, i] as [string, TierListItem]))
  const activeItem = activeId !== null ? (itemsById[activeId] ?? null) : null

  const updateState = useCallback(
    (newState: TierListState) => {
      setState(newState)
      const encoded = encodeUrlTierState(newState)
      router.replace(`${pathname}?tier=${encoded}`, { scroll: false })
    },
    [router, pathname],
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const itemId = active.id as string
    const rawTarget = String(over.id)

    if (!(TIER_LEVELS as string[]).includes(rawTarget)) return
    const targetTier = rawTarget as TierLevel

    const next = { ...state }
    for (const tier of TIER_LEVELS) {
      next[tier] = next[tier].filter((id) => id !== itemId)
    }
    next[targetTier] = [...next[targetTier], itemId]

    updateState(next)
  }

  function handleReset() {
    updateState(getDefaultTierState(items))
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }

  const tierItems: Record<TierLevel, TierListItem[]> = { S: [], A: [], B: [], C: [], D: [] }
  for (const tier of TIER_LEVELS) {
    for (const id of state[tier]) {
      const item = itemsById[id]
      if (item) tierItems[tier].push(item)
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No items available for this tier list yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-1.5">
          {TIER_LEVELS.map((tier) => (
            <TierListTier key={tier} tier={tier} items={tierItems[tier]} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? <TierListItemCard item={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <div className="flex items-center gap-2 border-t border-wiki-border pt-3">
        <button
          onClick={handleCopyLink}
          className="rounded border border-wiki-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleReset}
          className="rounded border border-wiki-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
        >
          Reset
        </button>
        {isGlobal && (
          <span className="ml-auto text-xs text-muted-foreground">
            Ranking all games on VaniaCodex
          </span>
        )}
      </div>
    </div>
  )
}
