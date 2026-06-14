import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/config/env'

/**
 * Server Supabase client — reads auth cookies from the incoming request.
 * Use in Server Components, Route Handlers, and Server Actions.
 * Subject to RLS based on the authenticated user's session.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll is called from a Server Component — cookies are read-only there.
          // The middleware will handle session refresh instead.
        }
      },
    },
  })
}
