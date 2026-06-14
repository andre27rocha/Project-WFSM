'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { gameSchema, type GameFormData } from '@/lib/admin/schemas'
import { slugify } from '@/lib/utils/slugify'

type ActionResult = { error: string } | null

interface GameFormProps {
  action: (data: GameFormData) => Promise<ActionResult>
  defaultValues?: Partial<GameFormData>
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'block text-sm font-medium text-foreground mb-1'
const errorCls = 'mt-1 text-xs text-destructive'

const modules: { key: keyof GameFormData; label: string }[] = [
  { key: 'gameConfigBosses', label: 'Bosses' },
  { key: 'gameConfigNpcs', label: 'NPCs' },
  { key: 'gameConfigItems', label: 'Items' },
  { key: 'gameConfigAreas', label: 'Areas' },
  { key: 'gameConfigTierlist', label: 'Tier List' },
  { key: 'gameConfigRelics', label: 'Relics' },
]

export function GameForm({ action, defaultValues }: GameFormProps) {
  const isEditing = Boolean(defaultValues?.slug)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      coverImageUrl: '',
      bannerImageUrl: '',
      releaseYear: '',
      developer: '',
      gameConfigBosses: false,
      gameConfigNpcs: false,
      gameConfigItems: false,
      gameConfigAreas: false,
      gameConfigTierlist: false,
      gameConfigRelics: false,
      isPublished: false,
      ...defaultValues,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null)
    const result = await action(data)
    if (result?.error) setFormError(result.error)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            className={inputCls}
            placeholder="Ender Lilies: Quietus of the Knights"
            {...register('name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) {
                  setValue('slug', slugify(e.target.value), { shouldValidate: false })
                }
              },
            })}
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="slug">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            id="slug"
            className={inputCls}
            placeholder="ender-lilies"
            {...register('slug')}
          />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="developer">
            Developer
          </label>
          <input
            id="developer"
            className={inputCls}
            placeholder="Live Wire"
            {...register('developer')}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="releaseYear">
            Release Year
          </label>
          <input
            id="releaseYear"
            type="number"
            min={1900}
            max={2100}
            className={inputCls}
            placeholder="2021"
            {...register('releaseYear')}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="coverImageUrl">
            Cover Image URL
          </label>
          <input
            id="coverImageUrl"
            className={inputCls}
            placeholder="https://…"
            {...register('coverImageUrl')}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="bannerImageUrl">
            Banner Image URL
          </label>
          <input
            id="bannerImageUrl"
            className={inputCls}
            placeholder="https://…"
            {...register('bannerImageUrl')}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className={inputCls + ' resize-none'}
          placeholder="A short description of the game…"
          {...register('description')}
        />
      </div>

      <div>
        <p className={labelCls}>Active Modules</p>
        <div className="flex flex-wrap gap-4">
          {modules.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-primary" {...register(key)} />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" className="accent-primary" {...register('isPublished')} />
          <span className="text-sm font-medium text-foreground">Published</span>
        </label>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEditing ? 'Update Game' : 'Create Game'}
        </button>
        <Link
          href="/admin/games"
          className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
