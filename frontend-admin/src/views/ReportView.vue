<template>
  <div class="report-view">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ reportName }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 错误提示：请求失败时展示，可关闭或重试 -->
    <el-alert
      v-if="reportStore.error"
      type="error"
      :title="reportStore.error"
      show-icon
      closable
      class="error-alert"
      @close="reportStore.clearError()"
    >
      <template #default>
        <el-button type="primary" link size="small" @click="handleRetryLoad">
          重试
        </el-button>
      </template>
    </el-alert>

    <!-- 报表标题 + 查询条件合并 -->
    <div class="report-panel card">
      <div class="panel-header">
        <div class="header-left">
          <el-icon :size="22" color="#1890ff"><DataAnalysis /></el-icon>
          <h2>{{ reportName }}</h2>
          <el-tag v-if="currentReport" type="success" size="small" effect="light">
            已加载
          </el-tag>
        </div>
      </div>

      <!-- 查询条件 -->
      <div v-if="currentReport" class="panel-query">
        <el-form
          ref="formRef"
          :model="formData"
          :inline="true"
          class="query-form"
        >
          <template v-for="param in visibleParams" :key="param.Name">
            <!-- 普通输入（数字类型） -->
            <el-form-item
              v-if="param.ParameterUIBindType === 'Normal' && isNumberType(param)"
              :label="getParamLabel(param)"
            >
              <el-input-number
                v-model="formData[param.Name]"
                :placeholder="`请输入`"
                controls-position="right"
                class="form-input"
              />
            </el-form-item>

            <!-- 普通输入（布尔类型） -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'Normal' && isBooleanType(param)"
              :label="getParamLabel(param)"
            >
              <el-switch v-model="formData[param.Name]" />
            </el-form-item>

            <!-- 普通输入（日期时间类型） -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'Normal' && isDateTimeType(param)"
              :label="getParamLabel(param)"
            >
              <el-date-picker
                v-model="formData[param.Name]"
                type="datetime"
                :placeholder="`请选择${getParamLabel(param)}`"
                class="form-input"
              />
            </el-form-item>

            <!-- 普通输入（浮点数类型） -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'Normal' && isDecimalType(param)"
              :label="getParamLabel(param)"
            >
              <el-input-number
                v-model="formData[param.Name]"
                :placeholder="`请输入`"
                controls-position="right"
                :precision="2"
                class="form-input"
              />
            </el-form-item>

            <!-- 普通输入（字符串及其他类型） -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'Normal'"
              :label="getParamLabel(param)"
            >
              <el-input
                v-model="formData[param.Name]"
                :placeholder="`请输入${getParamLabel(param)}`"
                clearable
                class="form-input"
              />
            </el-form-item>

            <!-- 开始日期 -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'StartDate'"
              :label="getParamLabel(param) || '开始日期'"
            >
              <el-date-picker
                v-model="formData[param.Name]"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
                clearable
                class="form-input"
              />
            </el-form-item>

            <!-- 结束日期 -->
            <el-form-item
              v-else-if="param.ParameterUIBindType === 'EndDate'"
              :label="getParamLabel(param) || '结束日期'"
            >
              <el-date-picker
                v-model="formData[param.Name]"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
                clearable
                class="form-input"
              />
            </el-form-item>
          </template>

          <el-form-item class="form-actions">
            <el-button
              type="primary"
              :icon="Search"
              :loading="loading"
              @click="handleQuery"
            >
              查询
            </el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 视图切换 -->
    <ViewTabs
      v-if="currentReport"
      v-model="activeViewType"
      :views="currentReport.views"
      @change="handleViewChange"
    />

    <!-- 数据视图 -->
    <div class="view-container">
      <GridView
        v-if="activeViewType === 'Grid' && currentView"
        :report-name="reportName"
        :columns="currentView.view.ColumnInfos"
        :column-infos="currentView.columnInfos"
        :data="reportData?.children || []"
        :total="reportData?.total || 0"
        :loading="loading"
        :paging="currentReport?.Paging ?? false"
        :page-items="currentReport?.PageItems ?? 20"
        @page-change="handlePageChange"
      />

      <ChartView
        v-else-if="activeViewType === 'MSChart'"
        :report-name="reportName"
        :data="reportData?.children || []"
        :loading="loading"
      />

      <ExcelView
        v-else-if="activeViewType === 'Excel' && currentView"
        :report-name="reportName"
        :columns="currentView.view.ColumnInfos"
        :column-infos="currentView.columnInfos"
        :data="reportData?.children || []"
        :loading="loading"
      />

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state card">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state card">
        <el-empty description="暂无数据，请先执行查询" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Search, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useReportStore } from '@/stores/report'
import type { QueryParam } from '@/types/report'
import ViewTabs from '@/components/ViewTabs.vue'
import GridView from '@/components/GridView.vue'
import ChartView from '@/components/ChartView.vue'
import ExcelView from '@/components/ExcelView.vue'

const route = useRoute()
const reportStore = useReportStore()

const activeViewType = ref('Grid')
const formRef = ref()
const formData = ref<Record<string, unknown>>({})

const loading = computed(() => reportStore.loading)
const currentReport = computed(() => reportStore.currentReport)
const currentView = computed(() => reportStore.currentView)
const reportData = computed(() => reportStore.reportData)

const reportPath = computed(() => {
  const path = route.params.path
  if (Array.isArray(path)) {
    return decodeURIComponent(path.join('/'))
  }
  return decodeURIComponent(path || '')
})

const reportName = computed(() => {
  const parts = reportPath.value.split('\\')
  return parts[parts.length - 1] || '报表'
})

// 过滤隐藏参数
const visibleParams = computed(() =>
  currentReport.value?.queryParams.filter(p => p.ParameterUIBindType !== 'Hidden') || []
)

// 获取开始日期和结束日期的参数名
const startDateParam = computed(() =>
  currentReport.value?.queryParams.find(p => p.ParameterUIBindType === 'StartDate')?.Name
)
const endDateParam = computed(() =>
  currentReport.value?.queryParams.find(p => p.ParameterUIBindType === 'EndDate')?.Name
)

// 初始化表单数据，利用 MonthOffset/MonthDay 计算默认日期
watch(() => currentReport.value?.queryParams, (params) => {
  if (params) {
    const data: Record<string, unknown> = {}
    const defaults = computeDefaultDates()
    params.forEach(param => {
      if (param.ParameterUIBindType === 'StartDate' && !param.DefaultValue) {
        data[param.Name] = defaults.startDate
      } else if (param.ParameterUIBindType === 'EndDate' && !param.DefaultValue) {
        data[param.Name] = defaults.endDate
      } else {
        data[param.Name] = param.DefaultValue
      }
    })
    formData.value = data
  }
}, { immediate: true })

function getParamLabel(param: QueryParam) {
  return param.DisplayName || param.Name.replace('@', '')
}

function isNumberType(param: QueryParam) {
  const name = param.DataType?.name
  return name === 'Int32' || name === 'Int64' || name === 'Int16' || name === 'Byte'
}

function isBooleanType(param: QueryParam) {
  return param.DataType?.name === 'Boolean'
}

function isDateTimeType(param: QueryParam) {
  return param.DataType?.name === 'DateTime'
}

function isDecimalType(param: QueryParam) {
  const name = param.DataType?.name
  return name === 'Decimal' || name === 'Double' || name === 'Single' || name === 'Float'
}

// 根据 MonthOffset 和 MonthDay 计算默认日期
function computeDefaultDates(): { startDate: string; endDate: string } {
  const monthOffset = currentReport.value?.MonthOffset ?? 0
  const monthDay = currentReport.value?.MonthDay ?? 1

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, monthDay)
  const endDate = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, monthDay - 1)

  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return { startDate: fmt(startDate), endDate: fmt(endDate) }
}

// 校验日期范围
function validateDateRange(): boolean {
  if (!startDateParam.value || !endDateParam.value) return true

  const start = formData.value[startDateParam.value] as string
  const end = formData.value[endDateParam.value] as string

  if (start && end && start > end) {
    ElMessage.warning('开始日期不能大于结束日期')
    return false
  }
  return true
}

async function loadReport() {
  if (!reportPath.value) return

  await reportStore.loadReportDefinition(reportPath.value)
  await reportStore.loadReportView(reportPath.value, activeViewType.value)
  await reportStore.queryReportData(formData.value)
}

function handleRetryLoad() {
  reportStore.clearError()
  loadReport()
}

function handleQuery() {
  if (!validateDateRange()) return

  reportStore.queryReportData(formData.value)
}

function handleReset() {
  if (currentReport.value) {
    const data: Record<string, unknown> = {}
    currentReport.value.queryParams.forEach(param => {
      data[param.Name] = param.DefaultValue
    })
    formData.value = data
    reportStore.queryReportData(data)
  }
}

function handleViewChange(viewType: string) {
  reportStore.loadReportView(reportPath.value, viewType)
}

function handlePageChange(page: number, size: number) {
  // 当报表启用分页时，携带分页参数重新请求数据（服务端分页）
  // 实际对接后端 API 后，此处会触发带分页参数的网络请求
  if (currentReport.value?.Paging) {
    reportStore.queryReportData(formData.value, page, size)
  }
}

watch(() => route.params.path, () => {
  loadReport()
})

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.report-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
}

.error-alert {
  flex-shrink: 0;
}

.breadcrumb {
  margin-bottom: var(--spacing-xs);
  flex-shrink: 0;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 报表面板 - 标题和查询条件合并 */
.report-panel {
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-left h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.panel-query {
  padding: var(--spacing-md) var(--spacing-lg);
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.form-input {
  width: 180px;
}

.form-actions {
  margin-left: auto;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-regular);
  font-size: var(--font-size-sm);
}

.view-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state {
  padding: var(--spacing-xl);
  flex: 1;
}
</style>
