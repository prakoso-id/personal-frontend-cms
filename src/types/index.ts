// ========================
// API Response Wrapper
// ========================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ========================
// Pagination Types
// ========================

export interface PaginationMeta {
  current_page: number
  limit: number
  total_data: number
  total_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiError {
  error?: string
  message?: string
}

// ========================
// Auth Types
// ========================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: string
      email: string
      fullname: string
    }
  }
}

export interface UpdateEmailRequest {
  email: string
}

export interface UpdatePasswordRequest {
  password: string
}

// ========================
// Image Types
// ========================

export interface Image {
  ID: string
  FileName: string
  FilePath: string
  AltText: string
  MimeType: string
  Size: number
  EntityID: string
  EntityType: string
  IsPrimary: boolean
  OrderIndex: number
  CreatedAt: string
}

export interface ImageUploadResult {
  id?: string
  file_name: string
  file_path: string
  mime_type: string
  size: number
}

// ========================
// Post Types
// ========================

export interface Tag {
  ID: string
  Name: string
  Slug: string
}

export interface Post {
  ID: string
  Title: string
  Slug: string
  Summary: string
  ContentMarkdown: string
  IsPublished: boolean
  PublishedAt: string | null
  Tags: Tag[]
  Images: Image[]
  CreatedAt: string
  UpdatedAt: string
}

export interface CreatePostRequest {
  title: string
  summary: string
  content_markdown: string
  tags: string[]
  is_published: boolean
  images: ImageUploadResult[]
}

export interface UpdatePostRequest {
  title: string
  summary: string
  content_markdown: string
  tags: string[]
  is_published: boolean
  images: ImageUploadResult[]
}

// ========================
// Project Types
// ========================

export interface Skill {
  ID: string
  Name: string
  Category: string
  IconURL: string
}

export interface CreateSkillRequest {
  name: string
  category: string
  icon_url?: string
}

export interface UpdateSkillRequest {
  name: string
  category: string
  icon_url?: string
}

export interface Project {
  ID: string
  Title: string
  Slug: string
  Description: string
  ContentMarkdown: string
  DemoURL: string
  RepoURL: string
  StartDate: string
  EndDate: string
  IsFeatured: boolean
  ExperienceID?: string
  Skills: Skill[]
  Images: Image[]
  CreatedAt: string
  UpdatedAt: string
}

export interface CreateProjectRequest {
  title: string
  description: string
  content_markdown: string
  demo_url: string
  repo_url: string
  start_date: string
  end_date: string
  is_featured: boolean
  experience_id?: string
  skill_ids: string[]
  images: ImageUploadResult[]
}

export interface UpdateProjectRequest {
  title: string
  description: string
  content_markdown: string
  demo_url: string
  repo_url: string
  start_date: string
  end_date: string
  is_featured: boolean
  experience_id?: string
  skill_ids: string[]
  images: ImageUploadResult[]
}

// ========================
// Profile Types
// ========================

export interface SocialLink {
  ID: string
  Platform: string
  URL: string
  OrderIndex: number
  ProfileID: string
}

export interface Experience {
  ID: string
  Company: string
  Position: string
  Description: string
  StartDate: string
  EndDate: string | null
  IsCurrent: boolean
  Projects?: Project[]
  CreatedAt: string
  UpdatedAt: string
}

export interface CreateExperienceRequest {
  company: string
  position: string
  description: string
  start_date: string
  end_date?: string
  is_current: boolean
}

export interface UpdateExperienceRequest {
  company: string
  position: string
  description: string
  start_date: string
  end_date?: string
  is_current: boolean
}

export interface Profile {
  ID: string
  FullName: string
  Bio: string
  AvatarURL: string
  ResumeURL: string
  UserID: string
  SocialLinks: SocialLink[]
  Experiences: Experience[]
  Skills: Skill[]
  CreatedAt: string
  UpdatedAt: string
}

export interface UpdateProfileRequest {
  full_name?: string
  bio?: string
  avatar_url?: string
  resume_url?: string
}

// ========================
// Contact Types
// ========================

export interface ContactMessage {
  ID: string
  Name: string
  Email: string
  Subject: string
  Message: string
  Status: string
  CreatedAt: string
}
