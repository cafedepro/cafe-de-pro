import { Flame, Star } from 'lucide-react'
import DietMark from '../DietMark'
import { formatPrice } from '../../lib/format'
import { cn } from '../../lib/utils'
import type { MenuItem, RestaurantSettings } from '../../types/database'

interface Props {
  item: MenuItem
  currency: string
  settings: RestaurantSettings
  onOpen: (item: MenuItem) => void
}

export default function MenuItemCard({ item, currency, settings, onOpen }: Props) {
  const showImage = settings.show_images && !!item.image_url
  const unavailable = !item.is_available

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex w-full gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <div className={cn('min-w-0 flex-1', unavailable && 'opacity-60')}>
          <div className="flex items-center gap-2">
            <DietMark isVeg={item.is_vegetarian} isNonVeg={item.is_non_vegetarian} />
            <h3 className="text-base font-semibold leading-snug">{item.name}</h3>
          </div>

          {(item.is_featured || item.is_spicy) && (
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium">
              {item.is_featured && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: settings.accent_color, color: '#111827' }}
                >
                  <Star size={12} aria-hidden /> Featured
                </span>
              )}
              {item.is_spicy && (
                <span className="inline-flex items-center gap-1 text-red-700">
                  <Flame size={13} aria-hidden /> Spicy
                </span>
              )}
            </p>
          )}

          {settings.show_descriptions && item.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
            {settings.show_prices && (
              <>
                <span className="text-base font-bold">{formatPrice(item.price, currency)}</span>
                {item.original_price != null && item.original_price > item.price && (
                  <span className="text-sm text-stone-400 line-through">{formatPrice(item.original_price, currency)}</span>
                )}
              </>
            )}
            {settings.show_calories && item.calories != null && (
              <span className="text-xs text-stone-500">{item.calories} kcal</span>
            )}
          </div>

          {unavailable && (
            <p className="mt-2 inline-block rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
              Currently unavailable
            </p>
          )}
        </div>

        {showImage && (
          <img
            src={item.image_url as string}
            alt={item.name}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className={cn('h-24 w-24 shrink-0 rounded-xl object-cover', unavailable && 'opacity-60 grayscale')}
          />
        )}
      </button>
    </li>
  )
}
