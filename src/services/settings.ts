import { supabase } from '../lib/supabase'
import type { RestaurantSettings } from '../types/database'
import type { SettingsValues } from '../validation/settings'

export async function getSettings(restaurantId: string): Promise<SettingsValues> {
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .maybeSingle()
  if (error) throw error
  const s = data as RestaurantSettings | null
  return {
    primary_color: s?.primary_color ?? '#111827',
    secondary_color: s?.secondary_color ?? '#F9FAFB',
    accent_color: s?.accent_color ?? '#F59E0B',
    font_family: s?.font_family ?? 'Inter',
    show_prices: s?.show_prices ?? true,
    show_images: s?.show_images ?? true,
    show_descriptions: s?.show_descriptions ?? true,
    show_calories: s?.show_calories ?? false,
    show_unavailable_items: s?.show_unavailable_items ?? true,
    enable_whatsapp: s?.enable_whatsapp ?? true,
  }
}

export async function saveSettings(restaurantId: string, values: SettingsValues): Promise<void> {
  const { error } = await supabase
    .from('restaurant_settings')
    .upsert({ restaurant_id: restaurantId, ...values }, { onConflict: 'restaurant_id' })
  if (error) throw error
}
