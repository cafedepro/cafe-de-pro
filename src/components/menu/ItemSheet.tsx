import type { PublicMenuItem } from "../../types/menu";
import { DietIndicator } from "./MenuItemCard";

interface ItemSheetProps {
  item: PublicMenuItem;
  currency: string;
  onClose: () => void;
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function ItemSheet({ item, currency, onClose }: ItemSheetProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.image_url && (
          <div className="-mx-5 -mt-5 mb-4 h-48 overflow-hidden bg-gray-100 sm:rounded-t-2xl">
            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <DietIndicator item={item} />
            <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
            {item.is_spicy && <span title="Spicy">🌶️</span>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {item.description && <p className="mt-2 text-gray-600">{item.description}</p>}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(item.price, currency)}
          </span>
          {item.original_price && item.original_price > item.price && (
            <span className="text-gray-400 line-through">
              {formatPrice(item.original_price, currency)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
          {item.preparation_time != null && <span>~{item.preparation_time} min</span>}
          {item.calories != null && <span>{item.calories} kcal</span>}
        </div>

        {!item.is_available && (
          <p className="mt-4 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
            Currently sold out
          </p>
        )}
      </div>
    </div>
  );
}
