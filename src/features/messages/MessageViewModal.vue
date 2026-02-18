<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-modal-title"
        class="modal message-modal"
      >
        <div class="modal-header">
          <h2 id="message-modal-title" class="modal-title">Message Details</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Close dialog">✕</button>
        </div>

        <div class="modal-body" v-if="message">
          <div class="message-meta">
            <div class="meta-item">
              <span class="meta-label">From:</span>
              <span class="meta-value">{{ message.Name }} &lt;{{ message.Email }}&gt;</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Subject:</span>
              <span class="meta-value">{{ message.Subject }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date:</span>
              <span class="meta-value">{{ formatDate(message.CreatedAt) }}</span>
            </div>
          </div>

          <div class="message-content">
            {{ message.Message }}
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-primary" @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'
import type { ContactMessage } from '../../types'

defineProps<{
  message?: ContactMessage
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)

useFocusTrap(dialogRef, {
  onEscape: () => emit('close'),
})

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}
</script>

<style scoped>
.message-modal {
  max-width: 600px;
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

.message-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px dashed var(--border-color);
}

.meta-item {
  display: flex;
  gap: var(--space-sm);
}

.meta-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 70px;
}

.meta-value {
  color: var(--text-primary);
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-lg);
  margin-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}
</style>
