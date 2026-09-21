import { supabase } from '../lib/supabase'
import type { Category, MenuItem, Restaurant, RestaurantSettings } from '../types/database'
import type { AddOn, ItemVariant, PublicMenu } from '../types/menu'

const DEFAULT_SETTINGS = (restaurantId: string): RestaurantSettings => ({
  id: 'default',
  restaurant_id: restaurantId,
  primary_color: '#111827',
  secondary_color: '#F9FAFB',
  accent_color: '#F59E0B',
  font_family: 'Inter',
  menu_style: 'cards',
  show_prices: true,
  show_images: true,
  show_descriptions: true,
  show_calories: false,
  show_unavailable_items: true,
  enable_ordering: false,
  enable_whatsapp: true,
  enable_call_waiter: false,
})

// Returns null when the restaurant does not exist or is switched off.
export async function fetchPublicMenu(slug: string): Promise<PublicMenu | null> {
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  if (!restaurant) return null

  const rid = (restaurant as Restaurant).id
  const [settings, categories, items, variants, addOns] = await Promise.all([
    supabase.from('restaurant_settings').select('*').eq('restaurant_id', rid).maybeSingle(),
    supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', rid)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', rid)
      .order('display_order', { ascending: true }),
    supabase.from('item_variants').select('*').eq('restaurant_id', rid).order('display_order', { ascending: true }),
    supabase.from('add_ons').select('*').eq('restaurant_id', rid).order('display_order', { ascending: true }),
  ])

  for (const r of [settings, categories, items, variants, addOns]) {
    if (r.error) throw r.error
  }

  return {
    restaurant: restaurant as Restaurant,
    settings: (settings.data as RestaurantSettings | null) ?? DEFAULT_SETTINGS(rid),
    categories: (categories.data ?? []) as Category[],
    items: (items.data ?? []) as MenuItem[],
    variants: (variants.data ?? []) as ItemVariant[],
    addOns: (addOns.data ?? []) as AddOn[],
  }
}
