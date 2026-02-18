import api from '../../api/axios'
import type {
    ApiResponse,
    PaginatedResponse,
    Experience,
    CreateExperienceRequest,
    UpdateExperienceRequest,
} from '../../types'

const PUBLIC_URL = '/public/experiences'
const ADMIN_URL = '/admin/experiences'

export function fetchPublicExperiences() {
    return api.get<ApiResponse<Experience[]>>(PUBLIC_URL)
}

export function fetchAdminExperiences() {
    return api.get<ApiResponse<Experience[]>>(ADMIN_URL)
}

export function createExperience(data: CreateExperienceRequest) {
    return api.post<ApiResponse<Experience>>(ADMIN_URL, data)
}

export function updateExperience(id: string, data: UpdateExperienceRequest) {
    return api.put<ApiResponse<Experience>>(`${ADMIN_URL}/${id}`, data)
}

export function deleteExperience(id: string) {
    return api.delete<ApiResponse<null>>(`${ADMIN_URL}/${id}`)
}
