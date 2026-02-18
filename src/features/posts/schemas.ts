import { z } from 'zod'

const imageUploadResultSchema = z.object({
  file_name: z.string(),
  file_path: z.string(),
  mime_type: z.string(),
  size: z.number(),
})

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string(),
  content_markdown: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()),
  is_published: z.boolean(),
  images: z.array(imageUploadResultSchema),
})

export type PostFormValues = z.infer<typeof postSchema>
