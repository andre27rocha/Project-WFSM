'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { npcSchema, type NpcFormData } from '@/lib/admin/schemas'
import { MarkdownEditor } from './MarkdownEditor'
import { slugify } from '@/lib/utils/slugify'

type ActionResult = { error: string } | null

interface NpcFormProps {
  action: (data: NpcFormData) => Promise<ActionResult>
  defaultValues?: Partial<NpcFormData>
  areas: { id: string; name: string }[]
  cancelHref: string
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'block text-sm font-medium text-foreground mb-1'
const errorCls = 'mt-1 text-xs text-destructive'

export function NpcForm({ action, defaultValues, areas, cancelHref }: NpcFormProps) {
  const isEditing = Boolean(defaultValues?.slug)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NpcFormData>({
    resolver: zodResolver(npcSchema),
    defaultValues: {
      name: '',
      slug: '',
      areaId: '',
      description: '',
      content: '',
      imageUrl: '',
      spoilerLevel: 0,
      isPublished: false,
      attrRole: '',
      attrQuestRelated: false,
      attrServices: '',
      attrDialogueHints: '',
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
          <label className={labelCls} htmlFor="npc-name">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="npc-name"
            className={inputCls}
            placeholder="Jules the Trader"
            {...register('name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) setValue('slug', slugify(e.target.value))
              },
            })}
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="npc-slug">
            Slug <span className="text-destructive">*</span>
          </label>
          <input id="npc-slug" className={inputCls} placeholder="jules-the-trader" {...register('slug')} />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelCls} htmlFor="npc-areaId">
            Area
          </label>
          <select id="npc-areaId" className={inputCls} {...register('areaId')}>
            <option value="">— None —</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="npc-imageUrl">
            Image URL
          </label>
          <input id="npc-imageUrl" className={inputCls} placeholder="https://…" {...register('imageUrl')} />
        </div>

        <div>
          <label className={labelCls} htmlFor="npc-spoilerLevel">
            Spoiler Level (0–5)
          </label>
          <input id="npc-spoilerLevel" type="number" min={0} max={5} className={inputCls} {...register('spoilerLevel', { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="npc-description">
          Description
        </label>
        <textarea id="npc-description" rows={2} className={inputCls + ' resize-none'} {...register('description')} />
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
            <label className={labelCls} htmlFor="npc-role">Role</label>
            <input id="npc-role" className={inputCls} placeholder="Merchant" {...register('attrRole')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="npc-services">Services (comma-separated)</label>
            <input id="npc-services" className={inputCls} placeholder="Shop, Upgrade" {...register('attrServices')} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="npc-hints">Dialogue Hints (comma-separated)</label>
            <input id="npc-hints" className={inputCls} placeholder="Hint 1, Hint 2" {...register('attrDialogueHints')} />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-primary" {...register('attrQuestRelated')} />
              <span className="text-sm text-foreground">Quest Related</span>
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
          {isSubmitting ? 'Saving…' : isEditing ? 'Update NPC' : 'Create NPC'}
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
