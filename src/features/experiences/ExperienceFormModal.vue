<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-modal-title"
        class="modal experience-modal"
      >
        <div class="modal-header">
          <h2 id="experience-modal-title" class="modal-title">{{ isEdit ? 'Edit Experience' : 'New Experience' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Close dialog">✕</button>
        </div>
        
        <form @submit="onSubmit" class="modal-body">
            <div class="form-group">
              <label class="form-label" for="company">Company</label>
              <input
                id="company"
                v-model="company"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.company }"
                required
              />
              <div class="form-error" v-if="errors.company">{{ errors.company }}</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="position">Position</label>
              <input
                id="position"
                v-model="position"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.position }"
                required
              />
              <div class="form-error" v-if="errors.position">{{ errors.position }}</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Description</label>
              <RichEditor
                id="description"
                v-model="description"
                placeholder="Describe your role and achievements..."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="start_date">Start Date</label>
                <input
                  id="start_date"
                  v-model="start_date"
                  type="date"
                  class="form-input"
                  :class="{ 'input-error': errors.start_date }"
                  required
                />
                <div class="form-error" v-if="errors.start_date">{{ errors.start_date }}</div>
              </div>

              <div class="form-group" v-if="!is_current">
                <label class="form-label" for="end_date">End Date</label>
                <input
                  id="end_date"
                  v-model="end_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-check">
                <input type="checkbox" v-model="is_current" />
                <span>I currently work here</span>
              </label>
            </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <span class="spinner" v-if="isSubmitting" aria-hidden="true"></span>
              {{ isEdit ? 'Update Experience' : 'Create Experience' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { experienceSchema } from './schemas'
import { createExperience, updateExperience } from './api'
import { useToast } from '../../composables/useToast'
import RichEditor from '../../components/RichEditor.vue'

import type { Experience } from '../../types'
import type { AxiosError } from 'axios'

const props = defineProps<{
  experience?: Experience
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const isEdit = computed(() => !!props.experience)
const toast = useToast()
const isSubmitting = ref(false)


const modalRef = ref<HTMLElement | null>(null)

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(experienceSchema),
  initialValues: {
    company: '',
    position: '',
    description: '',
    start_date: '',
    end_date: undefined as string | undefined,
    is_current: false,
  },
})

const { value: company } = useField<string>('company')
const { value: position } = useField<string>('position')
const { value: description } = useField<string>('description')
const { value: start_date } = useField<string>('start_date')
const { value: end_date } = useField<string | undefined>('end_date')
const { value: is_current } = useField<boolean>('is_current')




// Initialize
watch(() => props.experience, (exp) => {
  if (exp) {
    setValues({
      company: exp.Company,
      position: exp.Position,
      description: exp.Description,
      start_date: exp.StartDate?.split('T')[0],
      end_date: exp.EndDate?.split('T')[0] || undefined,
      is_current: exp.IsCurrent,
    })
  }
}, { immediate: true })



const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    // If is_current, clear end_date
    if (values.is_current) {
      values.end_date = undefined
    }

    const payload = {
      ...values,
      description: values.description || '',
    }

    if (props.experience) {
      await updateExperience(props.experience.ID, payload)
      toast.success('Experience updated')
    } else {
      await createExperience(payload)
      toast.success('Experience created')
    }
    emit('saved')
  } catch (err: any) {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Operation failed'
    toast.error(msg)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<style scoped>
.experience-modal {
  max-width: 600px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .experience-modal {
    width: 95%;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}
</style>
