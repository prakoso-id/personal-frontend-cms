<template>
  <a href="#main-content" class="skip-to-content">Skip to main content</a>
  <router-view />
  <ToastContainer />
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'

// Initialize theme on app mount
useTheme()
</script>
