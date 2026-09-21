import { supabase } from '../lib/supabase'

export interface RestaurantTable {
  id: string
  restaurant_id: string
  table_number: string
  qr_token: string
  is_active: boolean
}

function byNumber(a: RestaurantTable, b: RestaurantTable): number {
  return a.table_number.localeCompare(b.table_number, undefined, { numeric: true })
}

export async function listTables(restaurantId: string): Promise<RestaurantTable[]> {
  const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId)
  if (error) throw error
  return ((data ?? []) as RestaurantTable[]).sort(byNumber)
}

// Creates tables 1..count. Tables that already exist are left untouched.
export async function createTables(restaurantId: string, count: number): Promise<void> {
  const rows = Array.from({ length: count }, (_, i) => ({
    restaurant_id: restaurantId,
    table_number: String(i + 1),
  }))
  const { error } = await supabase
    .from('tables')
    .upsert(rows, { onConflict: 'restaurant_id,table_number', ignoreDuplicates: true })
  if (error) throw error
}

export async function deleteTable(id: string): Promise<void> {
  const { error } = await supabase.from('tables').delete().eq('id', id)
  if (error) throw error
}
