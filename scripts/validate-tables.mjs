import { config } from 'dotenv'
config({ path: '.env.local' })

import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false })

const rows = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  ORDER BY table_name
`

const expected = [
  'areas', 'bosses', 'comments', 'games',
  'item_types', 'items', 'npcs', 'releases', 'tier_list_entries',
]

console.log('\nTables in Supabase public schema:')
const found = rows.map(r => r.table_name)
let allGood = true

for (const name of expected) {
  const ok = found.includes(name)
  console.log(` ${ok ? '✓' : '✗'} ${name}`)
  if (!ok) allGood = false
}

const extra = found.filter(n => !expected.includes(n))
if (extra.length) console.log('\nExtra tables (not from schema):', extra)

await sql.end()
process.exit(allGood ? 0 : 1)
