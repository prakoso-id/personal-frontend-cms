<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        class="modal profile-modal"
      >
        <div class="modal-header">
          <h2 id="profile-modal-title" class="modal-title">Update Profile</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Close dialog">✕</button>
        </div>

        <div class="modal-tabs" role="tablist">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'general' }"
            role="tab"
            :aria-selected="activeTab === 'general'"
            aria-controls="tab-general"
            @click="activeTab = 'general'"
          >
            General
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'security' }"
            role="tab"
            :aria-selected="activeTab === 'security'"
            aria-controls="tab-security"
            @click="activeTab = 'security'"
          >
            Security
          </button>
        </div>

        <div class="modal-body">
          <!-- General Tab -->
          <div
            v-if="activeTab === 'general'"
            id="tab-general"
            role="tabpanel"
            class="tab-content"
          >
            <form @submit.prevent="handleUpdateProfile">
              <div class="form-group">
                <label class="form-label" for="full-name">Full Name</label>
                <input
                  id="full-name"
                  v-model="profileForm.full_name"
                  type="text"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="bio">Bio</label>
                <textarea
                  id="bio"
                  v-model="profileForm.bio"
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="avatar-url">Avatar URL</label>
                <input
                  id="avatar-url"
                  v-model="profileForm.avatar_url"
                  type="text"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="resume-url">Resume URL</label>
                <input
                  id="resume-url"
                  v-model="profileForm.resume_url"
                  type="text"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>

              <div class="modal-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="profileMutation.isPending.value"
                >
                  <span class="spinner" v-if="profileMutation.isPending.value" aria-hidden="true"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <!-- Security Tab -->
          <div
            v-if="activeTab === 'security'"
            id="tab-security"
            role="tabpanel"
            class="tab-content"
          >
            <!-- Update Email -->
            <form @submit.prevent="handleUpdateEmail" class="mb-lg">
              <h3 class="section-title">Update Email</h3>
              <div class="form-group">
                <label class="form-label" for="email">New Email</label>
                <input
                  id="email"
                  v-model="emailForm.email"
                  type="email"
                  class="form-input"
                  required
                />
              </div>
              <div class="modal-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="emailMutation.isPending.value"
                >
                  <span class="spinner" v-if="emailMutation.isPending.value" aria-hidden="true"></span>
                  Update Email
                </button>
              </div>
            </form>

            <hr class="separator" />

            <!-- Update Password -->
            <form @submit.prevent="handleUpdatePassword">
              <h3 class="section-title">Update Password</h3>
              <div class="form-group">
                <label class="form-label" for="password">New Password</label>
                <input
                  id="password"
                  v-model="passwordForm.password"
                  type="password"
                  class="form-input"
                  required
                  minlength="6"
                />
                <div class="form-hint">Minimum 6 characters</div>
              </div>
              <div class="modal-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="passwordMutation.isPending.value"
                >
                  <span class="spinner" v-if="passwordMutation.isPending.value" aria-hidden="true"></span>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUpdateProfile, useUpdateEmail, useUpdatePassword, useProfile } from '../../features/auth/composables'
import { useToast } from '../../composables/useToast'
import { useFocusTrap } from '../../composables/useFocusTrap'
import type { AxiosError } from 'axios'

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<'general' | 'security'>('general')
const modalRef = ref<HTMLElement | null>(null)
const toast = useToast()

useFocusTrap(modalRef, {
  onEscape: () => emit('close'),
})

// Hooks
const { data: profile } = useProfile()
const profileMutation = useUpdateProfile()
const emailMutation = useUpdateEmail()
const passwordMutation = useUpdatePassword()

// Forms
const profileForm = reactive({
  full_name: '',
  bio: '',
  avatar_url: '',
  resume_url: '',
})

const emailForm = reactive({
  email: '',
})

const passwordForm = reactive({
  password: '',
})

// Initialize form
watch(profile, (newProfile) => {
  if (newProfile) {
    profileForm.full_name = newProfile.FullName
    profileForm.bio = newProfile.Bio
    profileForm.avatar_url = newProfile.AvatarURL
    profileForm.resume_url = newProfile.ResumeURL
  }
}, { immediate: true })

// Handlers
async function handleUpdateProfile() {
  try {
    await profileMutation.mutateAsync(profileForm)
    toast.success('Profile updated successfully')
  } catch (err: any) {
    handleError(err)
  }
}

async function handleUpdateEmail() {
  try {
    await emailMutation.mutateAsync(emailForm)
    toast.success('Email updated successfully')
    emailForm.email = ''
  } catch (err: any) {
    handleError(err)
  }
}

async function handleUpdatePassword() {
  try {
    await passwordMutation.mutateAsync(passwordForm)
    toast.success('Password updated successfully')
    passwordForm.password = ''
  } catch (err: any) {
    handleError(err)
  }
}

function handleError(err: any) {
  const axiosErr = err as AxiosError<{ error?: string; message?: string }>
  const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Operation failed'
  toast.error(msg)
}
</script>

<style scoped>
.profile-modal {
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-lg);
}

.tab-btn {
  background: none;
  border: none;
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.separator {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--space-xl) 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.mb-lg {
  margin-bottom: var(--space-lg);
}
</style>
