<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-value">{{ postsData?.meta?.total_data ?? '—' }}</div>
          <div class="stat-label">Total Posts</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚀</div>
        <div class="stat-info">
          <div class="stat-value">{{ projectsData?.meta?.total_data ?? '—' }}</div>
          <div class="stat-label">Total Projects</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ publishedCount }}</div>
          <div class="stat-label">Published Posts</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ draftCount }}</div>
          <div class="stat-label">Drafts</div>
        </div>
      </div>
    </div>

    <!-- Recent Content -->
    <div class="dashboard-grid">
      <!-- Recent Posts -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Posts</h3>
          <router-link to="/posts" class="btn btn-ghost btn-sm">View All →</router-link>
        </div>
        <div class="loading-center" v-if="postsLoading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="recentPosts.length > 0">
          <div class="recent-item" v-for="post in recentPosts" :key="post.ID">
            <div class="recent-item-info">
              <div class="recent-item-title">{{ post.Title }}</div>
              <div class="recent-item-meta">{{ formatDate(post.CreatedAt) }}</div>
            </div>
            <StatusBadge :status="post.IsPublished ? 'published' : 'draft'" />
          </div>
        </div>
        <div class="empty-state" v-else style="padding: var(--space-xl);">
          <div class="empty-state-text">No posts yet</div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Projects</h3>
          <router-link to="/projects" class="btn btn-ghost btn-sm">View All →</router-link>
        </div>
        <div class="loading-center" v-if="projectsLoading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="recentProjects.length > 0">
          <div class="recent-item" v-for="project in recentProjects" :key="project.ID">
            <div class="recent-item-info">
              <div class="recent-item-title">{{ project.Title }}</div>
              <div class="recent-item-meta">{{ formatDate(project.CreatedAt) }}</div>
            </div>
            <StatusBadge v-if="project.IsFeatured" status="featured" />
          </div>
        </div>
        <div class="empty-state" v-else style="padding: var(--space-xl);">
          <div class="empty-state-text">No projects yet</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '../../api/axios'
import type { ApiResponse, PaginatedResponse, Post, Project } from '../../types'
import StatusBadge from '../../components/StatusBadge.vue'

const { data: postsData, isPending: postsLoading } = useQuery({
  queryKey: ['posts', { page: 1, limit: 5 }],
  queryFn: async () => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>('/admin/posts', {
      params: { page: 1, limit: 5 },
    })
    return data.data // ApiResponse.data => PaginatedResponse
  },
})

const { data: projectsData, isPending: projectsLoading } = useQuery({
  queryKey: ['projects', { page: 1, limit: 5 }],
  queryFn: async () => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Project>>>('/admin/projects', {
      params: { page: 1, limit: 5 },
    })
    return data.data // ApiResponse.data => PaginatedResponse
  },
})

const recentPosts = computed(() => postsData.value?.data ?? [])
const recentProjects = computed(() => projectsData.value?.data ?? [])

const publishedCount = computed(() =>
  recentPosts.value.filter((p) => p.IsPublished).length
)
const draftCount = computed(() =>
  recentPosts.value.filter((p) => !p.IsPublished).length
)

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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-fast);
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background: var(--bg-hover);
}

.recent-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.recent-item-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
