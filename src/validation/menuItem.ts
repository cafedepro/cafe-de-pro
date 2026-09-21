import { z } from 'zod'

const optionalNumber = (label: string) =>
  z.string().refine((v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), `Enter a valid ${label}`)

const optionalWholeNumber = (label: string) =>
  z.string().refine((v) => v.trim() === '' || /^\d+$/.test(v.trim()), `Enter ${label} as a whole number`)

export const menuItemSchema = z.object({
  name: z.string().trim().min(1, 'Enter the item name').max(120, 'Use 120 characters or fewer'),
  category_id: z.string().min(1, 'Choose a category'),
  description: z.string().trim().max(500, 'Use 500 characters or fewer'),
  price: z
    .string()
    .refine((v) => v.trim() !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid price'),
  original_price: optionalNumber('price'),
  diet: z.enum(['veg', 'non_veg', 'vegan', 'none']),
  is_spicy: z.boolean(),
  is_featured: z.boolean(),
  is_available: z.boolean(),
  image_url: z.string(),
  preparation_time: optionalWholeNumber('minutes'),
  calories: optionalWholeNumber('calories'),
})
export type MenuItemFormValues = z.infer<typeof menuItemSchema>
