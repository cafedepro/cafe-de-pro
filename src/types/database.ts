// Hand-written row types. Later you can replace with generated types:
// npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts

export interface Restaurant {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_image_url: string | null
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  currency: string
  timezone: string
  opening_time: string | null
  closing_time: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantSettings {
  id: string
  restaurant_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  menu_style: string
  show_prices: boolean
  show_images: boolean
  show_descriptions: boolean
  show_calories: boolean
  show_unavailable_items: boolean
  enable_ordering: boolean
  enable_whatsapp: boolean
  enable_call_waiter: boolean
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_non_vegetarian: boolean
  is_spicy: boolean
  preparation_time: number | null
  calories: number | null
  display_order: number
}
