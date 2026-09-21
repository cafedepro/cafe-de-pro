import { supabase } from "../lib/supabase";

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  // Short random suffix keeps (restaurant_id, slug) unique without an extra query.
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "item"}-${suffix}`;
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createMenuItem(
  restaurantId: string,
  values: {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string | null;
    is_available: boolean;
  }
): Promise<MenuItem> {
  const { data: existing, error: countError } = await supabase
    .from("menu_items")
    .select("display_order")
    .eq("category_id", values.category_id)
    .order("display_order", { ascending: false })
    .limit(1);

  if (countError) throw countError;
  const nextDisplayOrder =
    existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      restaurant_id: restaurantId,
      category_id: values.category_id,
      name: values.name,
      slug: slugify(values.name),
      description: values.description || null,
      price: values.price,
      image_url: values.image_url || null,
      is_available: values.is_available,
      display_order: nextDisplayOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(
  id: string,
  values: {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string | null;
    is_available: boolean;
  }
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu_items")
    .update({
      category_id: values.category_id,
      name: values.name,
      description: values.description || null,
      price: values.price,
      image_url: values.image_url || null,
      is_available: values.is_available,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id);
  if (error) throw error;
}

// Uploads an item photo to the restaurant-media bucket, scoped under the
// restaurant's own folder so storage policies (owns_restaurant) apply.
export async function uploadItemImage(
  restaurantId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${restaurantId}/items/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("restaurant-media")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("restaurant-media").getPublicUrl(path);
  return data.publicUrl;
}
