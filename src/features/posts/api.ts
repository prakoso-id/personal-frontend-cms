import api from '../../api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Post,
  CreatePostRequest,
  UpdatePostRequest,
} from '../../types'

export function fetchPosts(page: number, limit: number) {
  return api.get<ApiResponse<PaginatedResponse<Post>>>('/admin/posts', {
    params: { page, limit },
  })
}

export function fetchPostById(_id: string) {
  return api.get<ApiResponse<PaginatedResponse<Post>>>('/admin/posts', {
    params: { page: 1, limit: 100 },
  })
}

export function createPost(data: CreatePostRequest) {
  return api.post<ApiResponse<Post>>('/admin/posts', data)
}

export function updatePost(id: string, data: UpdatePostRequest) {
  return api.put<ApiResponse<Post>>(`/admin/posts/${id}`, data)
}

export function deletePost(id: string) {
  return api.delete(`/admin/posts/${id}`)
}
