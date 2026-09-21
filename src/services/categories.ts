import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  restaurantId: string,
  values: { name: string; description?: string }
): Promise<Category> {
  // Put new categories at the end of the list.
  const { data: existing, error: countError } = await supabase
    .from("categories")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: false })
    .limit(1);

  if (countError) throw countError;
  const nextDisplayOrder =
    existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: restaurantId,
      name: values.name,
      description: values.description || null,
      display_order: nextDisplayOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  values: { name: string; description?: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: values.name,
      description: values.description || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// Swaps display_order between two categories to move one up or down in the list.
export async function swapCategoryOrder(a: Category, b: Category): Promise<void> {
  const { error: errorA } = await supabase
    .from("categories")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (errorA) throw errorA;

  const { error: errorB } = await supabase
    .from("categories")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (errorB) throw errorB;
}
