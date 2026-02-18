import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { loginApi, updateProfileApi, updateEmailApi, updatePasswordApi } from './api'
import api from '../../api/axios' // Direct axios access for profile fetch if needed
import type { LoginRequest, UpdateProfileRequest, UpdateEmailRequest, UpdatePasswordRequest, Profile } from '../../types'

export function useLogin() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: (response) => {
      const token = response.data.data.token
      const user = response.data.data.user
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      router.push({ name: 'Dashboard' })
    },
  })

  return mutation
}

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const isAuthenticated = computed(() => {
    return !!localStorage.getItem('admin_token')
  })

  const user = computed(() => {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  })

  function logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    queryClient.clear()
    router.push({ name: 'Login' })
  }

  return {
    isAuthenticated,
    user,
    logout,
  }
}

// Profile Updates
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileApi(data),
  })
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: (data: UpdateEmailRequest) => updateEmailApi(data),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => updatePasswordApi(data),
  })
}

// Fetch Profile (Public) - Reusing here for convenience, though it might belong in features/profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Profile }>('/public/profile')
      return data.data
    },
  })
}
