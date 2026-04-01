<template>
  <div class="home-view">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-bg">
        <div class="bg-circle circle-1"></div>
        <div class="bg-circle circle-2"></div>
        <div class="bg-circle circle-3"></div>
      </div>
      <div class="welcome-content">
        <div class="welcome-left">
          <div class="welcome-badge">
            <el-icon><Sunny /></el-icon>
            <span>{{ greeting }}</span>
          </div>
          <h1>欢迎使用 ERP 报表系统</h1>
          <p class="welcome-desc">
            企业级数据报表管理平台，支持多维度数据分析、灵活的报表视图切换、实时数据查询与导出功能。
          </p>
        </div>
        <div class="welcome-right">
          <div class="welcome-illustration">
            <el-icon :size="120" color="rgba(255,255,255,0.9)"><DataAnalysis /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-icon icon-blue">
          <el-icon :size="26"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ reportCount }}</div>
          <div class="stat-label">报表总数</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon icon-green">
          <el-icon :size="26"><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ categoryCount }}</div>
          <div class="stat-label">报表分类</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon icon-orange">
          <el-icon :size="26"><View /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">3</div>
          <div class="stat-label">视图类型</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon icon-purple">
          <el-icon :size="26"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ currentTime }}</div>
          <div class="stat-label">当前时间</div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-row">
      <!-- 快速访问 -->
      <div class="quick-access card">
        <div class="section-header">
          <div class="header-title">
            <el-icon><Star /></el-icon>
            <span>快速访问</span>
          </div>
          <el-tag type="info" size="small">{{ quickAccessItems.length }} 个报表</el-tag>
        </div>
        <div class="quick-list">
          <div
            v-for="item in quickAccessItems"
            :key="item.path"
            class="quick-item"
            @click="navigateToReport(item.path)"
          >
            <div class="quick-item-left">
              <el-icon class="quick-icon"><Document /></el-icon>
              <span class="quick-name">{{ item.name }}</span>
            </div>
            <el-icon class="quick-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty
            v-if="quickAccessItems.length === 0"
            description="暂无报表"
            :image-size="60"
          />
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="system-info card">
        <div class="section-header">
          <div class="header-title">
            <el-icon><Monitor /></el-icon>
            <span>系统信息</span>
          </div>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">系统版本</span>
            <span class="info-value">v1.0.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">前端框架</span>
            <span class="info-value">Vue 3.4</span>
          </div>
          <div class="info-item">
            <span class="info-label">UI 组件</span>
            <span class="info-value">Element Plus</span>
          </div>
          <div class="info-item">
            <span class="info-label">图表库</span>
            <span class="info-value">ECharts 5.5</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sunny, Monitor } from '@element-plus/icons-vue'
import { useReportStore } from '@/stores/report'

const router = useRouter()
const reportStore = useReportStore()
const currentTime = ref('')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const reportCount = computed(() => {
  let count = 0
  function countReports(nodes: typeof reportStore.treeData) {
    nodes.forEach(node => {
      if (node.tabs) count += node.tabs.length
      if (node.children) countReports(node.children)
    })
  }
  countReports(reportStore.treeData)
  return count
})

const categoryCount = computed(() => reportStore.treeData.length)

const quickAccessItems = computed(() => {
  const items: { name: string; path: string }[] = []
  function collectItems(nodes: typeof reportStore.treeData) {
    nodes.forEach(node => {
      if (node.tabs) {
        node.tabs.forEach(tab => {
          items.push({ name: tab.text, path: tab.config.path })
        })
      }
      if (node.children) collectItems(node.children)
    })
  }
  collectItems(reportStore.treeData)
  return items.slice(0, 5)
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function navigateToReport(path: string) {
  router.push(`/report/${encodeURIComponent(path)}`)
}

let timer: number

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 欢迎区域 */
.welcome-card {
  position: relative;
  padding: var(--spacing-xl) var(--spacing-2xl);
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  min-height: 200px;
}

.welcome-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  right: 100px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -50px;
}

.welcome-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

.welcome-left {
  flex: 1;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.welcome-left h1 {
  font-size: 28px;
  color: #fff;
  margin: 0 0 var(--spacing-sm);
  font-weight: var(--font-weight-bold);
}

.welcome-desc {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  max-width: 500px;
  line-height: 1.6;
}

.welcome-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-illustration {
  opacity: 0.9;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.icon-blue {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.icon-green {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.icon-orange {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.icon-purple {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

/* 内容区域 */
.content-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

.quick-access,
.system-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.quick-list {
  flex: 1;
  padding: var(--spacing-sm);
  overflow-y: auto;
}

.quick-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.quick-item:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.quick-item-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.quick-icon {
  color: var(--color-primary);
}

.quick-name {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.quick-arrow {
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.quick-item:hover .quick-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

/* 系统信息 */
.info-list {
  padding: var(--spacing-md);
  flex: 1;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px dashed var(--border-color-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.info-value {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .welcome-right {
    display: none;
  }

  .welcome-actions {
    justify-content: center;
  }
}
</style>
