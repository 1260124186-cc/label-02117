import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'report/:path*',
        name: 'Report',
        component: () => import('@/views/ReportView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // 已登录访问登录页：直接回首页
  if (to.path === '/login' && auth.isAuthenticated) return { path: '/' }

  // 需要登录但未登录
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 报表页：做更细粒度的报表权限判断
  if (to.name === 'Report') {
    const p = to.params.path
    const decodedPath = Array.isArray(p)
      ? decodeURIComponent(p.join('/'))
      : decodeURIComponent(String(p || ''))
    if (!auth.canAccessReportPath(decodedPath)) {
      return { path: '/403' }
    }
  }

  return true
})

export default router
