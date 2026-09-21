import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Field, FormError, FullScreenMessage } from '../../components/admin/ui'
import { useRestaurant } from '../../context/RestaurantContext'
import { createRestaurant, SlugTakenError } from '../../services/restaurants'
import { createRestaurantSchema, type CreateRestaurantValues } from '../../validation/restaurant'
import { slugify } from '../../lib/utils'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']

export default function OnboardingPage() {
  const { restaurant, loading, setRestaurant } = useRestaurant()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone')
    } catch {
      return ['Asia/Kolkata', 'UTC']
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRestaurantValues>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      name: '',
      slug: '',
      currency: 'INR',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    },
  })

  const name = watch('name')
  const slug = watch('slug')
  useEffect(() => {
    if (!slugTouched) setValue('slug', slugify(name ?? ''), { shouldValidate: !!name })
  }, [name, slugTouched, setValue])

  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (restaurant) return <Navigate to="/admin" replace />

  const onSubmit = async (v: CreateRestaurantValues) => {
    setError('')
    try {
      setRestaurant(await createRestaurant(v))
      navigate('/admin', { replace: true })
    } catch (e) {
      setError(e instanceof SlugTakenError ? e.message : 'Could not create the restaurant. Try again.')
    }
  }

  const selectClass =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base focus-visible:ring-2 focus-visible:ring-emerald-700 outline-none'

  return (
    <AuthLayout title="Set up your restaurant" subtitle="You can change all of this later.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError>{error}</FormError>
        <Field label="Restaurant name" error={errors.name?.message} {...register('name')} />
        <Field
          label="Menu web address"
          hint={`Customers will open /menu/${slug || 'your-name'}`}
          error={errors.slug?.message}
          {...register('slug', { onChange: () => setSlugTouched(true) })}
        />
        <div className="space-y-1.5">
          <label htmlFor="timezone" className="block text-sm font-medium">
            Timezone
          </label>
          <select id="timezone" className={selectClass} {...register('timezone')}>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="text-sm text-stone-500">Used to show Open now or Closed correctly.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="currency" className="block text-sm font-medium">
            Currency
          </label>
          <select id="currency" className={selectClass} {...register('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create restaurant
        </Button>
      </form>
    </AuthLayout>
  )
}
