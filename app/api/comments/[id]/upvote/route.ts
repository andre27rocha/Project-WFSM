import { NextResponse } from 'next/server'
import { upvoteComment } from '@/lib/supabase/queries/comments'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await upvoteComment(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to upvote', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }
}
