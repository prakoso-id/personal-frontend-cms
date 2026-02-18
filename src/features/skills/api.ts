import api from '../../api/axios'
import type { ApiResponse, PaginatedResponse, Skill, CreateSkillRequest, UpdateSkillRequest } from '../../types'

export function fetchSkills(page = 1, limit = 10) {
  return api.get<ApiResponse<PaginatedResponse<Skill>>>('/public/skills', {
    params: { page, limit },
  })
}

export function createSkill(data: CreateSkillRequest) {
  return api.post<ApiResponse<Skill>>('/admin/skills', data)
}

export function updateSkill(id: string, data: UpdateSkillRequest) {
  return api.put<ApiResponse<Skill>>(`/admin/skills/${id}`, data)
}

export function deleteSkill(id: string) {
  return api.delete<ApiResponse<null>>(`/admin/skills/${id}`)
}
