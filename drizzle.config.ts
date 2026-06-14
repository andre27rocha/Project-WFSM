import type { Config } from 'drizzle-kit'

// drizzle-kit reads .env.local automatically (same as Next.js)
const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local before running drizzle-kit.')
}

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
} satisfies Config
