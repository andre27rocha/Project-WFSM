import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { releaseCalendar } from '@/db/schema'
import type { ReleaseCalendar, NewReleaseCalendar } from '@/types'

type Filters = {
  platform?: string
  genre?: string
  status?: string
}

export async function getPublishedReleases(filters: Filters = {}): Promise<ReleaseCalendar[]> {
  try {
    const conditions = []

    if (filters.platform) {
      conditions.push(
        sql`${releaseCalendar.platforms} @> ${JSON.stringify([filters.platform])}::jsonb`
      )
    }
    if (filters.genre) {
      conditions.push(eq(releaseCalendar.genre, filters.genre))
    }
    if (filters.status) {
      conditions.push(eq(releaseCalendar.status, filters.status))
    }

    return await db
      .select()
      .from(releaseCalendar)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        // NULLs (date TBD) sort after known dates
        sql`COALESCE(${releaseCalendar.releaseDate}, '9999-12-31') ASC`,
        asc(releaseCalendar.name)
      )
  } catch (error) {
    console.error('[getPublishedReleases]', error)
    throw new Error('Failed to fetch release calendar')
  }
}

export async function getAllReleases(): Promise<ReleaseCalendar[]> {
  try {
    return await db
      .select()
      .from(releaseCalendar)
      .orderBy(
        sql`COALESCE(${releaseCalendar.releaseDate}, '9999-12-31') ASC`,
        asc(releaseCalendar.name)
      )
  } catch (error) {
    console.error('[getAllReleases]', error)
    throw new Error('Failed to fetch all releases')
  }
}

export async function createRelease(data: NewReleaseCalendar): Promise<ReleaseCalendar> {
  try {
    const [result] = await db.insert(releaseCalendar).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createRelease]', error)
    throw new Error('Failed to create release')
  }
}

export async function updateRelease(
  id: string,
  data: Partial<NewReleaseCalendar>
): Promise<ReleaseCalendar> {
  try {
    const [result] = await db
      .update(releaseCalendar)
      .set(data)
      .where(eq(releaseCalendar.id, id))
      .returning()
    if (!result) throw new Error('No result returned from update')
    return result
  } catch (error) {
    console.error('[updateRelease]', error)
    throw new Error('Failed to update release')
  }
}

export async function deleteRelease(id: string): Promise<void> {
  try {
    await db.delete(releaseCalendar).where(eq(releaseCalendar.id, id))
  } catch (error) {
    console.error('[deleteRelease]', error)
    throw new Error('Failed to delete release')
  }
}
