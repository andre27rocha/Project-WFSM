'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { itemSchema, type ItemFormData } from '@/lib/admin/schemas'
import { MarkdownEditor } from './MarkdownEditor'
import { slugify } from '@/lib/utils/slugify'

type ActionResult = { error: string } | null

interface ItemFormProps {
  action: (data: ItemFormData) => Promise<ActionResult>
  defaultValues?: Partial<ItemFormData>
  itemTypes: { id: string; name: string }[]
  cancelHref: string
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'block text-sm font-medium text-foreground mb-1'
const errorCls = 'mt-1 text-xs text-destructive'

const RARITIES = ['', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as const

export function ItemForm({ action, defaultValues, itemTypes, cancelHref }: ItemFormProps) {
  const isEditing = Boolean(defaultValues?.slug)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      slug: '',
      itemTypeId: '',
      description: '',
      content: '',
      imageUrl: '',
      spoilerLevel: 0,
      isPublished: false,
      attrRarity: '',
      attrHowToObtain: '',
      attrStackable: false,
      attrEffects: '',
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
          <label className={labelCls} htmlFor="item-name">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="item-name"
            className={inputCls}
            placeholder="Umbral Flower"
            {...register('name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) setValue('slug', slugify(e.target.value))
              },
            })}
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="item-slug">
            Slug <span className="text-destructive">*</span>
          </label>
          <input id="item-slug" className={inputCls} placeholder="umbral-flower" {...register('slug')} />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="item-typeId">
            Item Type
          </label>
          <select id="item-typeId" className={inputCls} {...register('itemTypeId')}>
            <option value="">— None —</option>
            {itemTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="item-imageUrl">
            Image URL
          </label>
          <input id="item-imageUrl" className={inputCls} placeholder="https://…" {...register('imageUrl')} />
        </div>

        <div>
          <label className={labelCls} htmlFor="item-spoilerLevel">
            Spoiler Level (0–5)
          </label>
          <input id="item-spoilerLevel" type="number" min={0} max={5} className={inputCls} {...register('spoilerLevel', { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="item-description">
          Description
        </label>
        <textarea id="item-description" rows={2} className={inputCls + ' resize-none'} {...register('description')} />
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="item-rarity">Rarity</label>
            <select id="item-rarity" className={inputCls} {...register('attrRarity')}>
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r ? r.charAt(0).toUpperCase() + r.slice(1) : '— None —'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="item-obtain">How to Obtain</label>
            <input id="item-obtain" className={inputCls} placeholder="Dropped by…" {...register('attrHowToObtain')} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="item-effects">Effects (comma-separated)</label>
            <input id="item-effects" className={inputCls} placeholder="+10 HP, +5 ATK" {...register('attrEffects')} />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-primary" {...register('attrStackable')} />
              <span className="text-sm text-foreground">Stackable</span>
            </label>
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
          {isSubmitting ? 'Saving…' : isEditing ? 'Update Item' : 'Create Item'}
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
