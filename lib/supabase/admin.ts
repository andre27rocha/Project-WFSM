import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

/**
 * Admin Supabase client — uses the service role key, bypasses RLS.
 * SERVER ONLY. Never import this from client components or expose it to the browser.
 * Use for: admin CRUD operations, migrations, and data that ignores row-level security.
 */
export function createAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
