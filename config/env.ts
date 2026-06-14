import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(12),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
})

const _parsed = envSchema.safeParse(process.env)

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(_parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables — check .env.local against .env.example')
}

export const env = _parsed.data
