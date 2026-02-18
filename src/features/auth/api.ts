import api from '../../api/axios'
import type { LoginRequest, LoginResponse, UpdateProfileRequest, UpdateEmailRequest, UpdatePasswordRequest, ApiResponse } from '../../types'

export function loginApi(credentials: LoginRequest) {
  return api.post<LoginResponse>('/admin/login', credentials)
}

export function updateProfileApi(data: UpdateProfileRequest) {
  return api.put<ApiResponse<any>>('/admin/profile', data)
}

export function updateEmailApi(data: UpdateEmailRequest) {
  return api.put<ApiResponse<any>>('/admin/update-email', data)
}

export function updatePasswordApi(data: UpdatePasswordRequest) {
  return api.put<ApiResponse<any>>('/admin/update-password', data)
}
