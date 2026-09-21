import type { PublicRestaurant } from "../../types/menu";
import { formatHours, isRestaurantOpen } from "../../lib/openStatus";

interface MenuHeaderProps {
  restaurant: PublicRestaurant;
}

export function MenuHeader({ restaurant }: MenuHeaderProps) {
  const open = isRestaurantOpen(restaurant.opening_time, restaurant.closing_time, restaurant.timezone);
  const hours = formatHours(restaurant.opening_time, restaurant.closing_time);
  const locationLine = [restaurant.city, restaurant.state].filter(Boolean).join(", ");

  return (
    <div>
      {restaurant.cover_image_url ? (
        <div className="h-40 w-full overflow-hidden bg-gray-200 sm:h-56">
          <img
            src={restaurant.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-24 w-full bg-gradient-to-r from-emerald-700 to-emerald-600 sm:h-32" />
      )}

      <div className="mx-auto max-w-2xl px-4">
        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm sm:h-24 sm:w-24">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-2xl font-semibold text-emerald-700">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                open ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
              }`}
            >
              {open ? "Open now" : "Closed"}
            </span>
          </div>
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="mt-1 text-gray-600">{restaurant.description}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {locationLine && <span>{locationLine}</span>}
          {hours && <span>{hours}</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {restaurant.whatsapp_number && (
            <a
              href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              WhatsApp
            </a>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
