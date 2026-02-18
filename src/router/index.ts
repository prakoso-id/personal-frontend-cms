import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../features/auth/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../features/dashboard/DashboardPage.vue'),
      },
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('../features/posts/PostsListPage.vue'),
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../features/projects/ProjectsListPage.vue'),
      },

      {
        path: 'skills',
        name: 'Skills',
        component: () => import('../features/skills/SkillsListPage.vue'),
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('../features/messages/MessagesListPage.vue'),
      },
      {
        path: 'experiences',
        name: 'Experiences',
        component: () => import('../features/experiences/ExperienceList.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)

  if (requiresAuth && !token) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
