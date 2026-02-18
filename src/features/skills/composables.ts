import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { fetchSkills, createSkill, updateSkill, deleteSkill } from './api'
import type { CreateSkillRequest, UpdateSkillRequest, Skill, PaginatedResponse } from '../../types'

export function useSkillsList(page: Ref<number>, limit: Ref<number>) {
  return useQuery({
    queryKey: ['skills', { page, limit }],
    queryFn: async () => {
      const { data: response } = await fetchSkills(page.value, limit.value)
      return response.data
    },
  })
}

export function useCreateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSkillRequest) => createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}

export function useUpdateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSkillRequest }) =>
      updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}

export function useDeleteSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}
