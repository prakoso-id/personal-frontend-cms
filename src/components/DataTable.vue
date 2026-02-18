<template>
  <div>
    <div class="table-container" v-if="!loading && rows.length > 0">
      <table :aria-label="ariaLabel || 'Data table'">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}" scope="col">
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" style="width: 120px" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="rowKey ? row[rowKey] : index">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td v-if="$slots.actions">
              <div class="flex gap-sm">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading State -->
    <div class="table-container" v-if="loading" aria-busy="true">
      <table :aria-label="ariaLabel || 'Loading data'">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" scope="col">{{ col.label }}</th>
            <th v-if="$slots.actions" style="width: 120px" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton skeleton-text" :style="{ width: `${60 + Math.random() * 30}%` }"></div>
            </td>
            <td v-if="$slots.actions">
              <div class="skeleton skeleton-text" style="width: 80px"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="!loading && rows.length === 0" role="status">
      <div class="empty-state-icon" aria-hidden="true">{{ emptyIcon || '📭' }}</div>
      <div class="empty-state-title">{{ emptyTitle || 'No data found' }}</div>
      <div class="empty-state-text">{{ emptyText || 'There are no items to display yet.' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Column {
  key: string
  label: string
  width?: string
}

defineProps<{
  columns: Column[]
  rows: Record<string, any>[]
  rowKey?: string
  loading?: boolean
  ariaLabel?: string
  emptyIcon?: string
  emptyTitle?: string
  emptyText?: string
}>()
</script>
