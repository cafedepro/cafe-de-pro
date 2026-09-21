import { z } from 'zod'

export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Enter the restaurant name').max(120),
  slug: z
    .string()
    .min(3, 'Use at least 3 characters')
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens'),
  timezone: z.string().min(1, 'Choose a timezone'),
  currency: z.string().min(3).max(3),
})
export type CreateRestaurantValues = z.infer<typeof createRestaurantSchema>
