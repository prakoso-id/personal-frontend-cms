import { useQuery } from '@tanstack/vue-query'
import { fetchMessages } from './api'

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data: response } = await fetchMessages()
      return response.data
    },
  })
}
