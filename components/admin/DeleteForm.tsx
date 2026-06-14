'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteFormProps {
  id: string
  deleteAction: (id: string) => Promise<{ error: string } | null>
  redirectPath: string
}

export function DeleteForm({ id, deleteAction, redirectPath }: DeleteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this item? This action cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteAction(id)
      if (!result?.error) {
        router.push(redirectPath)
        router.refresh()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
