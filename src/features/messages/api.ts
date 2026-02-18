import api from '../../api/axios'
import type { ApiResponse, ContactMessage } from '../../types'

export function fetchMessages() {
  return api.get<ApiResponse<ContactMessage[]>>('/admin/messages')
}
