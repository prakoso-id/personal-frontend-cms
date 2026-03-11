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
                <label class="form-label">Avatar</label>
                <div 
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleAvatarDrop"
                  @click="triggerAvatarSelect"
                >
                  <div v-if="profileForm.avatar" class="file-selected">
                    {{ profileForm.avatar.name }} <span>({{ formatSize(profileForm.avatar.size) }})</span>
                    <button type="button" @click.stop="profileForm.avatar = null" class="btn-clear text-sm">Remove New File</button>
                  </div>
                  <div v-else-if="existingAvatar" class="file-selected">
                    <span>Current: <a :href="existingAvatar" target="_blank" @click.stop>Current Avatar</a></span>
                    <span class="file-hint ml-2">Upload a new file to replace</span>
                  </div>
                  <div v-else class="file-placeholder">
                    Drag & drop image here or click to select
                    <span class="file-hint">jpg/jpeg/png/webp - max 5MB</span>
                  </div>
                  <input 
                    ref="avatarInputRef"
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" 
                    class="hidden-input" 
                    @change="handleAvatarSelect"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Resume</label>
                <div 
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleResumeDrop"
                  @click="triggerResumeSelect"
                >
                  <div v-if="profileForm.resume" class="file-selected">
                    {{ profileForm.resume.name }} <span>({{ formatSize(profileForm.resume.size) }})</span>
                    <button type="button" @click.stop="profileForm.resume = null" class="btn-clear text-sm">Remove New File</button>
                  </div>
                  <div v-else-if="existingResume" class="file-selected">
                    <span>Current: <a :href="existingResume" target="_blank" @click.stop>Current Resume</a></span>
                    <span class="file-hint ml-2">Upload a new file to replace</span>
                  </div>
                  <div v-else class="file-placeholder">
                    Drag & drop file here or click to select
                    <span class="file-hint">pdf/doc/docx - max 10MB</span>
                  </div>
                  <input 
                    ref="resumeInputRef"
                    type="file" 
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    class="hidden-input" 
                    @change="handleResumeSelect"
                  />
                </div>
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

const existingAvatar = ref('')
const existingResume = ref('')
const avatarInputRef = ref<HTMLInputElement | null>(null)
const resumeInputRef = ref<HTMLInputElement | null>(null)

// Forms
interface ProfileForm {
  full_name: string
  bio: string
  avatar: File | null
  resume: File | null
}
const profileForm = reactive<ProfileForm>({
  full_name: '',
  bio: '',
  avatar: null,
  resume: null,
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
    profileForm.avatar = null
    profileForm.resume = null
    existingAvatar.value = newProfile.AvatarURL || ''
    existingResume.value = newProfile.ResumeURL || ''
  }
}, { immediate: true })

function triggerAvatarSelect() {
  avatarInputRef.value?.click()
}
function triggerResumeSelect() {
  resumeInputRef.value?.click()
}

function handleAvatarDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSetAvatar(file)
}
function handleAvatarSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) validateAndSetAvatar(file)
  if (target) target.value = ''
}
function validateAndSetAvatar(file: File) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024
  if (!validTypes.includes(file.type)) {
    toast.error('Avatar must be JPG, PNG, or WEBP')
    return
  }
  if (file.size > maxSize) {
    toast.error('Avatar must be under 5MB')
    return
  }
  profileForm.avatar = file
}

function handleResumeDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSetResume(file)
}
function handleResumeSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) validateAndSetResume(file)
  if (target) target.value = ''
}
function validateAndSetResume(file: File) {
  const validTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  const validExts = ['.pdf', '.doc', '.docx']
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  
  const maxSize = 10 * 1024 * 1024
  if (!validTypes.includes(file.type) && !validExts.includes(fileExt)) {
    toast.error('Resume must be PDF, DOC, or DOCX')
    return
  }
  if (file.size > maxSize) {
    toast.error('Resume must be under 10MB')
    return
  }
  profileForm.resume = file
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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

.file-drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: var(--bg-secondary);
}

.file-drop-zone:hover {
  border-color: var(--accent-primary);
  background-color: var(--bg-tertiary);
}

.file-placeholder {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  color: var(--text-secondary);
}

.file-hint {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.hidden-input {
  display: none;
}

.btn-clear {
  background: none;
  border: none;
  color: var(--error-color, #ef4444);
  cursor: pointer;
}

.btn-clear:hover {
  text-decoration: underline;
}

.text-sm {
  font-size: 0.875rem;
}

.ml-2 {
  margin-left: 0.5rem;
}
</style>
