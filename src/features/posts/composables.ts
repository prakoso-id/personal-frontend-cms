import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { fetchPosts, createPost, updatePost, deletePost, fetchPostById } from './api'
import type { CreatePostRequest, UpdatePostRequest, Post, PaginatedResponse } from '../../types'

export function usePosts(page: Ref<number>, limit: Ref<number>) {
  return useQuery({
    queryKey: ['posts', { page, limit }],
    queryFn: async () => {
      const { data: response } = await fetchPosts(page.value, limit.value)
      return response.data // ApiResponse.data => PaginatedResponse
    },
  })
}

export function usePostById(id: Ref<string | undefined>) {
  return useQuery({
    queryKey: ['posts', 'detail', id],
    queryFn: async () => {
      if (!id.value) return null
      const { data: response } = await fetchPostById(id.value)
      return response.data.data.find((p: Post) => p.ID === id.value) ?? null
    },
    enabled: () => !!id.value,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) =>
      updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      const previousData = queryClient.getQueriesData<PaginatedResponse<Post>>({
        queryKey: ['posts'],
      })

      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['posts'] },
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
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
