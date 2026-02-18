import { z } from 'zod'

const imageUploadResultSchema = z.object({
  file_name: z.string(),
  file_path: z.string(),
  mime_type: z.string(),
  size: z.number(),
})

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  content_markdown: z.string(),
  demo_url: z.string(),
  repo_url: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  is_featured: z.boolean(),
  experience_id: z.string().optional(),
  skill_ids: z.array(z.string()),
  images: z.array(imageUploadResultSchema),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
