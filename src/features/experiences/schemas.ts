import { z } from 'zod'

export const experienceSchema = z.object({
    company: z.string().min(1, 'Company is required'),
    position: z.string().min(1, 'Position is required'),
    description: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    is_current: z.boolean(),
})

export type ExperienceFormValues = z.infer<typeof experienceSchema>
