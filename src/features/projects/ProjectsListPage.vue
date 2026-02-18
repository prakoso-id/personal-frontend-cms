<template>
  <div>
    <div class="flex justify-between items-center mb-lg">
      <h1 class="page-title" style="margin-bottom: 0">Projects</h1>
      <button class="btn btn-primary" @click="openModal()">＋ New Project</button>
    </div>

    <DataTable
      :columns="columns"
      :rows="projects"
      row-key="ID"
      :loading="isPending"
      empty-icon="🚀"
      empty-title="No projects yet"
      empty-text="Create your first project to get started."
    >
      <template #cell-Title="{ row }">
        <div class="project-title-cell">
          <span class="project-title">{{ row.Title }}</span>
          <span class="text-muted" style="font-size: 0.8rem;">{{ row.Description?.substring(0, 60) }}{{ row.Description?.length > 60 ? '...' : '' }}</span>
        </div>
      </template>

      <template #cell-IsFeatured="{ row }">
        <StatusBadge v-if="row.IsFeatured" status="featured" :dot="true" />
        <span class="text-muted" v-else>—</span>
      </template>

      <template #cell-Skills="{ row }">
        <div class="tag-list" v-if="row.Skills?.length">
          <span class="tag-item" v-for="skill in row.Skills.slice(0, 3)" :key="skill.ID">
            {{ skill.Name }}
          </span>
          <span class="text-muted" v-if="row.Skills.length > 3">+{{ row.Skills.length - 3 }}</span>
        </div>
        <span class="text-muted" v-else>—</span>
      </template>

      <template #cell-CreatedAt="{ row }">
        {{ formatDate(row.CreatedAt) }}
      </template>

      <template #actions="{ row }">
        <button class="btn btn-ghost btn-sm" @click="openModal(row.ID)" aria-label="Edit project">✏️</button>
        <button class="btn btn-ghost btn-sm" @click="confirmDelete(row as unknown as Project)" aria-label="Delete project">🗑️</button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <nav class="pagination" v-if="totalPages > 1" aria-label="Pagination">
      <button class="pagination-btn" :disabled="page === 1" @click="page--" aria-label="Previous page">‹</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        class="pagination-btn"
        :class="{ active: p === page }"
        @click="page = p"
        :aria-current="p === page ? 'page' : undefined"
        :aria-label="`Page ${p}`"
      >{{ p }}</button>
      <button class="pagination-btn" :disabled="page === totalPages" @click="page++" aria-label="Next page">›</button>
    </nav>

    <!-- Modals -->
    <ProjectFormModal
      v-if="showModal"
      :project-id="selectedProjectId"
      @close="closeModal"
      @saved="closeModal"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Project"
      :message="`Are you sure you want to delete '${projectToDelete?.Title}'? This action cannot be undone.`"
      :loading="deleteMutation.isPending.value"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjects, useDeleteProject } from './composables'
import DataTable from '../../components/DataTable.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import ProjectFormModal from './ProjectFormModal.vue'
import type { Project } from '../../types'

const page = ref(1)
const limit = ref(10)

const { data, isPending } = useProjects(page, limit)
const deleteMutation = useDeleteProject()

const projects = computed(() => data.value?.data ?? [])
const totalPages = computed(() => data.value?.meta?.total_page ?? 1)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const columns = [
  { key: 'Title', label: 'Title' },
  { key: 'IsFeatured', label: 'Featured', width: '120px' },
  { key: 'Skills', label: 'Skills', width: '200px' },
  { key: 'CreatedAt', label: 'Created', width: '140px' },
]

const showModal = ref(false)
const selectedProjectId = ref<string | undefined>(undefined)
const showDeleteDialog = ref(false)
const projectToDelete = ref<Project | null>(null)

function openModal(id?: string) {
  selectedProjectId.value = id
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedProjectId.value = undefined
}

function confirmDelete(project: Project) {
  projectToDelete.value = project
  showDeleteDialog.value = true
}

function handleDelete() {
  if (projectToDelete.value) {
    deleteMutation.mutate(projectToDelete.value.ID, {
      onSuccess: () => {
        showDeleteDialog.value = false
        projectToDelete.value = null
      },
    })
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.project-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.project-title {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
