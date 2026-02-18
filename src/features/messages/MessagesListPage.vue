<template>
  <div>
    <h1 class="page-title mb-lg">Messages</h1>

    <DataTable
      :columns="columns"
      :rows="messages"
      row-key="ID"
      :loading="isPending"
      empty-icon="📨"
      empty-title="No messages"
      empty-text="You haven't received any messages yet."
    >
      <template #cell-Name="{ row }">
        <div>
          <div style="font-weight: 500;">{{ row.Name }}</div>
          <div class="text-muted" style="font-size: 0.85rem;">{{ row.Email }}</div>
        </div>
      </template>

      <template #cell-CreatedAt="{ row }">
        {{ formatDate(row.CreatedAt) }}
      </template>

      <template #actions="{ row }">
        <button class="btn btn-ghost btn-sm" @click="viewMessage(row as unknown as ContactMessage)" aria-label="View message">👁️ View</button>
      </template>
    </DataTable>

    <MessageViewModal
      v-if="showModal"
      :message="selectedMessage"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessages } from './composables'
import DataTable from '../../components/DataTable.vue'
import MessageViewModal from './MessageViewModal.vue'
import type { ContactMessage } from '../../types'

const { data, isPending } = useMessages()

const messages = computed(() => data.value ?? [])

const columns = [
  { key: 'Name', label: 'From' },
  { key: 'Subject', label: 'Subject' },
  { key: 'CreatedAt', label: 'Date', width: '180px' },
]

const showModal = ref(false)
const selectedMessage = ref<ContactMessage | undefined>(undefined)

function viewMessage(message: ContactMessage) {
  selectedMessage.value = message
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedMessage.value = undefined
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}
</script>
