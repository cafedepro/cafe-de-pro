import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

export async function listCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Category[]
}

export async function createCategory(
  restaurantId: string,
  values: { name: string; description: string },
  displayOrder: number,
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      restaurant_id: restaurantId,
      name: values.name,
      description: values.description || null,
      display_order: displayOrder,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as Category
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'description' | 'is_active'>>,
): Promise<void> {
  const { error } = await supabase.from('categories').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// Saves the new order: each id gets display_order = its position in the list.
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from('categories').update({ display_order: index }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}
