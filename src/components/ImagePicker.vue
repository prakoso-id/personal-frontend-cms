<template>
  <div class="image-picker">
    <div class="image-picker-header">
      <label class="form-label">Images</label>
      <button type="button" class="btn btn-secondary btn-sm" @click="openUpload">
        ＋ Upload Image
      </button>
    </div>

    <!-- Upload zone -->
    <div
      v-if="showUpload"
      class="upload-zone"
      :class="{ 'drag-over': isDragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @click="triggerFileInput"
    >
      <div class="upload-zone-icon">📁</div>
      <div class="upload-zone-text">Drop images here or click to browse</div>
      <div class="upload-zone-hint">PNG, JPG, WebP up to 5MB</div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- Uploading progress -->
    <div v-if="uploadMutation.isPending.value" class="alert alert-info" style="background: var(--accent-info-muted); color: var(--accent-info); border: 1px solid rgba(59,130,246,0.25);">
      <span class="spinner"></span> Uploading...
    </div>

    <!-- Selected images -->
    <div class="image-picker-grid" v-if="modelValue.length > 0">
      <div
        v-for="(img, index) in modelValue"
        :key="index"
        class="image-picker-item"
        :class="{ 'is-primary': index === 0 }"
      >
        <img :src="img.file_path" :alt="img.file_name" />
        <div class="image-picker-item-overlay">
          <button
            type="button"
            class="btn btn-sm btn-danger"
            @click="removeImage(index, img)"
            :aria-label="`Remove image ${img.file_name}`"
          >✕</button>
        </div>
        <span class="badge badge-primary image-primary-badge" v-if="index === 0">Primary</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import api from '../api/axios'
import { deleteImage } from '../features/images/api'
import { useToast } from '../composables/useToast'
import type { ImageUploadResult, ApiResponse } from '../types'
import type { AxiosError } from 'axios'

const props = defineProps<{
  modelValue: ImageUploadResult[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ImageUploadResult[]]
}>()

const showUpload = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const toast = useToast()

const uploadMutation = useMutation({
  mutationFn: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<ApiResponse<ImageUploadResult>>('/admin/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data // unwrap ApiResponse
  },
  onSuccess: (data) => {
    // Ensure ID is present if returned, though backend might not return it in upload response immediately
    // If backend returns it, great. If not, it's a new image.
    emit('update:modelValue', [...props.modelValue, data])
    toast.success('Image uploaded successfully')
  },
  onError: (err) => {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Image upload failed. Please try again.'
    toast.error(msg)
  },
})

// Delete mutation
const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteImage(id),
  onSuccess: () => {
    toast.success('Image deleted from server')
  },
  onError: (err) => {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to delete image from server.'
    toast.error(msg)
  },
})

function openUpload() {
  showUpload.value = !showUpload.value
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach((file) => uploadMutation.mutate(file))
  }
  target.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    Array.from(e.dataTransfer.files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadMutation.mutate(file)
      }
    })
  }
}

async function removeImage(index: number, img: ImageUploadResult) {
  if (confirm('Are you sure you want to remove this image?')) {
    // If image has an ID, delete from server
    if (img.id) {
       try {
         await deleteMutation.mutateAsync(img.id)
       } catch (e) {
         // Error handled in mutation
         return
       }
    }
    
    const updated = [...props.modelValue]
    updated.splice(index, 1)
    emit('update:modelValue', updated)
  }
}


</script>

<style scoped>
.image-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.image-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.image-picker-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--border-color);
  transition: border-color var(--transition-fast);
}

.image-picker-item.is-primary {
  border-color: var(--accent-primary);
}

.image-picker-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-picker-item-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.image-picker-item:hover .image-picker-item-overlay {
  opacity: 1;
}

.image-primary-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 0.65rem;
}

.alert-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-top: var(--space-sm);
}
</style>
