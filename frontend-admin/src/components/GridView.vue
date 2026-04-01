<template>
  <div class="grid-view card">
    <div class="grid-header">
      <div class="header-left">
        <el-icon><Grid /></el-icon>
        <span class="header-title">{{ reportName }}</span>
        <el-tag type="info" size="small">共 {{ total }} 条</el-tag>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :icon="Download"
          :loading="exporting"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </div>

    <div class="grid-body">
      <el-table
        v-loading="loading"
        :data="displayData"
        stripe
        border
        class="data-table"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        empty-text="暂无数据"
      >
        <el-table-column
          v-for="col in visibleColumns"
          :key="col.ColumnName"
          :prop="col.ColumnName"
          :label="getColumnLabel(col.ColumnName)"
          :width="getColumnWidth(col)"
          :min-width="col.Flex ? 100 : undefined"
          :align="col.Align"
        >
          <template #default="{ row }">
            <span :class="getCellClass(col.ColumnName, row[col.ColumnName])">
              {{ formatCellValue(col.ColumnName, row[col.ColumnName]) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="paging" class="grid-footer">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ViewColumnInfo, ColumnInfo } from '@/types/report'

const props = withDefaults(
  defineProps<{
    reportName: string
    columns: ViewColumnInfo[]
    columnInfos: ColumnInfo[]
    data: Record<string, unknown>[]
    total: number
    loading: boolean
    paging: boolean
    /** 报表定义中的每页条数，用于初始化分页大小 */
    pageItems?: number
  }>(),
  { pageItems: 20 }
)

const emit = defineEmits<{
  refresh: []
  pageChange: [page: number, size: number]
}>()

const currentPage = ref(1)
const pageSize = ref(Math.max(1, props.pageItems))
const exporting = ref(false)

// 报表切换或 PageItems 变化时，同步每页条数并重置到第一页
watch(
  () => [props.paging, props.pageItems] as const,
  ([paging, pageItems]) => {
    const size = Math.max(1, pageItems ?? 20)
    if (paging) {
      pageSize.value = size
      currentPage.value = 1
    }
  },
  { immediate: true }
)

// 数据总量变化时，若当前页超出范围则回到第一页
watch(
  () => props.total,
  (total) => {
    const start = (currentPage.value - 1) * pageSize.value
    if (total > 0 && start >= total) currentPage.value = 1
  }
)

const headerCellStyle = {
  background: '#fafafa',
  fontWeight: 600,
  color: '#262626',
  fontSize: '13px'
}

const cellStyle = {
  fontSize: '13px'
}

const visibleColumns = computed(() =>
  props.columns.filter(col => col.Visible)
)

const pageSizes = computed(() => {
  const base = [10, 20, 50, 100]
  const n = Math.max(1, props.pageItems ?? 20)
  if (base.includes(n)) return base
  return [...new Set([...base, n].sort((a, b) => a - b))]
})

const displayData = computed(() => props.data)

function getColumnLabel(columnName: string) {
  const info = props.columnInfos.find(c => c.ColumnName === columnName)
  return info?.DisplayName || columnName
}

function getColumnWidth(col: ViewColumnInfo) {
  if (col.Width) return Number(col.Width)
  return undefined
}

function formatCellValue(columnName: string, value: unknown) {
  if (columnName === 'Month' && typeof value === 'number') {
    return `${value}月`
  }
  return value
}

function getCellClass(columnName: string, value: unknown) {
  if (columnName === 'Total' && typeof value === 'number') {
    return value > 100 ? 'cell-highlight' : ''
  }
  return ''
}

// 导出 Excel 功能
async function handleExport() {
  exporting.value = true

  try {
    // 构建 CSV 内容
    const headers = visibleColumns.value.map(col => getColumnLabel(col.ColumnName))
    const rows = props.data.map(row =>
      visibleColumns.value.map(col => {
        const value = row[col.ColumnName]
        if (col.ColumnName === 'Month' && typeof value === 'number') {
          return `${value}月`
        }
        return value ?? ''
      })
    )

    // 添加 BOM 以支持中文
    let csvContent = '\uFEFF'
    csvContent += headers.join(',') + '\n'
    csvContent += rows.map(row => row.join(',')).join('\n')

    // 创建 Blob 并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.reportName}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch (error) {
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  emit('pageChange', currentPage.value, size)
}

function handlePageChange(page: number) {
  currentPage.value = page
  emit('pageChange', page, pageSize.value)
}
</script>

<style scoped>
.grid-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.header-right {
  display: flex;
  gap: var(--spacing-sm);
}

.grid-body {
  flex: 1;
  padding: var(--spacing-md);
  overflow: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
}

.grid-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-base);
  flex-shrink: 0;
}

.cell-highlight {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

:deep(.el-table) {
  --el-table-border-color: var(--border-color-light);
  border-radius: var(--border-radius-sm);
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table__empty-block) {
  min-height: 200px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--color-primary);
}
</style>
