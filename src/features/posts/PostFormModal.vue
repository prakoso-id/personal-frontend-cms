<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="modal post-form-modal"
      >
        <div class="modal-header">
          <h2 :id="titleId" class="modal-title">{{ isEdit ? 'Edit Post' : 'New Post' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Close dialog">✕</button>
        </div>

        <div class="alert alert-error" v-if="submitError" role="alert">
          {{ submitError }}
        </div>

        <form @submit="onSubmit" class="modal-body">
          <div class="form-layout">
            <!-- Main Content -->
            <div class="form-main">
              <div class="form-group">
                <label class="form-label" for="post-title">Title</label>
                <input
                  id="post-title"
                  v-model="title"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': errors.title }"
                  :aria-invalid="!!errors.title"
                  :aria-describedby="errors.title ? 'post-title-error' : undefined"
                  placeholder="Enter post title..."
                />
                <div id="post-title-error" class="form-error" v-if="errors.title" role="alert">{{ errors.title }}</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="post-summary">Summary</label>
                <textarea
                  id="post-summary"
                  v-model="summary"
                  class="form-textarea"
                  placeholder="Brief summary of the post..."
                  rows="2"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" id="content-label">Content</label>
                <RichEditor
                  v-model="content_markdown"
                  placeholder="Write your post content..."
                  aria-labelledby="content-label"
                />
                <div class="form-error" v-if="errors.content_markdown" role="alert">{{ errors.content_markdown }}</div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="form-sidebar">
              <!-- Publish Settings -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Settings</h4>
                <label class="form-check">
                  <input type="checkbox" v-model="is_published" />
                  <span>Publish immediately</span>
                </label>
                <div class="form-hint">When unchecked, saved as draft.</div>
              </div>

              <!-- Tags -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Tags</h4>
                <div class="tag-list mb-md" v-if="tags && tags.length > 0">
                  <span class="tag-item" v-for="(tag, i) in tags" :key="i">
                    {{ tag }}
                    <button
                      type="button"
                      class="tag-remove"
                      @click="removeTag(i)"
                      :aria-label="`Remove tag ${tag}`"
                    >×</button>
                  </span>
                </div>
                <div class="flex gap-sm">
                  <label class="sr-only" for="new-tag">Add a tag</label>
                  <input
                    id="new-tag"
                    v-model="newTag"
                    type="text"
                    class="form-input"
                    placeholder="Add a tag..."
                    @keydown.enter.prevent="addTag"
                  />
                  <button type="button" class="btn btn-secondary btn-sm" @click="addTag">Add</button>
                </div>
              </div>

              <!-- Images -->
              <div class="sidebar-section">
                <ImagePicker v-model="images" />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="createMutation.isPending.value || updateMutation.isPending.value"
            >
              <span class="spinner" v-if="createMutation.isPending.value || updateMutation.isPending.value" aria-hidden="true"></span>
              {{ isEdit ? 'Update Post' : 'Create Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { postSchema } from './schemas'
import { usePostById, useCreatePost, useUpdatePost } from './composables'
import ImagePicker from '../../components/ImagePicker.vue'
import RichEditor from '../../components/RichEditor.vue'
import { useToast } from '../../composables/useToast'
import { useFocusTrap } from '../../composables/useFocusTrap'
import type { ImageUploadResult } from '../../types'
import type { AxiosError } from 'axios'

const props = defineProps<{
  postId?: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `post-modal-title-${Math.random().toString(36).slice(2, 8)}`

const editId = toRef(props, 'postId')
const isEdit = computed(() => !!editId.value)

const { data: existingPost } = usePostById(editId as any)
const createMutation = useCreatePost()
const updateMutation = useUpdatePost()

const submitError = ref('')
const toast = useToast()

useFocusTrap(dialogRef, {
  onEscape: () => emit('close'),
})

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(postSchema),
  initialValues: {
    title: '',
    summary: '',
    content_markdown: '',
    tags: [] as string[],
    is_published: false,
    images: [] as ImageUploadResult[],
  },
})

const { value: title } = useField<string>('title')
const { value: summary } = useField<string>('summary')
const { value: content_markdown } = useField<string>('content_markdown')
const { value: tags } = useField<string[]>('tags')
const { value: is_published } = useField<boolean>('is_published')
const { value: images } = useField<ImageUploadResult[]>('images')

const newTag = ref('')

// Pre-fill form when editing
watch(existingPost, (post) => {
  if (post) {
    setValues({
      title: post.Title,
      summary: post.Summary || '',
      content_markdown: post.ContentMarkdown || '',
      tags: post.Tags?.map((t) => t.Name) ?? [],
      is_published: post.IsPublished,
      images: post.Images?.map((img) => ({
        id: img.ID,
        file_name: img.FileName,
        file_path: img.FilePath,
        mime_type: img.MimeType,
        size: img.Size,
      })) ?? [],
    })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  submitError.value = ''
  try {
    if (isEdit.value && editId.value) {
      await updateMutation.mutateAsync({ id: editId.value, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    toast.success(isEdit.value ? 'Post updated successfully' : 'Post created successfully')
    emit('saved')
  } catch (err: any) {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to save post. Please try again.'
    submitError.value = msg
    toast.error(msg)
  }
})

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value = [...tags.value, tag]
  }
  newTag.value = ''
}

function removeTag(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
}
</script>

<style scoped>
.post-form-modal {
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-lg);
}

.modal-body {
  overflow-y: auto;
  flex: 1;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.sidebar-section {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.sidebar-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-lg);
}

.mb-md {
  margin-bottom: var(--space-md);
}
</style>
