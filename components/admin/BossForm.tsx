'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bossSchema, type BossFormData } from '@/lib/admin/schemas'
import { MarkdownEditor } from './MarkdownEditor'
import { slugify } from '@/lib/utils/slugify'

type ActionResult = { error: string } | null

interface BossFormProps {
  action: (data: BossFormData) => Promise<ActionResult>
  defaultValues?: Partial<BossFormData>
  areas: { id: string; name: string }[]
  cancelHref: string
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'block text-sm font-medium text-foreground mb-1'
const errorCls = 'mt-1 text-xs text-destructive'

export function BossForm({ action, defaultValues, areas, cancelHref }: BossFormProps) {
  const isEditing = Boolean(defaultValues?.slug)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BossFormData>({
    resolver: zodResolver(bossSchema),
    defaultValues: {
      name: '',
      slug: '',
      areaId: '',
      description: '',
      content: '',
      imageUrl: '',
      spoilerLevel: 0,
      sortOrder: 0,
      isPublished: false,
      attrHp: '',
      attrPhases: '',
      attrLocation: '',
      attrRewards: '',
      attrWeaknesses: '',
      attrResistances: '',
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
          <label className={labelCls} htmlFor="boss-name">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="boss-name"
            className={inputCls}
            placeholder="The Witch of the Lake"
            {...register('name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) setValue('slug', slugify(e.target.value))
              },
            })}
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="boss-slug">
            Slug <span className="text-destructive">*</span>
          </label>
          <input id="boss-slug" className={inputCls} placeholder="witch-of-the-lake" {...register('slug')} />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="boss-areaId">
            Area
          </label>
          <select id="boss-areaId" className={inputCls} {...register('areaId')}>
            <option value="">— None —</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="boss-imageUrl">
            Image URL
          </label>
          <input id="boss-imageUrl" className={inputCls} placeholder="https://…" {...register('imageUrl')} />
        </div>

        <div>
          <label className={labelCls} htmlFor="boss-spoilerLevel">
            Spoiler Level (0–5)
          </label>
          <input id="boss-spoilerLevel" type="number" min={0} max={5} className={inputCls} {...register('spoilerLevel', { valueAsNumber: true })} />
        </div>

        <div>
          <label className={labelCls} htmlFor="boss-sortOrder">
            Sort Order
          </label>
          <input id="boss-sortOrder" type="number" min={0} className={inputCls} {...register('sortOrder', { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="boss-description">
          Description
        </label>
        <textarea id="boss-description" rows={2} className={inputCls + ' resize-none'} {...register('description')} />
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

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">Attributes</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="boss-hp">HP</label>
            <input id="boss-hp" type="number" min={0} className={inputCls} placeholder="1000" {...register('attrHp')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="boss-phases">Phases</label>
            <input id="boss-phases" type="number" min={1} className={inputCls} placeholder="2" {...register('attrPhases')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="boss-location">Location</label>
            <input id="boss-location" className={inputCls} placeholder="The White Parish" {...register('attrLocation')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="boss-rewards">Rewards (comma-separated)</label>
            <input id="boss-rewards" className={inputCls} placeholder="Soul, Relic A" {...register('attrRewards')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="boss-weaknesses">Weaknesses (comma-separated)</label>
            <input id="boss-weaknesses" className={inputCls} placeholder="Holy, Light" {...register('attrWeaknesses')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="boss-resistances">Resistances (comma-separated)</label>
            <input id="boss-resistances" className={inputCls} placeholder="Dark, Fire" {...register('attrResistances')} />
          </div>
        </div>
      </fieldset>

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
          {isSubmitting ? 'Saving…' : isEditing ? 'Update Boss' : 'Create Boss'}
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
