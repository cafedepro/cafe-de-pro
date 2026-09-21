import { supabase } from "../lib/supabase";
import type { PublicMenuData, PublicMenuItem } from "../types/menu";

export async function getPublicMenu(slug: string): Promise<PublicMenuData | null> {
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (restaurantError) throw restaurantError;
  if (!restaurant) return null;

  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("display_order", { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (itemsError) throw itemsError;

  const itemsByCategory: Record<string, PublicMenuItem[]> = {};
  for (const item of items ?? []) {
    // Supabase returns numeric columns as strings — normalize to numbers here
    // so nothing downstream has to remember to do it.
    const normalized: PublicMenuItem = {
      ...item,
      price: Number(item.price),
      original_price: item.original_price != null ? Number(item.original_price) : null,
    };
    if (!itemsByCategory[item.category_id]) itemsByCategory[item.category_id] = [];
    itemsByCategory[item.category_id].push(normalized);
  }

  return {
    restaurant,
    categories: categories ?? [],
    itemsByCategory,
  };
}
