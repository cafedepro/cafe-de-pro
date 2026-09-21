import type { PublicCategory } from "../../types/menu";

interface CategoryNavProps {
  categories: PublicCategory[];
  activeId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  if (categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeId === category.id
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
