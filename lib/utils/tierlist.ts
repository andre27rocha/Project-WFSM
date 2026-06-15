import type { TierLevel, TierListState, TierListItem } from '@/types'

export const TIER_LEVELS: TierLevel[] = ['S', 'A', 'B', 'C', 'D']

function isTierLevel(s: string): s is TierLevel {
  return (TIER_LEVELS as string[]).includes(s)
}

/**
 * Encodes tier state to a URL-safe string.
 * Format: "S:id1,id2|A:id3|B:|C:|D:"
 */
export function encodeUrlTierState(state: TierListState): string {
  return TIER_LEVELS.map((tier) => `${tier}:${state[tier].join(',')}`).join('|')
}

/**
 * Decodes a URL string back to TierListState.
 * Unknown tiers and malformed segments are silently ignored.
 */
export function decodeUrlTierState(encoded: string): TierListState {
  const state: TierListState = { S: [], A: [], B: [], C: [], D: [] }
  if (!encoded) return state

  for (const segment of encoded.split('|')) {
    const colonIdx = segment.indexOf(':')
    if (colonIdx === -1) continue
    const tierKey = segment.slice(0, colonIdx)
    const idsStr = segment.slice(colonIdx + 1)
    if (isTierLevel(tierKey)) {
      state[tierKey] = idsStr ? idsStr.split(',').filter(Boolean) : []
    }
  }

  return state
}

/**
 * Default state: distributes items equally across all tiers.
 * Item at index 0 → S, 1 → A, 2 → B, 3 → C, 4 → D, 5 → S, ...
 */
export function getDefaultTierState(allItems: TierListItem[]): TierListState {
  const state: TierListState = { S: [], A: [], B: [], C: [], D: [] }
  allItems.forEach((item, i) => {
    const tier = TIER_LEVELS[i % TIER_LEVELS.length]
    state[tier].push(item.id)
  })
  return state
}
