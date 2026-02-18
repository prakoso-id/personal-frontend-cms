<template>
  <aside
    class="sidebar"
    :class="{ collapsed, 'mobile-open': mobileOpen }"
    role="complementary"
    aria-label="Sidebar"
  >
    <div class="sidebar-header">
      <div class="sidebar-logo" v-show="!collapsed">
        <span class="logo-icon">◆</span>
        <span class="logo-text">CMS Admin</span>
      </div>
      <button
        class="btn-icon sidebar-toggle"
        @click="$emit('toggle')"
        :aria-expanded="!collapsed"
        aria-label="Toggle sidebar"
      >
        {{ collapsed ? '☰' : '✕' }}
      </button>
    </div>

    <nav aria-label="Main navigation" class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="nav-label" v-show="!collapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" v-show="!collapsed">
      <div class="sidebar-version">v1.0.0</div>
    </div>
  </aside>

  <!-- Mobile backdrop -->
  <Teleport to="body">
    <div
      v-if="mobileOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="$emit('closeMobile')"
    ></div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
}>()
const emit = defineEmits<{
  toggle: []
  closeMobile: []
}>()

const route = useRoute()

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/posts', icon: '📝', label: 'Posts' },
  { to: '/projects', icon: '🚀', label: 'Projects' },
  { to: '/skills', icon: '⚡', label: 'Skills' },
  { to: '/experiences', icon: '💼', label: 'Experiences' },
  { to: '/messages', icon: '✉️', label: 'Messages' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// Close mobile drawer on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.mobileOpen) {
    emit('closeMobile')
  }
}

// Close drawer on route change
watch(() => route.path, () => {
  if (props.mobileOpen) emit('closeMobile')
})

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  z-index: 100;
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  height: var(--topbar-height);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.logo-icon {
  font-size: 1.2rem;
  color: var(--accent-primary);
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.sidebar-toggle {
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  min-height: 40px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-primary-muted);
  color: var(--accent-primary);
}

.nav-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.sidebar-version {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Mobile backdrop */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: 99;
}

/* Mobile: sidebar = drawer */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 200;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  .sidebar.collapsed {
    width: var(--sidebar-width);
    transform: translateX(-100%);
  }
  .sidebar.collapsed.mobile-open {
    transform: translateX(0);
  }
  .nav-item {
    min-height: 44px;
  }
}
</style>
