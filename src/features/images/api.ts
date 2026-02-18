import api from '../../api/axios'
import type { ImageUploadResult } from '../../types'

export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ImageUploadResult>('/admin/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteImage(id: string) {
  return api.delete(`/admin/images/${id}`)
}
