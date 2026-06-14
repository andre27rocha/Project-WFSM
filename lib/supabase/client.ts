'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client — uses the public anon key.
 * Safe to use in client components. Subject to RLS.
 * Call once and reuse (or memoize at the component level).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
