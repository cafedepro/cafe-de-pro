import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a category name').max(80, 'Use 80 characters or fewer'),
  description: z.string().trim().max(200, 'Use 200 characters or fewer'),
})
export type CategoryValues = z.infer<typeof categorySchema>
