import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field, FormError } from '../../components/admin/ui'
import ImageUploader from '../../components/admin/ImageUploader'
import { useRestaurant } from '../../context/RestaurantContext'
import { profileToPatch, restaurantToProfileValues, updateRestaurant } from '../../services/restaurants'
import { restaurantProfileSchema, type RestaurantProfileValues } from '../../validation/restaurantProfile'
import type { Restaurant } from '../../types/database'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']

export default function RestaurantPage() {
  const { restaurant } = useRestaurant()
  if (!restaurant) return null
  return <RestaurantForms restaurant={restaurant} />
}

function RestaurantForms({ restaurant }: { restaurant: Restaurant }) {
  const { setRestaurant } = useRestaurant()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone')
    } catch {
      return [restaurant.timezone]
    }
  }, [restaurant.timezone])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantProfileValues>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: restaurantToProfileValues(restaurant),
  })

  const onSubmit = async (values: RestaurantProfileValues) => {
    setError('')
    setSaved(false)
    try {
      const updated = await updateRestaurant(restaurant.id, profileToPatch(values))
      setRestaurant(updated)
      reset(restaurantToProfileValues(updated))
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.')
    }
  }

  // Photos save immediately when uploaded or removed.
  const saveImage = (field: 'logo_url' | 'cover_image_url') => async (url: string) => {
    setError('')
    try {
      setRestaurant(await updateRestaurant(restaurant.id, { [field]: url || null }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the photo.')
    }
  }

  const selectClass =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-emerald-700'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Restaurant</h1>
        <p className="mt-1 text-stone-600">Your name, contact details, opening hours and photos.</p>
      </div>

      <FormError>{error}</FormError>

      <section className="space-y-5 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-medium">Photos</h2>
        <ImageUploader
          label="Logo"
          hint="A square picture works best."
          value={restaurant.logo_url ?? ''}
          restaurantId={restaurant.id}
          folder="logo"
          maxDimension={400}
          shape="square"
          onChange={saveImage('logo_url')}
        />
        <ImageUploader
          label="Cover photo"
          hint="A wide photo of your food or place. It appears behind your name."
          value={restaurant.cover_image_url ?? ''}
          restaurantId={restaurant.id}
          folder="cover"
          maxDimension={1600}
          shape="wide"
          onChange={saveImage('cover_image_url')}
        />
      </section>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-medium">Details</h2>

        <Field label="Restaurant name" error={errors.name?.message} {...register('name')} />

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-stone-800">
            Short description
          </label>
          <textarea id="description" rows={3} className={selectClass} {...register('description')} />
          {errors.description && <p className="text-sm text-red-700">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number" type="tel" inputMode="tel" hint="Shows a Call button on your menu" error={errors.phone?.message} {...register('phone')} />
          <Field
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            hint="Include the country code, like +91..."
            error={errors.whatsapp_number?.message}
            {...register('whatsapp_number')}
          />
        </div>
        <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />

        <Field label="Address" error={errors.address?.message} {...register('address')} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" error={errors.city?.message} {...register('city')} />
          <Field label="State" error={errors.state?.message} {...register('state')} />
          <Field label="Country" error={errors.country?.message} {...register('country')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Opens at" type="time" error={errors.opening_time?.message} {...register('opening_time')} />
          <Field label="Closes at" type="time" error={errors.closing_time?.message} {...register('closing_time')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="timezone" className="block text-sm font-medium text-stone-800">
              Timezone
            </label>
            <select id="timezone" className={selectClass} {...register('timezone')}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="currency" className="block text-sm font-medium text-stone-800">
              Currency
            </label>
            <select id="currency" className={selectClass} {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-800" {...register('is_active')} />
          <span>
            <span className="font-medium">Menu is live</span>
            <span className="block text-sm text-stone-500">Turn this off to hide your menu from customers.</span>
          </span>
        </label>

        <p className="text-sm text-stone-500">
          Menu web address: <span className="font-mono">/menu/{restaurant.slug}</span> (fixed, so printed QR codes never break)
        </p>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
          {saved && (
            <p role="status" className="text-sm font-medium text-emerald-800">
              Saved
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
