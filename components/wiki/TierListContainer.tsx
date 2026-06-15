import { getGameTierListItems, getGlobalTierListItems } from '@/lib/supabase/queries/tierlists'
import { decodeUrlTierState, getDefaultTierState } from '@/lib/utils/tierlist'
import { TierList } from '@/components/wiki/TierList'

interface Props {
  gameId?: string
  tierParam?: string
  isGlobal?: boolean
}

export async function TierListContainer({ gameId, tierParam, isGlobal = false }: Props) {
  const items = gameId ? await getGameTierListItems(gameId) : await getGlobalTierListItems()

  const initialState = tierParam ? decodeUrlTierState(tierParam) : getDefaultTierState(items)

  return <TierList items={items} initialState={initialState} isGlobal={isGlobal} />
}
