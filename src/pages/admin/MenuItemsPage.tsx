import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Button, FormError } from '../../components/admin/ui'
import ItemForm from '../../components/admin/ItemForm'
import DietMark from '../../components/DietMark'
import { useRestaurant } from '../../context/RestaurantContext'
import { listCategories } from '../../services/categories'
import {
  createMenuItem,
  deleteMenuItem,
  itemToFormValues,
  listMenuItems,
  setItemAvailability,
  updateMenuItem,
} from '../../services/menuItems'
import { formatPrice } from '../../lib/format'
import { cn } from '../../lib/utils'
import type { Category, MenuItem } from '../../types/database'
import type { MenuItemFormValues } from '../../validation/menuItem'

type FormState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; item: MenuItem }

export default function MenuItemsPage() {
  const { restaurant } = useRestaurant()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({ mode: 'closed' })

  const restaurantId = restaurant?.id
  const currency = restaurant?.currency ?? 'INR'

  const load = useCallback(async () => {
    if (!restaurantId) return
    try {
      const [cats, its] = await Promise.all([listCategories(restaurantId), listMenuItems(restaurantId)])
      setCategories(cats)
      setItems(its)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your menu.')
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    void load()
  }, [load])

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of items) map.set(item.category_id, [...(map.get(item.category_id) ?? []), item])
    return map
  }, [items])

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

  const openForm = (next: FormState) => {
    setForm(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (values: MenuItemFormValues) => {
    const editing = form.mode === 'edit' ? form.item : null
    await run(async () => {
      if (editing) {
        await updateMenuItem(editing.id, values)
      } else {
        const inCategory = itemsByCategory.get(values.category_id) ?? []
        const nextOrder = inCategory.length ? Math.max(...inCategory.map((i) => i.display_order)) + 1 : 0
        await createMenuItem(restaurantId, values, nextOrder)
      }
      setForm({ mode: 'closed' })
    })
  }

  const remove = (item: MenuItem) => {
    if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      void run(() => deleteMenuItem(item.id))
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu items</h1>
          <p className="mt-1 text-stone-600">Add dishes, change prices, and mark items sold out.</p>
        </div>
        {form.mode === 'closed' && categories.length > 0 && (
          <Button onClick={() => openForm({ mode: 'add' })}>
            <Plus size={18} className="mr-1.5" aria-hidden /> Add item
          </Button>
        )}
      </div>

      <FormError>{error}</FormError>

      {form.mode !== 'closed' && (
        <ItemForm
          key={form.mode === 'edit' ? form.item.id : 'new'}
          categories={categories}
          initial={form.mode === 'edit' ? itemToFormValues(form.item) : undefined}
          title={form.mode === 'edit' ? `Edit ${form.item.name}` : 'Add a menu item'}
          submitLabel={form.mode === 'edit' ? 'Save changes' : 'Add item'}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ mode: 'closed' })}
        />
      )}

      {loading ? (
        <p className="text-stone-600">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p>Create at least one category before adding items.</p>
          <Link to="/admin/categories" className="mt-2 inline-block font-medium text-emerald-800 underline">
            Go to Categories
          </Link>
        </div>
      ) : (
        categories.map((category) => {
          const list = itemsByCategory.get(category.id) ?? []
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h2 id={`cat-${category.id}`} className="mb-2 text-lg font-medium">
                {category.name}
                {!category.is_active && <span className="ml-2 text-sm font-normal text-stone-500">(hidden)</span>}
              </h2>
              <div className="rounded-xl border border-stone-200 bg-white">
                {list.length === 0 ? (
                  <p className="p-4 text-stone-500">No items in this category yet.</p>
                ) : (
                  <ul className="divide-y divide-stone-200">
                    {list.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt=""
                            width={48}
                            height={48}
                            loading="lazy"
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2">
                            <DietMark isVeg={item.is_vegetarian} isNonVeg={item.is_non_vegetarian} />
                            <span className={cn('truncate font-medium', !item.is_available && 'text-stone-400')}>
                              {item.name}
                            </span>
                            {item.is_spicy && <Flame size={15} className="shrink-0 text-red-600" aria-label="Spicy" />}
                            {item.is_featured && <Star size={15} className="shrink-0 text-amber-500" aria-label="Featured" />}
                          </p>
                          <p className="text-sm text-stone-600">
                            {formatPrice(item.price, currency)}
                            {item.original_price != null && item.original_price > item.price && (
                              <span className="ml-2 text-stone-400 line-through">
                                {formatPrice(item.original_price, currency)}
                              </span>
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-pressed={item.is_available}
                          onClick={() => void run(() => setItemAvailability(item.id, !item.is_available))}
                          className={cn(
                            'rounded-full px-3 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700',
                            item.is_available ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600',
                          )}
                        >
                          {item.is_available ? 'Available' : 'Sold out'}
                        </button>

                        <div className="flex items-center">
                          <button
                            type="button"
                            aria-label={`Edit ${item.name}`}
                            title="Edit"
                            onClick={() => openForm({ mode: 'edit', item })}
                            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${item.name}`}
                            title="Delete"
                            onClick={() => remove(item)}
                            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
