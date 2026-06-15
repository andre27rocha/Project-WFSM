import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createComment } from '@/lib/supabase/queries/comments'

const createSchema = z.object({
  gameId: z.string().uuid(),
  entityType: z.enum(['boss', 'npc', 'item', 'area']),
  entityId: z.string().uuid(),
  authorName: z.string().max(100).optional(),
  content: z.string().min(5).max(2000),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    const { authorName, ...rest } = parsed.data
    await createComment({
      ...rest,
      authorName: authorName?.trim() || 'Anonymous',
      isApproved: true,
      parentId: null,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }
}
