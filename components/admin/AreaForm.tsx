'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { areaSchema, type AreaFormData } from '@/lib/admin/schemas'
import { MarkdownEditor } from './MarkdownEditor'
import { slugify } from '@/lib/utils/slugify'

type ActionResult = { error: string } | null

interface AreaFormProps {
  action: (data: AreaFormData) => Promise<ActionResult>
  defaultValues?: Partial<AreaFormData>
  cancelHref: string
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'block text-sm font-medium text-foreground mb-1'
const errorCls = 'mt-1 text-xs text-destructive'

export function AreaForm({ action, defaultValues, cancelHref }: AreaFormProps) {
  const isEditing = Boolean(defaultValues?.slug)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      content: '',
      imageUrl: '',
      mapImageUrl: '',
      spoilerLevel: 0,
      sortOrder: 0,
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
          <label className={labelCls} htmlFor="area-name">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="area-name"
            className={inputCls}
            placeholder="The White Parish"
            {...register('name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) setValue('slug', slugify(e.target.value))
              },
            })}
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="area-slug">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            id="area-slug"
            className={inputCls}
            placeholder="the-white-parish"
            {...register('slug')}
          />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="area-imageUrl">
            Image URL
          </label>
          <input
            id="area-imageUrl"
            className={inputCls}
            placeholder="https://…"
            {...register('imageUrl')}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="area-mapImageUrl">
            Map Image URL
          </label>
          <input
            id="area-mapImageUrl"
            className={inputCls}
            placeholder="https://…"
            {...register('mapImageUrl')}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="area-spoilerLevel">
            Spoiler Level (0–5)
          </label>
          <input
            id="area-spoilerLevel"
            type="number"
            min={0}
            max={5}
            className={inputCls}
            {...register('spoilerLevel', { valueAsNumber: true })}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="area-sortOrder">
            Sort Order
          </label>
          <input
            id="area-sortOrder"
            type="number"
            min={0}
            className={inputCls}
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="area-description">
          Description
        </label>
        <textarea
          id="area-description"
          rows={2}
          className={inputCls + ' resize-none'}
          {...register('description')}
        />
      </div>

      <div>
        <p className={labelCls}>Content (Markdown)</p>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MarkdownEditor value={field.value} onChange={field.onChange} />
          )}
        />
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
          {isSubmitting ? 'Saving…' : isEditing ? 'Update Area' : 'Create Area'}
        </button>
        <a
          href={cancelHref}
          className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
