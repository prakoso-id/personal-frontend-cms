<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="modal skill-modal"
      >
        <div class="modal-header">
          <h2 :id="titleId" class="modal-title">{{ isEdit ? 'Edit Skill' : 'New Skill' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Close dialog">✕</button>
        </div>

        <div class="alert alert-error" v-if="submitError" role="alert">
          {{ submitError }}
        </div>

        <form @submit="onSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="skill-name">Name</label>
            <input
              id="skill-name"
              v-model="name"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.name }"
              placeholder="e.g. Vue.js"
            />
            <div class="form-error" v-if="errors.name">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="skill-category">Category</label>
            <input
              id="skill-category"
              v-model="category"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.category }"
              placeholder="e.g. Frontend"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="Frontend"></option>
              <option value="Backend"></option>
              <option value="DevOps"></option>
              <option value="Database"></option>
              <option value="Languages"></option>
              <option value="Tools"></option>
            </datalist>
            <div class="form-error" v-if="errors.category">{{ errors.category }}</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="icon-url">Icon URL</label>
            <div class="flex gap-sm">
              <input
                id="icon-url"
                v-model="icon_url"
                type="url"
                class="form-input"
                :class="{ 'input-error': errors.icon_url }"
                placeholder="https://icon.url/..."
              />
              <div class="icon-preview" v-if="icon_url">
                <img :src="icon_url" alt="Preview" @error="($event.target as HTMLImageElement).style.display='none'" />
              </div>
            </div>
            <div class="form-error" v-if="errors.icon_url">{{ errors.icon_url }}</div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="createMutation.isPending.value || updateMutation.isPending.value"
            >
              <span class="spinner" v-if="createMutation.isPending.value || updateMutation.isPending.value" aria-hidden="true"></span>
              {{ isEdit ? 'Update Skill' : 'Create Skill' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { skillSchema } from './schemas'
import { useCreateSkill, useUpdateSkill } from './composables'
import { useToast } from '../../composables/useToast'
import { useFocusTrap } from '../../composables/useFocusTrap'
import type { Skill } from '../../types'
import type { AxiosError } from 'axios'

const props = defineProps<{
  skill?: Skill
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `skill-modal-title-${Math.random().toString(36).slice(2, 8)}`
const isEdit = computed(() => !!props.skill)

const createMutation = useCreateSkill()
const updateMutation = useUpdateSkill()
const toast = useToast()
const submitError = ref('')

useFocusTrap(dialogRef, {
  onEscape: () => emit('close'),
})

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(skillSchema),
  initialValues: {
    name: '',
    category: '',
    icon_url: '',
  },
})

const { value: name } = useField<string>('name')
const { value: category } = useField<string>('category')
const { value: icon_url } = useField<string>('icon_url')

// Pre-fill form
watch(() => props.skill, (skill) => {
  if (skill) {
    setValues({
      name: skill.Name,
      category: skill.Category,
      icon_url: skill.IconURL || '',
    })
  } else {
    setValues({ name: '', category: '', icon_url: '' })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  submitError.value = ''
  try {
    if (isEdit.value && props.skill) {
      await updateMutation.mutateAsync({ id: props.skill.ID, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    toast.success(isEdit.value ? 'Skill updated successfully' : 'Skill created successfully')
    emit('saved')
  } catch (err: any) {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to save skill. Please try again.'
    submitError.value = msg
    toast.error(msg)
  }
})
</script>

<style scoped>
.skill-modal {
  max-width: 500px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-lg);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-lg);
}

.icon-preview {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
