import { supabase } from '../lib/supabase'
import type { Restaurant } from '../types/database'
import type { CreateRestaurantValues } from '../validation/restaurant'
import type { RestaurantProfileValues } from '../validation/restaurantProfile'

export async function getMyRestaurant(ownerId: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Restaurant | null
}

export class SlugTakenError extends Error {
  constructor() {
    super('That web address is already taken. Try another.')
  }
}

export async function createRestaurant(values: CreateRestaurantValues): Promise<Restaurant> {
  // owner_id defaults to auth.uid() in the database.
  const { data, error } = await supabase.from('restaurants').insert(values).select('*').single()
  if (error) {
    if (error.code === '23505') throw new SlugTakenError()
    throw error
  }
  return data as Restaurant
}

type RestaurantPatch = Partial<Omit<Restaurant, 'id' | 'owner_id' | 'slug' | 'created_at' | 'updated_at'>>

export async function updateRestaurant(id: string, patch: RestaurantPatch): Promise<Restaurant> {
  const { data, error } = await supabase.from('restaurants').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as Restaurant
}

const orNull = (v: string): string | null => (v.trim() === '' ? null : v.trim())

export function profileToPatch(v: RestaurantProfileValues): RestaurantPatch {
  return {
    name: v.name,
    description: orNull(v.description),
    phone: orNull(v.phone),
    whatsapp_number: orNull(v.whatsapp_number),
    email: orNull(v.email),
    address: orNull(v.address),
    city: orNull(v.city),
    state: orNull(v.state),
    country: orNull(v.country),
    opening_time: orNull(v.opening_time),
    closing_time: orNull(v.closing_time),
    timezone: v.timezone,
    currency: v.currency,
    is_active: v.is_active,
  }
}

export function restaurantToProfileValues(r: Restaurant): RestaurantProfileValues {
  return {
    name: r.name,
    description: r.description ?? '',
    phone: r.phone ?? '',
    whatsapp_number: r.whatsapp_number ?? '',
    email: r.email ?? '',
    address: r.address ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    country: r.country ?? '',
    opening_time: r.opening_time ? r.opening_time.slice(0, 5) : '',
    closing_time: r.closing_time ? r.closing_time.slice(0, 5) : '',
    timezone: r.timezone,
    currency: r.currency,
    is_active: r.is_active,
  }
}
