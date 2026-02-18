import api from '../../api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Skill,
} from '../../types'

export function fetchProjects(page: number, limit: number) {
  return api.get<ApiResponse<PaginatedResponse<Project>>>('/admin/projects', {
    params: { page, limit },
  })
}

export function fetchProjectById(_id: string) {
  return api.get<ApiResponse<PaginatedResponse<Project>>>('/admin/projects', {
    params: { page: 1, limit: 100 },
  })
}

export function createProject(data: CreateProjectRequest) {
  return api.post<ApiResponse<Project>>('/admin/projects', data)
}

export function updateProject(id: string, data: UpdateProjectRequest) {
  return api.put<ApiResponse<Project>>(`/admin/projects/${id}`, data)
}

export function deleteProject(id: string) {
  return api.delete(`/admin/projects/${id}`)
}


