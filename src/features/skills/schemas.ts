import { z } from 'zod'

export const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  icon_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
