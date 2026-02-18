<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="modal project-form-modal"
      >
        <div class="modal-header">
          <h2 :id="titleId" class="modal-title">{{ isEdit ? 'Edit Project' : 'New Project' }}</h2>
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
                <label class="form-label" for="project-title">Title</label>
                <input
                  id="project-title"
                  v-model="title"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': errors.title }"
                  :aria-invalid="!!errors.title"
                  :aria-describedby="errors.title ? 'project-title-error' : undefined"
                  placeholder="Enter project title..."
                />
                <div id="project-title-error" class="form-error" v-if="errors.title" role="alert">{{ errors.title }}</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="project-description">Description</label>
                <textarea
                  id="project-description"
                  v-model="description"
                  class="form-textarea"
                  placeholder="Brief description of the project..."
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" id="content-label">Content (Markdown)</label>
                <RichEditor
                  v-model="content_markdown"
                  placeholder="Write detailed project content..."
                  aria-labelledby="content-label"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="demo_url">Demo URL</label>
                  <input
                    id="demo_url"
                    v-model="demo_url"
                    type="url"
                    class="form-input"
                    placeholder="https://demo.example.com"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="repo_url">Repository URL</label>
                  <input
                    id="repo_url"
                    v-model="repo_url"
                    type="url"
                    class="form-input"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="start_date">Start Date</label>
                  <input
                    id="start_date"
                    v-model="start_date"
                    type="date"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="end_date">End Date</label>
                  <input
                    id="end_date"
                    v-model="end_date"
                    type="date"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="form-sidebar">
              <!-- Settings -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Settings</h4>
                <label class="form-check">
                  <input type="checkbox" v-model="is_featured" />
                  <span>Featured project</span>
                </label>
                <div class="form-hint">Featured projects are highlighted on your website.</div>
              </div>

              <!-- Experience -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Associated Experience</h4>
                <div v-if="experiencesLoading" class="loading-center" style="padding: var(--space-md);">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="experiences.length === 0" class="empty-text">
                  No experiences found.
                </div>
                <div v-else>
                  <select class="form-select" v-model="experience_id">
                    <option value="">None</option>
                    <option v-for="exp in experiences" :key="exp.ID" :value="exp.ID">
                      {{ exp.Company }} - {{ exp.Position }}
                    </option>
                  </select>
                  <div class="form-hint">Link this project to a work experience</div>
                </div>
              </div>

              <!-- Skills -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Skills</h4>
                <div v-if="skillsLoading" class="loading-center" style="padding: var(--space-md);">
                  <div class="spinner"></div>
                </div>
                <div v-else>
                  <div class="tag-list mb-lg" v-if="skill_ids && skill_ids.length > 0">
                    <span class="tag-item" v-for="id in skill_ids" :key="id">
                      {{ getSkillName(id) }}
                      <span class="tag-remove" @click="removeSkill(id)" role="button" tabindex="0" :aria-label="`Remove skill ${getSkillName(id)}`">×</span>
                    </span>
                  </div>
                  <select
                    class="form-select"
                    @change="addSkill($event)"
                    aria-label="Add a skill"
                  >
                    <option value="">Add a skill...</option>
                    <option
                      v-for="skill in availableSkills"
                      :key="skill.ID"
                      :value="skill.ID"
                    >
                      {{ skill.Name }} ({{ skill.Category }})
                    </option>
                  </select>
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
              {{ isEdit ? 'Update Project' : 'Create Project' }}
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
import { projectSchema } from './schemas'
import { useProjectById, useCreateProject, useUpdateProject, useSkills } from './composables'
import { fetchAdminExperiences } from '../experiences/api'
import ImagePicker from '../../components/ImagePicker.vue'
import RichEditor from '../../components/RichEditor.vue'
import { useToast } from '../../composables/useToast'
import { useFocusTrap } from '../../composables/useFocusTrap'
import type { ImageUploadResult } from '../../types'
import type { AxiosError } from 'axios'

const props = defineProps<{
  projectId?: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `project-modal-title-${Math.random().toString(36).slice(2, 8)}`

const editId = toRef(props, 'projectId')
const isEdit = computed(() => !!editId.value)

const { data: existingProject } = useProjectById(editId as any)
const { data: allSkills, isPending: skillsLoading } = useSkills()
const createMutation = useCreateProject()
const updateMutation = useUpdateProject()

const submitError = ref('')
const toast = useToast()

useFocusTrap(dialogRef, {
  onEscape: () => emit('close'),
})

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(projectSchema),
  initialValues: {
    title: '',
    description: '',
    content_markdown: '',
    demo_url: '',
    repo_url: '',
    start_date: '',
    end_date: '',
    is_featured: false,
    experience_id: '',
    skill_ids: [] as string[],
    images: [] as ImageUploadResult[],
  },
})

const { value: title } = useField<string>('title')
const { value: description } = useField<string>('description')
const { value: content_markdown } = useField<string>('content_markdown')
const { value: demo_url } = useField<string>('demo_url')
const { value: repo_url } = useField<string>('repo_url')
const { value: start_date } = useField<string>('start_date')
const { value: end_date } = useField<string>('end_date')
const { value: is_featured } = useField<boolean>('is_featured')
const { value: skill_ids } = useField<string[]>('skill_ids')
const { value: images } = useField<ImageUploadResult[]>('images')
const { value: experience_id } = useField<string>('experience_id')

import { useQuery } from '@tanstack/vue-query'
const { data: experiencesResponse, isLoading: experiencesLoading } = useQuery({
  queryKey: ['experiences', 'admin'],
  queryFn: fetchAdminExperiences
})

const experiences = computed(() => (experiencesResponse.value?.data?.data || []) as any[])

const availableSkills = computed(() => {
  if (!allSkills.value) return []
  return allSkills.value.filter((s) => !skill_ids.value.includes(s.ID))
})

function getSkillName(id: string) {
  return allSkills.value?.find((s) => s.ID === id)?.Name ?? id
}

function addSkill(event: Event) {
  const select = event.target as HTMLSelectElement
  const id = select.value
  if (id && !skill_ids.value.includes(id)) {
    skill_ids.value = [...skill_ids.value, id]
  }
  select.value = ''
}

function removeSkill(id: string) {
  skill_ids.value = skill_ids.value.filter((s) => s !== id)
}

// Pre-fill form when editing
watch(existingProject, (project) => {
  if (project) {
    setValues({
      title: project.Title,
      description: project.Description || '',
      content_markdown: project.ContentMarkdown || '',
      demo_url: project.DemoURL || '',
      repo_url: project.RepoURL || '',
      start_date: project.StartDate?.split('T')[0] || '',
      end_date: project.EndDate?.split('T')[0] || '',
      is_featured: project.IsFeatured,
      experience_id: project.ExperienceID || '',
      skill_ids: project.Skills?.map((s) => s.ID) ?? [],
      images: project.Images?.map((img) => ({
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
    toast.success(isEdit.value ? 'Project updated successfully' : 'Project created successfully')
    emit('saved')
  } catch (err: any) {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to save project. Please try again.'
    submitError.value = msg
    toast.error(msg)
  }
})
</script>

<style scoped>
.project-form-modal {
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
  grid-template-columns: 1fr 280px;
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 900px) {
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

.mb-lg {
  margin-bottom: var(--space-lg);
}

.empty-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
  padding: var(--space-xs) 0;
}
</style>
