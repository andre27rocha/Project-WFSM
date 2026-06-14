import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { comments } from '@/db/schema'
import type { Comment } from '@/types'

export async function getApprovedComments(
  gameId: string,
  entityType: string,
  entityId: string
): Promise<Comment[]> {
  try {
    return await db.query.comments.findMany({
      where: and(
        eq(comments.gameId, gameId),
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId),
        eq(comments.isApproved, true),
        isNull(comments.parentId)
      ),
      with: { replies: true },
      orderBy: (c, { asc }) => [asc(c.createdAt)],
    })
  } catch (error) {
    console.error('[getApprovedComments]', error)
    throw new Error('Failed to fetch comments')
  }
}
