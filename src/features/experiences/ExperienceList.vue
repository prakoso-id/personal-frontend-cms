<template>
  <div class="experiences-page">
    <div class="page-header">
      <h1 class="page-title">Experiences</h1>
      <button class="btn btn-primary" @click="openCreateModal">
        ＋ Add Experience
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-center">
      <div class="spinner"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!experiences || experiences.length === 0" class="empty-state">
      <div class="empty-icon">💼</div>
      <h3>No experiences found</h3>
      <p>Add your work experience to showcase your career history.</p>
      <button class="btn btn-primary btn-sm" @click="openCreateModal">Add Experience</button>
    </div>

    <!-- List -->
    <div v-else class="experiences-list">
      <div v-for="exp in experiences" :key="exp.ID" class="experience-card">
        <div class="experience-header">
          <div class="experience-info">
            <h3 class="experience-position">{{ exp.Position }}</h3>
            <div class="experience-company">{{ exp.Company }}</div>
            <div class="experience-period">
              {{ formatDate(exp.StartDate) }} - {{ exp.EndDate ? formatDate(exp.EndDate) : 'Present' }}
            </div>
            <div v-if="exp.Projects && exp.Projects.length > 0" class="experience-projects-count">
              <span class="badge">{{ exp.Projects.length }} Project{{ exp.Projects.length > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="experience-actions">
            <button class="btn btn-ghost btn-icon" @click="editExperience(exp)" aria-label="Edit">✎</button>
            <button class="btn btn-ghost btn-icon text-danger" @click="confirmDelete(exp)" aria-label="Delete">🗑</button>
          </div>
        </div>
        <div class="experience-body">
          <div class="experience-description" v-html="exp.Description"></div>
          
          <!-- Optional: List linked projects -->
          <div v-if="exp.Projects && exp.Projects.length > 0" class="linked-projects">
            <h4>Projects:</h4>
            <ul>
              <li v-for="proj in exp.Projects" :key="proj.ID">
                {{ proj.Title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ExperienceFormModal
      v-if="showModal"
      :experience="selectedExperience"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminExperiences, deleteExperience } from './api'
import ExperienceFormModal from './ExperienceFormModal.vue'
import { useToast } from '../../composables/useToast'
import type { Experience } from '../../types'

const queryClient = useQueryClient()
const toast = useToast()

const showModal = ref(false)
const selectedExperience = ref<Experience | undefined>(undefined)

const { data: experiencesResponse, isLoading } = useQuery({
  queryKey: ['experiences', 'admin'],
  queryFn: fetchAdminExperiences,
})

const experiences = ref<Experience[]>([])

// Sync data
import { watch } from 'vue'
watch(experiencesResponse, (newVal) => {
  if (newVal?.data?.data) {
    experiences.value = newVal.data.data
  }
})

const deleteMutation = useMutation({
  mutationFn: deleteExperience,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
    toast.success('Experience deleted successfully')
  },
  onError: () => {
    toast.error('Failed to delete experience')
  },
})

function openCreateModal() {
  selectedExperience.value = undefined
  showModal.value = true
}

function editExperience(exp: Experience) {
  selectedExperience.value = exp
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedExperience.value = undefined
}

function handleSaved() {
  closeModal()
  queryClient.invalidateQueries({ queryKey: ['experiences'] })
}

function confirmDelete(exp: Experience) {
  if (confirm(`Are you sure you want to delete experience at ${exp.Company}?`)) {
    deleteMutation.mutate(exp.ID)
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.experiences-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.experience-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

.experience-header {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.experience-body {
  margin-left: 0;
}

.experience-projects-count {
  margin-top: 4px;
}

.linked-projects {
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--border-color);
}

.linked-projects h4 {
  font-size: 0.9rem;
  margin-bottom: var(--space-xs);
  color: var(--text-secondary);
}

.linked-projects ul {
  padding-left: var(--space-lg);
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .experience-header {
    flex-wrap: wrap;
  }
  .experience-actions {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
  }
  .experience-card {
    position: relative;
  }
}
</style>
