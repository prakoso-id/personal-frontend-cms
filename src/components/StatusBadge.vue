<template>
  <span class="badge" :class="badgeClass">
    <span class="badge-dot" v-if="dot"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'published' | 'draft' | 'featured' | 'active' | 'pending' | string
  dot?: boolean
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'published':
    case 'active':
      return 'badge-success'
    case 'draft':
    case 'pending':
      return 'badge-warning'
    case 'featured':
      return 'badge-primary'
    default:
      return 'badge-info'
  }
})

const label = computed(() => {
  return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})
</script>

<style scoped>
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
