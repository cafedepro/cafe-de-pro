import { z } from 'zod'

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid colour')

export const settingsSchema = z.object({
  primary_color: hex,
  secondary_color: hex,
  accent_color: hex,
  font_family: z.string().min(1),
  show_prices: z.boolean(),
  show_images: z.boolean(),
  show_descriptions: z.boolean(),
  show_calories: z.boolean(),
  show_unavailable_items: z.boolean(),
  enable_whatsapp: z.boolean(),
})
export type SettingsValues = z.infer<typeof settingsSchema>
