import { MapPin, MessageCircle, Phone } from 'lucide-react'
import { formatTime, type OpenStatus } from '../../lib/openStatus'
import { readableOn } from '../../lib/color'
import type { Restaurant, RestaurantSettings } from '../../types/database'

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' }

interface Props {
  restaurant: Restaurant
  settings: RestaurantSettings
  status: OpenStatus
  table: string | null
  onCall: () => void
  onWhatsApp: () => void
}

export default function MenuHeader({ restaurant, settings, status, table, onCall, onWhatsApp }: Props) {
  const primary = settings.primary_color
  const textColor = readableOn(primary)
  const location = [restaurant.city, restaurant.state].filter(Boolean).join(', ')
  const whatsappDigits = restaurant.whatsapp_number?.replace(/\D/g, '')
  const initials = restaurant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <header className="relative overflow-hidden" style={{ backgroundColor: primary, color: textColor }}>
      {restaurant.cover_image_url && (
        <>
          <img
            src={restaurant.cover_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </>
      )}

      <div className="relative mx-auto max-w-2xl px-5 pb-7 pt-10">
        <div className="flex items-center gap-4">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={`${restaurant.name} logo`}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-white/40 object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 text-xl font-semibold"
              style={{ borderColor: 'currentColor', ...serif }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight" style={serif}>
              {restaurant.name}
            </h1>
            {table && <p className="mt-0.5 text-sm opacity-80">Table {table}</p>}
          </div>
        </div>

        {restaurant.description && <p className="mt-4 max-w-prose leading-relaxed opacity-90">{restaurant.description}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {status !== 'unknown' && (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-wider"
              style={{ backgroundColor: status === 'open' ? '#dcfce7' : '#fee2e2', color: status === 'open' ? '#14532d' : '#7f1d1d' }}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: status === 'open' ? '#16a34a' : '#dc2626' }}
              />
              {status === 'open' ? 'OPEN NOW' : 'CLOSED'}
            </span>
          )}
          {restaurant.opening_time && restaurant.closing_time && (
            <span className="opacity-90">
              {formatTime(restaurant.opening_time)} – {formatTime(restaurant.closing_time)}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 opacity-90">
              <MapPin size={14} aria-hidden /> {location}
            </span>
          )}
        </div>

        {(restaurant.phone || (settings.enable_whatsapp && whatsappDigits)) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                onClick={onCall}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                style={{ backgroundColor: settings.accent_color, color: readableOn(settings.accent_color) }}
              >
                <Phone size={16} aria-hidden /> Call
              </a>
            )}
            {settings.enable_whatsapp && whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                onClick={onWhatsApp}
                className="inline-flex items-center gap-2 rounded-full border border-current px-4 py-2.5 text-sm font-semibold"
              >
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
