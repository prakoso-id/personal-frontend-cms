<template>
  <div>
    <div class="flex justify-between items-center mb-lg">
      <h1 class="page-title" style="margin-bottom: 0">Skills</h1>
      <button class="btn btn-primary" @click="openModal()">＋ New Skill</button>
    </div>

    <DataTable
      :columns="columns"
      :rows="skills"
      row-key="ID"
      :loading="isPending"
      empty-icon="⚡"
      empty-title="No skills yet"
      empty-text="Add keys to showcase your expertise."
    >
      <template #cell-IconURL="{ row }">
        <div class="skill-icon">
          <img v-if="row.IconURL" :src="row.IconURL" :alt="row.Name" />
          <span v-else class="text-muted">?</span>
        </div>
      </template>

      <template #cell-Name="{ row }">
        <span style="font-weight: 500; color: var(--text-primary);">{{ row.Name }}</span>
      </template>

      <template #actions="{ row }">
        <button class="btn btn-ghost btn-sm" @click="openModal(row as unknown as Skill)" aria-label="Edit skill">✏️</button>
        <button class="btn btn-ghost btn-sm" @click="confirmDelete(row as unknown as Skill)" aria-label="Delete skill">🗑️</button>
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
    <SkillFormModal
      v-if="showModal"
      :skill="selectedSkill"
      @close="closeModal"
      @saved="closeModal"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Skill"
      :message="`Are you sure you want to delete '${skillToDelete?.Name}'?`"
      :loading="deleteMutation.isPending.value"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillsList, useDeleteSkill } from './composables'
import DataTable from '../../components/DataTable.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import SkillFormModal from './SkillFormModal.vue'
import type { Skill } from '../../types'

const page = ref(1)
const limit = ref(10)

// useSkillsList uses the key 'skills' and returns .data, which is { data: [], meta: {} }
// Check composables implementation..
const { data, isPending } = useSkillsList(page, limit)
const deleteMutation = useDeleteSkill()

const skills = computed(() => data.value?.data ?? [])
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
  { key: 'IconURL', label: 'Icon', width: '60px' },
  { key: 'Name', label: 'Name' },
  { key: 'Category', label: 'Category' },
]

const showModal = ref(false)
const selectedSkill = ref<Skill | undefined>(undefined)
const showDeleteDialog = ref(false)
const skillToDelete = ref<Skill | null>(null)

function openModal(skill?: Skill) {
  selectedSkill.value = skill
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedSkill.value = undefined
}

function confirmDelete(skill: Skill) {
  skillToDelete.value = skill
  showDeleteDialog.value = true
}

function handleDelete() {
  if (skillToDelete.value) {
    deleteMutation.mutate(skillToDelete.value.ID, {
      onSuccess: () => {
        showDeleteDialog.value = false
        skillToDelete.value = null
      },
    })
  }
}
</script>

<style scoped>
.skill-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.skill-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
