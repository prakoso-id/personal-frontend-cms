<template>
  <div class="layout">
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileDrawerOpen"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileDrawerOpen = false"
    />
    <div class="layout-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <AppTopbar
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="handleSidebarToggle"
      />
      <main id="main-content" class="layout-content" role="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

const sidebarCollapsed = ref(false)
const mobileDrawerOpen = ref(false)

function handleSidebarToggle() {
  if (window.innerWidth <= 768) {
    mobileDrawerOpen.value = !mobileDrawerOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
}

.layout-main.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed);
}

.layout-content {
  padding: var(--space-xl);
  margin-top: var(--topbar-height);
  min-height: calc(100vh - var(--topbar-height));
}

@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }
  .layout-main.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>
