<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-overlay"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        ref="dialogRef"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
        class="modal confirm-dialog"
      >
        <h2 :id="titleId" class="modal-title">{{ title }}</h2>
        <p :id="messageId" class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button
            class="btn btn-secondary"
            @click="$emit('update:modelValue', false)"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger"
            @click="$emit('confirm')"
            :disabled="loading"
          >
            <span class="spinner" v-if="loading" aria-hidden="true"></span>
            {{ loading ? (loadingText || 'Deleting...') : (confirmText || 'Delete') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { useFocusTrap } from '../composables/useFocusTrap'

defineProps<{
  modelValue: boolean
  title: string
  message: string
  loading?: boolean
  confirmText?: string
  loadingText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `dialog-title-${Math.random().toString(36).slice(2, 8)}`
const messageId = `dialog-msg-${Math.random().toString(36).slice(2, 8)}`

useFocusTrap(dialogRef, {
  onEscape: () => emit('update:modelValue', false),
})
</script>

<style scoped>
.confirm-message {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: var(--space-md);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
}
</style>
