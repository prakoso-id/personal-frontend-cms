<template>
  <div>
    <div class="flex justify-between items-center mb-lg">
      <h1 class="page-title" style="margin-bottom: 0">Posts</h1>
      <button class="btn btn-primary" @click="openCreate">＋ New Post</button>
    </div>

    <DataTable
      :columns="columns"
      :rows="posts"
      row-key="ID"
      :loading="isPending"
      aria-label="Posts list"
      empty-icon="📝"
      empty-title="No posts yet"
      empty-text="Create your first post to get started."
    >
      <template #cell-Title="{ row }">
        <div class="post-title-cell">
          <span class="post-title">{{ row.Title }}</span>
          <span class="text-muted" style="font-size: 0.8rem;">{{ row.Slug }}</span>
        </div>
      </template>

      <template #cell-IsPublished="{ row }">
        <StatusBadge :status="row.IsPublished ? 'published' : 'draft'" :dot="true" />
      </template>

      <template #cell-Tags="{ row }">
        <div class="tag-list" v-if="row.Tags?.length">
          <span class="tag-item" v-for="tag in row.Tags.slice(0, 3)" :key="tag.ID">
            {{ tag.Name }}
          </span>
          <span class="text-muted" v-if="row.Tags.length > 3">+{{ row.Tags.length - 3 }}</span>
        </div>
        <span class="text-muted" v-else>—</span>
      </template>

      <template #cell-CreatedAt="{ row }">
        {{ formatDate(row.CreatedAt) }}
      </template>

      <template #actions="{ row }">
        <button
          class="btn btn-ghost btn-sm"
          @click="openEdit(row.ID)"
          :aria-label="`Edit post: ${row.Title}`"
        >✏️</button>
        <button
          class="btn btn-ghost btn-sm"
          @click="confirmDelete(row as unknown as Post)"
          :aria-label="`Delete post: ${row.Title}`"
        >🗑️</button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <nav class="pagination" v-if="totalPages > 1" aria-label="Posts pagination">
      <button
        class="pagination-btn"
        :disabled="page === 1"
        @click="page--"
        aria-label="Previous page"
      >‹</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        class="pagination-btn"
        :class="{ active: p === page }"
        :aria-current="p === page ? 'page' : undefined"
        :aria-label="`Page ${p}`"
        @click="page = p"
      >{{ p }}</button>
      <button
        class="pagination-btn"
        :disabled="page === totalPages"
        @click="page++"
        aria-label="Next page"
      >›</button>
    </nav>

    <!-- Post Form Modal -->
    <PostFormModal
      v-if="showFormModal"
      :post-id="editPostId"
      @close="closeFormModal"
      @saved="handleSaved"
    />

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Post"
      :message="`Are you sure you want to delete '${postToDelete?.Title}'? This action cannot be undone.`"
      :loading="deleteMutation.isPending.value"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePosts, useDeletePost } from './composables'
import DataTable from '../../components/DataTable.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import PostFormModal from './PostFormModal.vue'
import { useToast } from '../../composables/useToast'
import type { Post } from '../../types'

const page = ref(1)
const limit = ref(10)

const { data, isPending } = usePosts(page, limit)
const deleteMutation = useDeletePost()
const toast = useToast()

const posts = computed(() => data.value?.data ?? [])
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
  { key: 'IsPublished', label: 'Status', width: '120px' },
  { key: 'Tags', label: 'Tags', width: '200px' },
  { key: 'CreatedAt', label: 'Created', width: '140px' },
]

// ---- Form Modal ----
const showFormModal = ref(false)
const editPostId = ref<string | undefined>(undefined)

function openCreate() {
  editPostId.value = undefined
  showFormModal.value = true
}

function openEdit(id: string) {
  editPostId.value = id
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editPostId.value = undefined
}

function handleSaved() {
  closeFormModal()
}

// ---- Delete ----
const showDeleteDialog = ref(false)
const postToDelete = ref<Post | null>(null)

function confirmDelete(post: Post) {
  postToDelete.value = post
  showDeleteDialog.value = true
}

function handleDelete() {
  if (postToDelete.value) {
    deleteMutation.mutate(postToDelete.value.ID, {
      onSuccess: () => {
        toast.success('Post deleted successfully')
        showDeleteDialog.value = false
        postToDelete.value = null
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete post.'
        toast.error(msg)
        showDeleteDialog.value = false
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
.post-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.post-title {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
