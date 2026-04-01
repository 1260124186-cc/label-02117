import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type UserRole = 'admin' | 'user'

export interface AuthUser {
  username: string
  role: UserRole
}

const STORAGE_KEY = 'erp-report-auth'

function roleLabel(role: UserRole) {
  return role === 'admin' ? '管理员' : '普通用户'
}

function loadPersisted(): { user: AuthUser | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null }
    const parsed = JSON.parse(raw) as { user?: AuthUser }
    if (!parsed.user?.username || !parsed.user.role) return { user: null }
    return { user: parsed.user }
  } catch {
    return { user: null }
  }
}

function persist(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }))
}

/**
 * 简易权限模型（前端演示用）：
 * - admin：可访问所有报表
 * - user：仅可访问“业务流程管理\\系统报表\\BPM系统利用率”
 */
export const useAuthStore = defineStore('auth', () => {
  const persisted = loadPersisted()
  const user = ref<AuthUser | null>(persisted.user)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const username = computed(() => user.value?.username || '')
  const role = computed<UserRole | null>(() => user.value?.role || null)
  const roleText = computed(() => (user.value ? roleLabel(user.value.role) : ''))

  function clearError() {
    error.value = null
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      // 模拟请求延迟（后续可替换为真实 API）
      await new Promise(resolve => setTimeout(resolve, 600))

      const u = username.trim()
      if (u === 'admin' && password === 'admin123') {
        user.value = { username: 'admin', role: 'admin' }
      } else if (u === 'user' && password === 'user123') {
        user.value = { username: 'user', role: 'user' }
      } else {
        throw new Error('用户名或密码错误')
      }

      persist(user.value)
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登录失败，请重试'
      error.value = msg
      user.value = null
      persist(null)
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    error.value = null
    persist(null)
  }

  function canAccessReportPath(path: string) {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    // 普通用户仅允许访问示例报表
    return path === '业务流程管理\\系统报表\\BPM系统利用率'
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    username,
    role,
    roleText,
    clearError,
    login,
    logout,
    canAccessReportPath
  }
})

