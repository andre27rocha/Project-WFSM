'use server'

import { deleteComment } from '@/lib/supabase/queries/comments'

export async function deleteCommentAction(id: string): Promise<{ error: string } | null> {
  try {
    await deleteComment(id)
    return null
  } catch {
    return { error: 'Failed to delete comment' }
  }
}
