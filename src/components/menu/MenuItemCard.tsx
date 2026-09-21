import type { PublicMenuItem } from "../../types/menu";

interface MenuItemCardProps {
  item: PublicMenuItem;
  currency: string;
  onSelect: (item: PublicMenuItem) => void;
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function DietIndicator({ item }: { item: PublicMenuItem }) {
  if (item.is_vegan || item.is_vegetarian) {
    return (
      <span
        title={item.is_vegan ? "Vegan" : "Vegetarian"}
        className="inline-block h-3.5 w-3.5 flex-shrink-0 border-2 border-green-600"
      >
        <span className="block h-full w-full scale-50 rounded-full bg-green-600" />
      </span>
    );
  }
  if (item.is_non_vegetarian) {
    return (
      <span
        title="Non-vegetarian"
        className="inline-block h-3.5 w-3.5 flex-shrink-0 border-2 border-red-700"
      >
        <span className="block h-full w-full scale-50 rounded-full bg-red-700" />
      </span>
    );
  }
  return null;
}

export function MenuItemCard({ item, currency, onSelect }: MenuItemCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      disabled={!item.is_available}
      className={`flex w-full items-start gap-3 border-b border-gray-100 py-4 text-left last:border-b-0 ${
        item.is_available ? "" : "opacity-60"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <DietIndicator item={item} />
          <p className="font-medium text-gray-900">{item.name}</p>
          {item.is_spicy && <span title="Spicy">🌶️</span>}
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{item.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-medium text-gray-900">{formatPrice(item.price, currency)}</span>
          {item.original_price && item.original_price > item.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(item.original_price, currency)}
            </span>
          )}
          {!item.is_available && (
            <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
              Sold out
            </span>
          )}
        </div>
      </div>
      {item.image_url && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </button>
  );
}
