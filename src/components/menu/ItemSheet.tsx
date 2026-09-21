import { useEffect, useRef } from 'react'
import { Clock, Flame, Star, X } from 'lucide-react'
import DietMark from '../DietMark'
import { formatPrice } from '../../lib/format'
import type { MenuItem, RestaurantSettings } from '../../types/database'
import type { AddOn, ItemVariant } from '../../types/menu'

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' }

interface Props {
  item: MenuItem
  variants: ItemVariant[]
  addOns: AddOn[]
  currency: string
  settings: RestaurantSettings
  onClose: () => void
}

// Bottom sheet on phones, centred card on larger screens. Uses the native
// <dialog> element, so Esc, focus trapping and screen readers work correctly.
export default function ItemSheet({ item, variants, addOns, currency, settings, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const showImage = settings.show_images && !!item.image_url
  const unavailable = !item.is_available
  const dietLabel = item.is_vegan ? 'Vegan' : item.is_vegetarian ? 'Vegetarian' : item.is_non_vegetarian ? 'Non-vegetarian' : null
  const availableAddOns = addOns.filter((a) => a.is_available)

  return (
    <dialog
      ref={ref}
      aria-labelledby="item-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close()
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 text-stone-900 backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="relative">
        {showImage && (
          <img src={item.image_url as string} alt={item.name} className="h-56 w-full object-cover sm:h-64" decoding="async" />
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={() => ref.current?.close()}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          <X size={20} aria-hidden />
        </button>

        <div className={showImage ? 'p-5' : 'p-5 pr-16'}>
          <div className="flex items-start gap-2">
            <span className="mt-1.5">
              <DietMark isVeg={item.is_vegetarian} isNonVeg={item.is_non_vegetarian} />
            </span>
            <h2 id="item-sheet-title" className="text-2xl font-bold leading-snug" style={serif}>
              {item.name}
            </h2>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
            {dietLabel && <span>{dietLabel}</span>}
            {item.is_spicy && (
              <span className="inline-flex items-center gap-1 text-red-700">
                <Flame size={14} aria-hidden /> Spicy
              </span>
            )}
            {item.is_featured && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Star size={14} aria-hidden /> Featured
              </span>
            )}
            {item.preparation_time != null && (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} aria-hidden /> About {item.preparation_time} min
              </span>
            )}
            {settings.show_calories && item.calories != null && <span>{item.calories} kcal</span>}
          </div>

          {item.description && <p className="mt-4 leading-relaxed text-stone-700">{item.description}</p>}

          {settings.show_prices && (
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(item.price, currency)}</span>
              {item.original_price != null && item.original_price > item.price && (
                <span className="text-stone-400 line-through">{formatPrice(item.original_price, currency)}</span>
              )}
            </p>
          )}

          {unavailable && (
            <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 font-medium text-stone-700">
              This item is currently unavailable.
            </p>
          )}

          {variants.length > 0 && (
            <section className="mt-6" aria-labelledby="variants-title">
              <h3 id="variants-title" className="mb-2 font-semibold">
                Sizes
              </h3>
              <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200">
                {variants.map((v) => (
                  <li key={v.id} className="flex justify-between px-4 py-3">
                    <span>{v.name}</span>
                    {settings.show_prices && <span className="font-medium">{formatPrice(v.price, currency)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {availableAddOns.length > 0 && (
            <section className="mt-6" aria-labelledby="addons-title">
              <h3 id="addons-title" className="mb-2 font-semibold">
                Add-ons
              </h3>
              <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200">
                {availableAddOns.map((a) => (
                  <li key={a.id} className="flex justify-between px-4 py-3">
                    <span>{a.name}</span>
                    {settings.show_prices && <span className="font-medium">+ {formatPrice(a.price, currency)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </dialog>
  )
}
