<template>
  <header class="topbar" :class="{ 'sidebar-collapsed': sidebarCollapsed }" aria-label="Top bar">
    <div class="topbar-left">
      <button
        class="btn-icon topbar-menu-btn"
        @click="$emit('toggleSidebar')"
        aria-label="Open navigation menu"
      >
        ☰
      </button>
      <h1 class="topbar-title">{{ pageTitle }}</h1>
    </div>
    <div class="topbar-right">
      <button
        class="btn-icon"
        @click="toggle"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      
      <!-- User Dropdown -->
      <div class="topbar-user" ref="dropdownRef">
        <button 
          class="user-btn" 
          @click="toggleDropdown"
          :aria-expanded="dropdownOpen"
          aria-haspopup="true"
          aria-label="User menu"
        >
          <span class="user-avatar" aria-hidden="true">
            <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" class="avatar-img" />
            <span v-else>👤</span>
          </span>
          <span class="user-name">{{ user?.fullname || 'Admin' }}</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <transition name="fade">
          <div v-if="dropdownOpen" class="dropdown-menu" role="menu">
            <button class="dropdown-item" @click="openProfileModal" role="menuitem">
              Change Profile
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-danger" @click="confirmLogout" role="menuitem">
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Modals -->
    <UpdateProfileModal 
      v-if="showProfileModal" 
      @close="showProfileModal = false" 
    />

    <ConfirmDialog
      v-model="showLogoutDialog"
      title="Logout"
      message="Are you sure you want to logout? You will need to login again to access the dashboard."
      confirm-text="Logout"
      @confirm="handleLogout"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useAuth } from '../features/auth/composables'
import UpdateProfileModal from '../features/profile/UpdateProfileModal.vue'
import ConfirmDialog from './ConfirmDialog.vue'

defineProps<{
  sidebarCollapsed: boolean
}>()
defineEmits<{ toggleSidebar: [] }>()

const route = useRoute()
const { isDark, toggle } = useTheme()
const { user, logout } = useAuth()

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const showProfileModal = ref(false)
const showLogoutDialog = ref(false)

const pageTitle = computed(() => {
  const name = route.name as string
  if (!name) return 'Dashboard'
  return name.replace(/([A-Z])/g, ' $1').trim()
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

function openProfileModal() {
  showProfileModal.value = true
  dropdownOpen.value = false
}

function confirmLogout() {
  showLogoutDialog.value = true
  dropdownOpen.value = false
}

function handleLogout() {
  logout()
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width);
  height: var(--topbar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  z-index: 50;
  transition: left var(--transition-normal);
}

.topbar.sidebar-collapsed {
  left: var(--sidebar-collapsed);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.topbar-menu-btn {
  display: none;
}

.topbar-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.topbar-user {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  color: var(--text-primary);
}

.user-btn:hover, .user-btn[aria-expanded="true"] {
  background: var(--bg-tertiary);
}

.user-avatar {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.7rem;
  opacity: 0.7;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  text-align: left;
  background: none;
  border: none;
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-xs) 0;
}

.text-danger {
  color: var(--accent-danger);
}

.text-danger:hover {
  background: var(--accent-danger-muted);
}

@media (max-width: 768px) {
  .topbar {
    left: 0;
  }
  .topbar-menu-btn {
    display: flex;
  }
  .user-name {
    display: none;
  }
}
</style>
