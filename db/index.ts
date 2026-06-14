import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { env } from '@/config/env'

// Reuse the connection in development to survive Next.js hot-reloads.
// In production each serverless invocation gets a fresh connection.
declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined
}

const client =
  globalThis.__pgClient ??
  postgres(env.DATABASE_URL, {
    max: 1, // Transaction-mode pooler: one connection per request
    prepare: false, // Required for Supabase Transaction pooler
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgClient = client
}

export const db = drizzle(client, { schema })
