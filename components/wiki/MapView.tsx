'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type MapArea = {
  id: string
  name: string
  slug: string
  mapX: number | null
  mapY: number | null
}

interface MapViewProps {
  areas: MapArea[]
  gameSlug: string
  mapImageUrl?: string | null
}

export function MapView({ areas, gameSlug, mapImageUrl }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !containerRef.current) return

      // CRS.Simple: no tiles, image-based map. Bounds = [0,0] to [100,100]
      const map = L.map(containerRef.current, {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.5,
        attributionControl: false,
      })

      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [100, 100],
      ]

      if (mapImageUrl) {
        L.imageOverlay(mapImageUrl, bounds).addTo(map)
      }

      map.fitBounds(bounds)

      const pinnable = areas.filter(
        (a): a is MapArea & { mapX: number; mapY: number } =>
          a.mapX !== null && a.mapY !== null,
      )

      for (const area of pinnable) {
        // Leaflet lat/lng: lat = 100-mapY (flip Y), lng = mapX
        const lat = 100 - area.mapY
        const lng = area.mapX

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: '#EF9F27',
          fillColor: '#EF9F27',
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map)

        marker.bindTooltip(area.name, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'leaflet-area-tooltip',
        })

        marker.on('click', () => {
          router.push(`/${gameSlug}/areas/${area.slug}`)
        })
      }

      return map
    }

    const mapPromise = initMap()

    return () => {
      cancelled = true
      mapPromise.then((map) => {
        map?.remove()
      }).catch(() => {})
    }
  }, [areas, gameSlug, mapImageUrl, router])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="Interactive world map"
    />
  )
}
