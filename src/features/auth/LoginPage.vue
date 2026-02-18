<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">◆</div>
        <h1 class="login-title">CMS Admin</h1>
        <p class="login-subtitle">Sign in to manage your content</p>
      </div>

      <div class="alert alert-error" v-if="loginMutation.isError.value">
        {{ getErrorMessage(loginMutation.error.value) }}
      </div>

      <form @submit="onSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="admin@example.com"
            autocomplete="email"
          />
          <div class="form-error" v-if="errors.email">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
          <div class="form-error" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-lg w-full"
          :disabled="loginMutation.isPending.value"
        >
          <span class="spinner" v-if="loginMutation.isPending.value"></span>
          {{ loginMutation.isPending.value ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>

    <!-- Decorative elements -->
    <div class="login-bg-gradient"></div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from './schemas'
import { useLogin } from './composables'
import type { AxiosError } from 'axios'

const loginMutation = useLogin()

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit((values) => {
  loginMutation.mutate(values)
})

function getErrorMessage(error: Error | null): string {
  if (!error) return 'An error occurred'
  const axiosError = error as AxiosError<{ error?: string }>
  return axiosError.response?.data?.error || 'Invalid credentials. Please try again.'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  position: relative;
  z-index: 1;
  animation: slideUp var(--transition-slow);
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.login-logo {
  font-size: 2.5rem;
  color: var(--accent-primary);
  margin-bottom: var(--space-md);
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.4));
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
  background: linear-gradient(135deg, var(--accent-primary), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-error {
  border-color: var(--accent-danger) !important;
}

.login-bg-gradient {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
