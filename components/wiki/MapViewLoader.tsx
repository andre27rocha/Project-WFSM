'use client'

import dynamic from 'next/dynamic'

type MapArea = {
  id: string
  name: string
  slug: string
  mapX: number | null
  mapY: number | null
}

interface MapViewLoaderProps {
  areas: MapArea[]
  gameSlug: string
  mapImageUrl?: string | null
}

const MapView = dynamic(
  () => import('@/components/wiki/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
)

export function MapViewLoader({ areas, gameSlug, mapImageUrl }: MapViewLoaderProps) {
  return <MapView areas={areas} gameSlug={gameSlug} mapImageUrl={mapImageUrl} />
}
