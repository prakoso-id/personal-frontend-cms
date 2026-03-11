import api from '../../api/axios'
import type { LoginRequest, LoginResponse, UpdateProfileRequest, UpdateEmailRequest, UpdatePasswordRequest, ApiResponse } from '../../types'

export function loginApi(credentials: LoginRequest) {
  return api.post<LoginResponse>('/admin/login', credentials)
}

export function updateProfileApi(data: UpdateProfileRequest) {
  const formData = new FormData()
  formData.append('full_name', data.full_name)
  formData.append('bio', data.bio || '')
  if (data.avatar) {
    formData.append('avatar', data.avatar)
  }
  if (data.resume) {
    formData.append('resume', data.resume)
  }

  return api.put<ApiResponse<any>>('/admin/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function updateEmailApi(data: UpdateEmailRequest) {
  return api.put<ApiResponse<any>>('/admin/update-email', data)
}

export function updatePasswordApi(data: UpdatePasswordRequest) {
  return api.put<ApiResponse<any>>('/admin/update-password', data)
}
