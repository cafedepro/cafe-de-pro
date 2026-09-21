import type { Category, MenuItem, Restaurant, RestaurantSettings } from './database'

export interface ItemVariant {
  id: string
  restaurant_id: string
  menu_item_id: string
  name: string
  price: number
  display_order: number
}

export interface AddOn {
  id: string
  restaurant_id: string
  menu_item_id: string
  name: string
  price: number
  is_available: boolean
  display_order: number
}

export interface PublicMenu {
  restaurant: Restaurant
  settings: RestaurantSettings
  categories: Category[]
  items: MenuItem[]
  variants: ItemVariant[]
  addOns: AddOn[]
}
