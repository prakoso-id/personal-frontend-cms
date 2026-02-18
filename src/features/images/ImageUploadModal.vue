<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal upload-modal">
        <div class="modal-title">Upload Image</div>

        <div class="alert alert-error" v-if="uploadMutation.isError.value">
          Upload failed. Please try again.
        </div>

        <!-- Upload Zone -->
        <div
          v-if="!previewUrl"
          class="upload-zone"
          :class="{ 'drag-over': isDragging }"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @click="triggerFileInput"
        >
          <div class="upload-zone-icon">📁</div>
          <div class="upload-zone-text">Drop an image here or click to browse</div>
          <div class="upload-zone-hint">PNG, JPG, WebP up to 5MB</div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <!-- Preview -->
        <div v-else class="upload-preview">
          <img :src="previewUrl" :alt="selectedFile?.name" />
          <div class="upload-preview-info">
            <span class="upload-preview-name">{{ selectedFile?.name }}</span>
            <span class="upload-preview-size">{{ formatSize(selectedFile?.size || 0) }}</span>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" @click="clearFile">✕ Remove</button>
        </div>

        <!-- Progress -->
        <div class="upload-progress" v-if="uploadMutation.isPending.value">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="text-muted" style="font-size: 0.8rem;">Uploading...</span>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="$emit('close')" :disabled="uploadMutation.isPending.value">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            :disabled="!selectedFile || uploadMutation.isPending.value"
            @click="handleUpload"
          >
            <span class="spinner" v-if="uploadMutation.isPending.value"></span>
            Upload
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUploadImage } from './composables'

const emit = defineEmits<{
  close: []
  uploaded: []
}>()

const uploadMutation = useUploadImage()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const isDragging = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    setFile(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    setFile(file)
  }
}

function setFile(file: File) {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function clearFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = ''
}

function handleUpload() {
  if (selectedFile.value) {
    uploadMutation.mutate(selectedFile.value, {
      onSuccess: () => {
        clearFile()
        emit('uploaded')
      },
    })
  }
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.upload-modal {
  max-width: 520px;
}

.upload-preview {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-lg);
}

.upload-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  background: var(--bg-tertiary);
}

.upload-preview-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
}

.upload-preview-name {
  font-size: 0.85rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-preview-size {
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.upload-progress {
  margin-bottom: var(--space-lg);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  margin-bottom: var(--space-xs);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}
</style>
