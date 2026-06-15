import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import { comments } from '@/db/schema'
import type { Comment, NewComment } from '@/types'

export async function getCommentsByEntity(
  gameId: string,
  entityType: string,
  entityId: string,
): Promise<Comment[]> {
  try {
    return await db.query.comments.findMany({
      where: and(
        eq(comments.gameId, gameId),
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId),
        eq(comments.isApproved, true),
        isNull(comments.parentId),
      ),
      orderBy: [desc(comments.upvotes), desc(comments.createdAt)],
    })
  } catch (error) {
    console.error('[getCommentsByEntity]', error)
    throw new Error('Failed to fetch comments')
  }
}

export async function getAllComments(): Promise<Comment[]> {
  try {
    return await db.query.comments.findMany({
      orderBy: [desc(comments.createdAt)],
    })
  } catch (error) {
    console.error('[getAllComments]', error)
    throw new Error('Failed to fetch comments')
  }
}

export async function createComment(data: NewComment): Promise<Comment> {
  try {
    const [result] = await db.insert(comments).values(data).returning()
    if (!result) throw new Error('No result returned from insert')
    return result
  } catch (error) {
    console.error('[createComment]', error)
    throw new Error('Failed to create comment')
  }
}

export async function upvoteComment(id: string): Promise<void> {
  try {
    await db
      .update(comments)
      .set({ upvotes: sql`${comments.upvotes} + 1` })
      .where(eq(comments.id, id))
  } catch (error) {
    console.error('[upvoteComment]', error)
    throw new Error('Failed to upvote comment')
  }
}

export async function deleteComment(id: string): Promise<void> {
  try {
    await db.delete(comments).where(eq(comments.id, id))
  } catch (error) {
    console.error('[deleteComment]', error)
    throw new Error('Failed to delete comment')
  }
}
