import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import type { MenuItem } from '../types/database'
import type { MenuItemFormValues } from '../validation/menuItem'

function blankToNull(v: string): number | null {
  return v.trim() === '' ? null : Number(v)
}

// Converts form text values into the exact shape the database expects.
function toPayload(v: MenuItemFormValues) {
  return {
    name: v.name,
    category_id: v.category_id,
    description: v.description || null,
    price: Number(v.price),
    original_price: blankToNull(v.original_price),
    is_vegetarian: v.diet === 'veg' || v.diet === 'vegan',
    is_vegan: v.diet === 'vegan',
    is_non_vegetarian: v.diet === 'non_veg',
    is_spicy: v.is_spicy,
    is_featured: v.is_featured,
    is_available: v.is_available,
    image_url: v.image_url || null,
    preparation_time: blankToNull(v.preparation_time),
    calories: blankToNull(v.calories),
  }
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as MenuItem[]
}

export async function createMenuItem(
  restaurantId: string,
  values: MenuItemFormValues,
  displayOrder: number,
): Promise<void> {
  const slug = `${slugify(values.name) || 'item'}-${Math.random().toString(36).slice(2, 6)}`
  const { error } = await supabase
    .from('menu_items')
    .insert({ ...toPayload(values), restaurant_id: restaurantId, slug, display_order: displayOrder })
  if (error) throw error
}

export async function updateMenuItem(id: string, values: MenuItemFormValues): Promise<void> {
  const { error } = await supabase.from('menu_items').update(toPayload(values)).eq('id', id)
  if (error) throw error
}

export async function setItemAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', id)
  if (error) throw error
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw error
}

export function itemToFormValues(item: MenuItem): MenuItemFormValues {
  return {
    name: item.name,
    category_id: item.category_id,
    description: item.description ?? '',
    price: String(item.price),
    original_price: item.original_price == null ? '' : String(item.original_price),
    diet: item.is_vegan ? 'vegan' : item.is_vegetarian ? 'veg' : item.is_non_vegetarian ? 'non_veg' : 'none',
    is_spicy: item.is_spicy,
    is_featured: item.is_featured,
    is_available: item.is_available,
    image_url: item.image_url ?? '',
    preparation_time: item.preparation_time == null ? '' : String(item.preparation_time),
    calories: item.calories == null ? '' : String(item.calories),
  }
}
