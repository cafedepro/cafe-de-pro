import { z } from 'zod'

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\+?[\d\s()-]{6,20}$/.test(v), 'Enter a valid phone number')

export const restaurantProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter the restaurant name').max(120),
    description: z.string().trim().max(500, 'Use 500 characters or fewer'),
    phone: optionalPhone,
    whatsapp_number: optionalPhone,
    email: z
      .string()
      .trim()
      .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address'),
    address: z.string().trim().max(200),
    city: z.string().trim().max(80),
    state: z.string().trim().max(80),
    country: z.string().trim().max(80),
    opening_time: z.string(),
    closing_time: z.string(),
    timezone: z.string().min(1, 'Choose a timezone'),
    currency: z.string().length(3),
    is_active: z.boolean(),
  })
  .refine((v) => (v.opening_time === '') === (v.closing_time === ''), {
    message: 'Set both opening and closing time, or leave both empty',
    path: ['closing_time'],
  })

export type RestaurantProfileValues = z.infer<typeof restaurantProfileSchema>
