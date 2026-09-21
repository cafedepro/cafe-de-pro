import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormError, FullScreenMessage } from '../../components/admin/ui'
import { useRestaurant } from '../../context/RestaurantContext'
import { getSettings, saveSettings } from '../../services/settings'
import { settingsSchema, type SettingsValues } from '../../validation/settings'
import { readableOn } from '../../lib/color'

// Fonts that exist on almost every phone and computer, so nothing has to be downloaded.
const FONTS = [
  ['Inter', 'Default (clean sans-serif)'],
  ['Georgia', 'Classic (serif)'],
  ['Trebuchet MS', 'Friendly'],
  ['Verdana', 'Wide and easy to read'],
  ['Tahoma', 'Compact'],
] as const

const TOGGLES: Array<[keyof SettingsValues, string, string]> = [
  ['show_prices', 'Show prices', 'Turn off to show a menu without prices.'],
  ['show_images', 'Show food photos', 'Hides all photos on the customer menu.'],
  ['show_descriptions', 'Show descriptions', 'Hides the short text under each dish name.'],
  ['show_calories', 'Show calories', 'Shows calories where you have entered them.'],
  ['show_unavailable_items', 'Show sold-out items', 'Sold-out dishes appear greyed out instead of disappearing.'],
  ['enable_whatsapp', 'Show WhatsApp button', 'Needs a WhatsApp number on the Restaurant page.'],
]

export default function SettingsPage() {
  const { restaurant } = useRestaurant()
  const [initial, setInitial] = useState<SettingsValues | null>(null)
  const [error, setError] = useState('')

  const restaurantId = restaurant?.id
  useEffect(() => {
    if (!restaurantId) return
    getSettings(restaurantId)
      .then(setInitial)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load settings.'))
  }, [restaurantId])

  if (!restaurant) return null
  if (!initial) return <FullScreenMessage>{error || 'Loading…'}</FullScreenMessage>
  return <SettingsForm restaurantId={restaurant.id} name={restaurant.name} initial={initial} />
}

function SettingsForm({ restaurantId, name, initial }: { restaurantId: string; name: string; initial: SettingsValues }) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsValues>({ resolver: zodResolver(settingsSchema), defaultValues: initial })

  const primary = watch('primary_color')
  const secondary = watch('secondary_color')
  const accent = watch('accent_color')
  const secondaryTooDark = readableOn(secondary) === '#ffffff'

  const onSubmit = async (values: SettingsValues) => {
    setError('')
    setSaved(false)
    try {
      await saveSettings(restaurantId, values)
      reset(values)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.')
    }
  }

  const colorField = (field: 'primary_color' | 'secondary_color' | 'accent_color', label: string, hint: string) => (
    <div className="space-y-1.5">
      <label htmlFor={field} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      <input id={field} type="color" className="h-11 w-full cursor-pointer rounded-lg border border-stone-300 bg-white p-1" {...register(field)} />
      <p className="text-sm text-stone-500">{hint}</p>
      {errors[field] && <p className="text-sm text-red-700">{errors[field]?.message}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-stone-600">Colours, font, and what customers see. Changes go live on your menu right away.</p>
      </div>

      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <section className="space-y-5 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-medium">Branding</h2>

          <div className="rounded-xl p-4" style={{ backgroundColor: primary, color: readableOn(primary) }} aria-label="Colour preview">
            <p className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              {name}
            </p>
            <span
              className="mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold"
              style={{ backgroundColor: accent, color: readableOn(accent) }}
            >
              Call
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {colorField('primary_color', 'Main colour', 'Header and category buttons')}
            {colorField('accent_color', 'Accent colour', 'Buttons and featured tags')}
            {colorField('secondary_color', 'Page background', 'Keep this light')}
          </div>
          {secondaryTooDark && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This background is quite dark, so the menu text may be hard to read. A light colour is safer.
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="font_family" className="block text-sm font-medium text-stone-800">
              Font style
            </label>
            <select
              id="font_family"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              {...register('font_family')}
            >
              {FONTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-medium">What customers see</h2>
          <ul className="space-y-3">
            {TOGGLES.map(([field, label, hint]) => (
              <li key={field}>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-800" {...register(field)} />
                  <span>
                    <span className="font-medium">{label}</span>
                    <span className="block text-sm text-stone-500">{hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSubmitting}>
            Save settings
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
