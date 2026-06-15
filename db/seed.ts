import { config } from 'dotenv'

// Must be first — loads DATABASE_URL before drizzle/postgres are initialised
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set in .env.local')

const client = postgres(url, { max: 1, prepare: false })
const db = drizzle(client, { schema })

async function main() {
  console.warn('Seeding Ender Lilies…')

  await db
    .insert(schema.games)
    .values({
      name: 'Ender Lilies: Quietus of the Knights',
      slug: 'ender-lilies',
      description:
        'A dark fantasy action-RPG set in the rain-soaked kingdom of End. ' +
        'Play as Lily, a young girl awakened amid ruins, and uncover the tragedy ' +
        'that befell the land by purifying fallen knights and wielding their spirits in battle.',
      developer: 'Binary Haze Interactive',
      releaseYear: 2021,
      gameConfig: {
        bosses: true,
        npcs: true,
        areas: true,
        relics: true,
        spirits: true,
        tierlist: true,
      },
      isPublished: true,
    })
    .onConflictDoNothing()

  console.warn('✓ Ender Lilies seeded (or already existed)')
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
