import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field } from './ui'
import ImageUploader from './ImageUploader'
import { useRestaurant } from '../../context/RestaurantContext'
import { menuItemSchema, type MenuItemFormValues } from '../../validation/menuItem'
import type { Category } from '../../types/database'

const EMPTY: MenuItemFormValues = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  original_price: '',
  diet: 'none',
  is_spicy: false,
  is_featured: false,
  is_available: true,
  image_url: '',
  preparation_time: '',
  calories: '',
}

interface Props {
  categories: Category[]
  initial?: MenuItemFormValues
  title: string
  submitLabel: string
  onSubmit: (values: MenuItemFormValues) => Promise<void>
  onCancel: () => void
}

export default function ItemForm({ categories, initial, title, submitLabel, onSubmit, onCancel }: Props) {
  const { restaurant } = useRestaurant()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initial ?? { ...EMPTY, category_id: categories[0]?.id ?? '' },
  })

  const imageUrl = watch('image_url')

  const selectClass =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-emerald-700'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-medium">{title}</h2>

      <Field label="Item name" error={errors.name?.message} {...register('name')} />

      <div className="space-y-1.5">
        <label htmlFor="category_id" className="block text-sm font-medium text-stone-800">
          Category
        </label>
        <select id="category_id" className={selectClass} {...register('category_id')}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="text-sm text-red-700">{errors.category_id.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-stone-800">
          Description (optional)
        </label>
        <textarea id="description" rows={3} className={selectClass} {...register('description')} />
        {errors.description && <p className="text-sm text-red-700">{errors.description.message}</p>}
      </div>

      {restaurant && (
        <>
          <input type="hidden" {...register('image_url')} />
          <ImageUploader
            label="Photo (optional)"
            hint="A clear photo from above works well."
            value={imageUrl}
            restaurantId={restaurant.id}
            folder="items"
            maxDimension={1000}
            shape="square"
            onChange={(url) => setValue('image_url', url, { shouldDirty: true })}
          />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price" type="number" step="0.01" min="0" inputMode="decimal" error={errors.price?.message} {...register('price')} />
        <Field
          label="Original price (optional)"
          hint="Shown crossed out when you run an offer"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          error={errors.original_price?.message}
          {...register('original_price')}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-stone-800">Food type</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {(
            [
              ['veg', 'Vegetarian'],
              ['vegan', 'Vegan'],
              ['non_veg', 'Non-vegetarian'],
              ['none', 'Not specified'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input type="radio" value={value} {...register('diet')} className="h-4 w-4 accent-emerald-800" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_spicy')} className="h-4 w-4 accent-emerald-800" /> Spicy
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_featured')} className="h-4 w-4 accent-emerald-800" /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_available')} className="h-4 w-4 accent-emerald-800" /> Available now
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Preparation time in minutes (optional)"
          inputMode="numeric"
          error={errors.preparation_time?.message}
          {...register('preparation_time')}
        />
        <Field label="Calories (optional)" inputMode="numeric" error={errors.calories?.message} {...register('calories')} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
