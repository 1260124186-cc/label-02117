<template>
  <div class="excel-view card">
    <div class="excel-header">
      <div class="header-left">
        <el-icon><Document /></el-icon>
        <span class="header-title">{{ reportName }} - Excel 预览</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :icon="Download"
          :loading="downloading"
          :disabled="loading || data.length === 0"
          @click="handleDownload"
        >
          下载 Excel
        </el-button>
      </div>
    </div>

    <div class="excel-body" v-loading="loading">
      <div class="excel-preview">
        <div class="excel-toolbar">
          <div class="toolbar-left">
            <el-icon><Grid /></el-icon>
            <span>Sheet1</span>
          </div>
          <div class="toolbar-right">
            <span class="cell-count">{{ data.length }} 行 × {{ columns.length }} 列</span>
          </div>
        </div>
        <div class="excel-table-wrapper">
          <table class="excel-table">
            <thead>
              <tr>
                <th class="row-number">#</th>
                <th v-for="col in columns" :key="col.ColumnName">
                  {{ getColumnLabel(col.ColumnName) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in data" :key="index">
                <td class="row-number">{{ index + 1 }}</td>
                <td v-for="col in columns" :key="col.ColumnName">
                  {{ formatCellValue(col.ColumnName, row[col.ColumnName]) }}
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="columns.length + 1" class="empty-cell">
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Document, Grid } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import type { ViewColumnInfo, ColumnInfo } from '@/types/report'

const props = defineProps<{
  reportName: string
  columns: ViewColumnInfo[]
  columnInfos: ColumnInfo[]
  data: Record<string, unknown>[]
  loading: boolean
}>()

const downloading = ref(false)

function getColumnLabel(columnName: string) {
  const info = props.columnInfos.find(c => c.ColumnName === columnName)
  return info?.DisplayName || columnName
}

function formatCellValue(columnName: string, value: unknown) {
  if (columnName === 'Month' && typeof value === 'number') {
    return `${value}月`
  }
  return value
}

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'report'
}

// 下载 Excel 功能
async function handleDownload() {
  if (props.loading) return
  if (!props.data || props.data.length === 0) {
    ElMessage.warning('暂无数据可导出，请先执行查询')
    return
  }

  downloading.value = true

  try {
    // 构建表头
    const headers = props.columns.map(col => getColumnLabel(col.ColumnName))

    // 构建数据行
    const rows = props.data.map(row =>
      props.columns.map(col => {
        const value = row[col.ColumnName]
        if (col.ColumnName === 'Month' && typeof value === 'number') {
          return `${value}月`
        }
        return value ?? ''
      })
    )

    // 创建工作表数据
    const wsData = [headers, ...rows]

    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // 设置列宽
    const colWidths = headers.map(h => ({ wch: Math.max(h.length * 2, 12) }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    // 导出为 xlsx 文件
    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `${sanitizeFileName(props.reportName)}_${date}.xlsx`)

  } catch {
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.excel-view {
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.excel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
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

.excel-body {
  flex: 1;
  padding: var(--spacing-lg);
  background: #f0f0f0;
  overflow: auto;
}

.excel-preview {
  background: white;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.excel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #217346;
  color: white;
  font-size: var(--font-size-sm);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.cell-count {
  opacity: 0.8;
  font-size: var(--font-size-xs);
}

.excel-table-wrapper {
  overflow-x: auto;
}

.excel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.excel-table th,
.excel-table td {
  border: 1px solid #d4d4d4;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  white-space: nowrap;
}

.excel-table th {
  background: #e8e8e8;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  position: sticky;
  top: 0;
}

.excel-table .row-number {
  background: #f5f5f5;
  color: var(--text-secondary);
  text-align: center;
  width: 50px;
  font-weight: var(--font-weight-medium);
}

.excel-table tbody tr:hover {
  background: #e6f7ff;
}

.excel-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.excel-table tbody tr:nth-child(even):hover {
  background: #e6f7ff;
}

.empty-cell {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl) !important;
}
</style>
