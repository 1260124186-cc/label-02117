<template>
  <el-container class="main-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-left">
        <!-- 移动端菜单按钮 -->
        <div v-if="isMobile" class="header-action menu-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <el-icon :size="20"><Menu /></el-icon>
        </div>
        <div class="logo" @click="goHome">
          <div class="logo-icon">
            <el-icon :size="22" color="#fff"><DataAnalysis /></el-icon>
          </div>
          <span class="logo-text">ERP 报表系统</span>
        </div>
      </div>
      <div class="header-right">
        <el-tooltip content="刷新页面" placement="bottom">
          <div class="header-action" @click="handleRefresh">
            <el-icon :size="18"><Refresh /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="全屏显示" placement="bottom">
          <div class="header-action" @click="toggleFullscreen">
            <el-icon :size="18"><FullScreen /></el-icon>
          </div>
        </el-tooltip>
        <el-divider direction="vertical" />
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" class="avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="user-detail">
              <span class="username">{{ username }}</span>
              <span class="user-role">{{ roleText }}</span>
            </div>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '0px' : '260px'" class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <el-icon><Menu /></el-icon>
          <span>报表目录</span>
        </div>
        <div class="sidebar-content">
          <ReportTree />
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 页脚 -->
    <el-footer class="footer">
      <span>© 2025 ERP Report System</span>
      <span class="separator">|</span>
      <span>Version 1.0.0</span>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, FullScreen, Menu } from '@element-plus/icons-vue'
import ReportTree from '@/components/ReportTree.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = computed(() => auth.username)
const roleText = computed(() => auth.roleText)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function goHome() {
  router.push('/')
}

function handleRefresh() {
  window.location.reload()
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen()
    ElMessage.info('已退出全屏模式')
  }
}

function handleCommand(command: string) {
  switch (command) {
    case 'logout':
      auth.logout()
      ElMessage.success('退出登录成功')
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.menu-toggle {
  margin-right: var(--spacing-xs);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}

.logo:hover {
  background: rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  transition: all var(--transition-fast);
}

.header-action:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

:deep(.el-divider--vertical) {
  border-color: rgba(255, 255, 255, 0.3);
  height: 24px;
  margin: 0 var(--spacing-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.avatar {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.username {
  color: #fff;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  line-height: 1.2;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-xs);
  line-height: 1.2;
}

.arrow {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  transition: transform var(--transition-fast);
}

.user-info:hover .arrow {
  transform: rotate(180deg);
}

/* 主容器 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 0 !important;
  border-right: none;
}

/* 移动端侧边栏覆盖层 */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 40px;
    z-index: 98;
    box-shadow: var(--shadow-lg);
  }

  .sidebar.collapsed {
    left: -260px;
  }

  .logo-text {
    display: none;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  background: var(--bg-container);
  min-height: 52px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

/* 主内容区 */
.main-content {
  padding: var(--spacing-lg);
  overflow-y: auto;
  background: var(--bg-base);
}

/* 页脚 */
.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 40px;
  background: var(--bg-container);
  border-top: 1px solid var(--border-color-light);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.separator {
  color: var(--border-color);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
