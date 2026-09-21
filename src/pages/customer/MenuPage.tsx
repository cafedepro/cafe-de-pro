import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicMenu } from "../../hooks/usePublicMenu";
import type { PublicMenuItem } from "../../types/menu";
import { MenuHeader } from "../../components/menu/MenuHeader";
import { CategoryNav } from "../../components/menu/CategoryNav";
import { MenuItemCard } from "../../components/menu/MenuItemCard";
import { ItemSheet } from "../../components/menu/ItemSheet";

export default function MenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { data, loading, error, notFound } = usePublicMenu(restaurantSlug);
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function scrollToCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading menu...
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-medium text-gray-900">Menu not found</p>
        <p className="text-gray-500">This restaurant page doesn't exist or isn't live yet.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-medium text-gray-900">Couldn't load the menu</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const categoriesWithItems = data.categories.filter(
    (c) => (data.itemsByCategory[c.id]?.length ?? 0) > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <MenuHeader restaurant={data.restaurant} />

      <CategoryNav
        categories={categoriesWithItems}
        activeId={activeCategoryId}
        onSelect={scrollToCategory}
      />

      <div className="mx-auto max-w-2xl px-4">
        {categoriesWithItems.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            The menu isn't ready yet — check back soon.
          </p>
        ) : (
          categoriesWithItems.map((category) => (
            <div
              key={category.id}
              ref={(el) => {
                sectionRefs.current[category.id] = el;
              }}
              className="scroll-mt-16 pt-6"
            >
              <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
              <div className="mt-2">
                {data.itemsByCategory[category.id].map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currency={data.restaurant.currency}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <ItemSheet
          item={selectedItem}
          currency={data.restaurant.currency}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
