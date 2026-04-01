<template>
  <div class="report-tree">
    <el-alert
      v-if="reportStore.error"
      type="error"
      :title="reportStore.error"
      show-icon
      closable
      class="tree-error-alert"
      @close="reportStore.clearError()"
    >
      <template #default>
        <el-button type="primary" link size="small" @click="handleRetry">
          重试
        </el-button>
      </template>
    </el-alert>

    <el-input
      v-model="searchText"
      placeholder="搜索报表..."
      :prefix-icon="Search"
      clearable
      class="search-input"
      size="default"
    />

    <div class="tree-wrapper">
      <el-tree
        ref="treeRef"
        :data="filteredTreeData"
        :props="treeProps"
        node-key="id"
        highlight-current
        :expand-on-click-node="true"
        :filter-node-method="filterNode"
        :current-node-key="currentNodeKey"
        default-expand-all
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node" :class="{ 'is-file': isFile(data), 'is-folder': !isFile(data) }">
            <el-icon class="node-icon">
              <FolderOpened v-if="!isFile(data) && node.expanded" />
              <Folder v-else-if="!isFile(data)" />
              <Document v-else />
            </el-icon>
            <span class="node-label" :title="node.label">{{ node.label }}</span>
            <el-tag
              v-if="data.tabs?.length"
              type="primary"
              size="small"
              effect="light"
              class="node-badge"
            >
              {{ data.tabs.length }}
            </el-tag>
          </div>
        </template>
      </el-tree>

      <el-empty
        v-if="filteredTreeData.length === 0 && searchText"
        description="未找到匹配的报表"
        :image-size="60"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, FolderOpened } from '@element-plus/icons-vue'
import { useReportStore } from '@/stores/report'
import type { ReportTreeNode } from '@/types/report'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const reportStore = useReportStore()
const authStore = useAuthStore()
const treeRef = ref()
const searchText = ref('')

const treeProps = {
  children: 'children',
  label: 'text'
}

function filterTreeByPermission(nodes: ReportTreeNode[]): ReportTreeNode[] {
  const result: ReportTreeNode[] = []
  for (const node of nodes) {
    const tabs = node.tabs?.filter(t => authStore.canAccessReportPath(t.config.path))
    const children = node.children ? filterTreeByPermission(node.children) : []
    const next: ReportTreeNode = {
      ...node,
      children,
      ...(tabs ? { tabs } : {})
    }
    const hasVisibleTabs = !!next.tabs && next.tabs.length > 0
    const hasChildren = next.children && next.children.length > 0
    if (hasVisibleTabs || hasChildren) result.push(next)
  }
  return result
}

const filteredTreeData = computed(() => filterTreeByPermission(reportStore.treeData))

// 当前选中的节点 key
const currentNodeKey = computed(() => {
  // 首页时不选中任何节点
  if (route.path === '/' || route.path === '/home') return ''

  const path = route.params.path
  if (!path) return ''
  const decodedPath = Array.isArray(path)
    ? decodeURIComponent(path.join('/'))
    : decodeURIComponent(path)

  // 查找匹配的节点
  let foundKey = ''
  function findNode(nodes: ReportTreeNode[]) {
    for (const node of nodes) {
      if (node.tabs) {
        for (const tab of node.tabs) {
          if (tab.config.path === decodedPath) {
            foundKey = node.id
            return
          }
        }
      }
      if (node.children) {
        findNode(node.children)
      }
    }
  }
  findNode(filteredTreeData.value)
  return foundKey
})

// 判断是否为文件（有 tabs 且没有 children 或 children 为空）
function isFile(data: ReportTreeNode) {
  return data.tabs && data.tabs.length > 0 && (!data.children || data.children.length === 0)
}

function filterNode(value: string, data: ReportTreeNode) {
  if (!value) return true
  return data.text.toLowerCase().includes(value.toLowerCase())
}

watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

// 监听路由变化，更新树的选中状态
watch(() => route.path, () => {
  if (treeRef.value) {
    if (route.path === '/' || route.path === '/home') {
      // 首页时清除选中
      treeRef.value.setCurrentKey(null)
    } else if (currentNodeKey.value) {
      treeRef.value.setCurrentKey(currentNodeKey.value)
    }
  }
}, { immediate: true })

function handleNodeClick(data: ReportTreeNode) {
  // 只有文件才能点击跳转，文件夹只展开/收起
  if (isFile(data) && data.tabs && data.tabs.length > 0) {
    const path = data.tabs[0].config.path
    router.push(`/report/${encodeURIComponent(path)}`)
  }
}

function handleRetry() {
  reportStore.clearError()
  reportStore.loadReportTree()
}

onMounted(() => {
  reportStore.loadReportTree()
})
</script>

<style scoped>
.report-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tree-error-alert {
  flex-shrink: 0;
}

.search-input {
  flex-shrink: 0;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  padding: var(--spacing-xs) 0;
  min-width: 0;
}

.tree-node.is-folder {
  cursor: default;
}

.tree-node.is-file {
  cursor: pointer;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.tree-node.is-folder .node-icon {
  color: var(--color-warning);
}

.tree-node.is-file .node-icon {
  color: var(--color-primary);
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.node-badge {
  flex-shrink: 0;
  margin-left: auto;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 2px;
  transition: all var(--transition-fast);
}

:deep(.el-tree-node__content:hover) {
  background: var(--bg-base);
}

/* 选中状态 - 只对文件生效 */
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--color-primary-bg);
}

:deep(.el-tree-node.is-current > .el-tree-node__content .tree-node.is-file .node-label) {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

:deep(.el-tree-node__expand-icon) {
  color: var(--text-secondary);
}

:deep(.el-input__wrapper) {
  background: var(--bg-base);
}
</style>
