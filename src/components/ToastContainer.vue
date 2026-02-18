<template>
  <Teleport to="body">
    <div
      class="toast-container"
      role="status"
      aria-live="polite"
      v-if="toasts.length > 0"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          :role="toast.type === 'error' ? 'alert' : undefined"
          :aria-live="toast.type === 'error' ? 'assertive' : undefined"
          @click="removeToast(toast.id)"
        >
          <span class="toast-icon" aria-hidden="true">
            <template v-if="toast.type === 'success'">✓</template>
            <template v-else-if="toast.type === 'error'">✕</template>
            <template v-else-if="toast.type === 'warning'">⚠</template>
            <template v-else>ℹ</template>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click.stop="removeToast(toast.id)"
            aria-label="Dismiss notification"
          >×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-xl);
  right: var(--space-xl);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  pointer-events: all;
  border: 1px solid transparent;
  background: var(--bg-card);
}

.toast-success {
  border-color: var(--accent-success);
  color: var(--accent-success);
}

.toast-error {
  border-color: var(--accent-danger);
  color: var(--accent-danger);
}

.toast-warning {
  border-color: var(--accent-warning);
  color: var(--accent-warning);
}

.toast-info {
  border-color: var(--accent-info);
  color: var(--accent-info);
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  padding: 4px;
  line-height: 1;
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.toast-close:hover {
  opacity: 1;
}

/* Transitions */
.toast-enter-active {
  animation: toastIn 0.2s ease;
}
.toast-leave-active {
  animation: toastOut 0.15s ease forwards;
}
.toast-move {
  transition: transform 0.2s ease;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(40px);
  }
}

@media (max-width: 480px) {
  .toast-container {
    right: var(--space-md);
    left: var(--space-md);
    max-width: none;
  }
}
</style>
