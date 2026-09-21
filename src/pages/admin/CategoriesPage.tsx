import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { Button, Field, FormError } from '../../components/admin/ui'
import { useRestaurant } from '../../context/RestaurantContext'
import {
  createCategory,
  deleteCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from '../../services/categories'
import { categorySchema, type CategoryValues } from '../../validation/category'
import type { Category } from '../../types/database'
import { cn } from '../../lib/utils'

export default function CategoriesPage() {
  const { restaurant } = useRestaurant()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  })

  const restaurantId = restaurant?.id

  const load = useCallback(async () => {
    if (!restaurantId) return
    setLoading(true)
    try {
      setCategories(await listCategories(restaurantId))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load categories.')
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    void load()
  }, [load])

  if (!restaurantId) return null

  const run = async (action: () => Promise<void>) => {
    setError('')
    try {
      await action()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    }
  }

  const onAdd = (v: CategoryValues) =>
    run(async () => {
      const nextOrder = categories.length ? Math.max(...categories.map((c) => c.display_order)) + 1 : 0
      await createCategory(restaurantId, v, nextOrder)
      reset()
    })

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const ids = categories.map((c) => c.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    void run(() => reorderCategories(ids))
  }

  const saveName = (c: Category) => {
    const name = editName.trim()
    if (!name || name === c.name) {
      setEditingId(null)
      return
    }
    void run(async () => {
      await updateCategory(c.id, { name })
      setEditingId(null)
    })
  }

  const remove = (c: Category) => {
    const ok = window.confirm(
      `Delete "${c.name}"? All menu items inside this category will be deleted too. This cannot be undone.`,
    )
    if (ok) void run(() => deleteCategory(c.id))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-stone-600">Group your menu into sections like Starters, Drinks or Desserts.</p>
      </div>

      <form
        onSubmit={handleSubmit(onAdd)}
        noValidate
        className="space-y-3 rounded-xl border border-stone-200 bg-white p-5"
      >
        <h2 className="font-medium">Add a category</h2>
        <Field label="Name" error={errors.name?.message} {...register('name')} />
        <Field
          label="Short description (optional)"
          error={errors.description?.message}
          {...register('description')}
        />
        <Button type="submit" loading={isSubmitting}>
          Add category
        </Button>
      </form>

      <FormError>{error}</FormError>

      <section aria-label="Your categories" className="rounded-xl border border-stone-200 bg-white">
        {loading ? (
          <p className="p-5 text-stone-600">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-5 text-stone-600">No categories yet. Add your first one above.</p>
        ) : (
          <ul className="divide-y divide-stone-200">
            {categories.map((c, i) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      aria-label="Category name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveName(c)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => saveName(c)}
                      className="w-full rounded-lg border border-stone-300 px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    />
                  ) : (
                    <>
                      <p className={cn('truncate font-medium', !c.is_active && 'text-stone-400 line-through')}>
                        {c.name}
                      </p>
                      {c.description && <p className="truncate text-sm text-stone-500">{c.description}</p>}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp size={18} />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === categories.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown size={18} />
                  </IconButton>
                  <IconButton
                    label={c.is_active ? 'Hide from menu' : 'Show on menu'}
                    onClick={() => void run(() => updateCategory(c.id, { is_active: !c.is_active }))}
                  >
                    {c.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </IconButton>
                  <IconButton
                    label="Rename"
                    onClick={() => {
                      setEditingId(c.id)
                      setEditName(c.name)
                    }}
                  >
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => remove(c)}>
                    <Trash2 size={18} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
