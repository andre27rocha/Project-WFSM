import type { Metadata } from 'next'
import { GameForm } from '@/components/admin/GameForm'
import { createGameAction } from '../actions'

export const metadata: Metadata = { title: 'New Game' }

export default function NewGamePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">New Game</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <GameForm action={createGameAction} />
      </div>
    </div>
  )
}
