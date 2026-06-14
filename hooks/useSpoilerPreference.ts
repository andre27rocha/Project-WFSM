'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'vc_spoiler_level'

/**
 * Persists the highest spoiler level the user has chosen to reveal.
 * Starts at 0 (hidden) on every page load; updates after user action.
 */
export function useSpoilerPreference() {
  const [threshold, setThreshold] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) setThreshold(parsed)
    }
  }, [])

  const revealUpTo = useCallback((level: number) => {
    setThreshold((prev) => {
      const next = Math.max(prev, level)
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const resetSpoilers = useCallback(() => {
    setThreshold(0)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { threshold, revealUpTo, resetSpoilers }
}
