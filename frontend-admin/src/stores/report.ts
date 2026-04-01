import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ReportTreeNode, ReportDefinition, ReportViewDetail, ReportQueryResult } from '@/types/report'
import { mockReportTree, mockReportDefinition, mockReportView, mockReportData } from '@/api/mockData'

/** 从各类异常中提取用户可读的错误信息（兼容 Error、Axios 等） */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    if (typeof o.message === 'string') return o.message
    if (o.response && typeof o.response === 'object') {
      const res = o.response as Record<string, unknown>
      if (res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>
        if (typeof data.message === 'string') return data.message
      }
      if (typeof res.status === 'number') {
        if (res.status === 404) return '请求的资源不存在'
        if (res.status >= 500) return '服务器错误，请稍后重试'
        if (res.status === 403) return '没有访问权限'
        if (res.status === 401) return '未授权，请重新登录'
      }
    }
  }
  return fallback
}

export const useReportStore = defineStore('report', () => {
  const treeData = ref<ReportTreeNode[]>([])
  const currentReport = ref<ReportDefinition | null>(null)
  const currentView = ref<ReportViewDetail | null>(null)
  const reportData = ref<ReportQueryResult | null>(null)
  const loading = ref(false)
  const selectedPath = ref<string>('')
  /** 最近一次请求失败时的错误信息，供 UI 展示；成功或主动清除时置空 */
  const error = ref<string | null>(null)

  function clearError() {
    error.value = null
  }

  // 加载报表目录
  async function loadReportTree() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      treeData.value = mockReportTree
    } catch (e) {
      const msg = getErrorMessage(e, '加载报表目录失败，请检查网络或稍后重试')
      error.value = msg
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }

  // 加载报表定义
  async function loadReportDefinition(path: string) {
    loading.value = true
    error.value = null
    selectedPath.value = path
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      currentReport.value = mockReportDefinition
    } catch (e) {
      const msg = getErrorMessage(e, '加载报表定义失败，请稍后重试')
      error.value = msg
      currentReport.value = null
      currentView.value = null
      reportData.value = null
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }

  // 加载报表视图
  async function loadReportView(_path: string, _viewType: string) {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      currentView.value = mockReportView
    } catch (e) {
      const msg = getErrorMessage(e, '加载报表视图失败，请稍后重试')
      error.value = msg
      currentView.value = null
      reportData.value = null
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }

  // 查询报表数据 - 支持日期范围筛选和分页
  async function queryReportData(
    params: Record<string, unknown>,
    page = 1,
    pageSize?: number
  ) {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      let filteredChildren = [...mockReportData.children]

      // params['@Year'] 等参数在实际对接后端 API 时作为查询参数发送

      // 日期范围筛选：按 Month 字段过滤
      const startDate = params['@Date1'] as string
      const endDate = params['@Date2'] as string

      if (startDate) {
        const startMonth = new Date(startDate).getMonth() + 1
        filteredChildren = filteredChildren.filter(item => Number(item.Month) >= startMonth)
      }

      if (endDate) {
        const endMonth = new Date(endDate).getMonth() + 1
        filteredChildren = filteredChildren.filter(item => Number(item.Month) <= endMonth)
      }

      const total = filteredChildren.length

      // 服务端分页：当报表定义启用分页时，按 page/pageSize 截取数据
      // 实际对接后端 API 时，page 和 pageSize 应作为请求参数发送给服务端
      const isPaging = currentReport.value?.Paging ?? false
      if (isPaging && pageSize) {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        filteredChildren = filteredChildren.slice(start, end)
      }

      reportData.value = {
        total,
        children: filteredChildren
      }
    } catch (e) {
      const msg = getErrorMessage(e, '查询报表数据失败，请检查条件后重试')
      error.value = msg
      reportData.value = null
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }

  return {
    treeData,
    currentReport,
    currentView,
    reportData,
    loading,
    selectedPath,
    error,
    clearError,
    loadReportTree,
    loadReportDefinition,
    loadReportView,
    queryReportData
  }
})
