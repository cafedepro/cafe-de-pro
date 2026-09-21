export interface PublicRestaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  currency: string;
  timezone: string;
  opening_time: string | null;
  closing_time: string | null;
}

export interface PublicCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface PublicMenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_non_vegetarian: boolean;
  is_spicy: boolean;
  preparation_time: number | null;
  calories: number | null;
  display_order: number;
}

export interface PublicMenuData {
  restaurant: PublicRestaurant;
  categories: PublicCategory[];
  itemsByCategory: Record<string, PublicMenuItem[]>;
}
