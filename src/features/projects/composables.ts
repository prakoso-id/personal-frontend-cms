import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './api'
import { fetchSkills } from '../skills/api'
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  Project,
  PaginatedResponse,
} from '../../types'

export function useProjects(page: Ref<number>, limit: Ref<number>) {
  return useQuery({
    queryKey: ['projects', { page, limit }],
    queryFn: async () => {
      const { data: response } = await fetchProjects(page.value, limit.value)
      return response.data // ApiResponse.data => PaginatedResponse
    },
  })
}

export function useProjectById(id: Ref<string | undefined>) {
  return useQuery({
    queryKey: ['projects', 'detail', id],
    queryFn: async () => {
      if (!id.value) return null
      const { data: response } = await fetchProjectById(id.value)
      return response.data.data.find((p: Project) => p.ID === id.value) ?? null
    },
    enabled: () => !!id.value,
  })
}

export function useSkills() {
  return useQuery({
    queryKey: ['skills', 'all'],
    queryFn: async () => {
      // Fetch with a high limit to get all skills for the dropdown
      const { data: response } = await fetchSkills(1, 100)
      return response.data.data // ApiResponse.data.data => Skill[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] })

      const previousData = queryClient.getQueriesData<PaginatedResponse<Project>>({
        queryKey: ['projects'],
      })

      queryClient.setQueriesData<PaginatedResponse<Project>>(
        { queryKey: ['projects'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((p) => p.ID !== deletedId),
            meta: { ...old.meta, total_data: old.meta.total_data - 1 },
          }
        }
      )

      return { previousData }
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          if (data) queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
