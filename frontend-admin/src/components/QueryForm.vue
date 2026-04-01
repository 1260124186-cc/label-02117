<template>
  <div class="query-form card">
    <div class="form-header">
      <div class="header-title">
        <el-icon><Filter /></el-icon>
        <span>查询条件</span>
      </div>
      <el-tag type="info" size="small">{{ visibleParams.length }} 个参数</el-tag>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :inline="true"
      class="form-content"
      label-position="top"
    >
      <template v-for="param in visibleParams" :key="param.Name">
        <!-- 普通输入 -->
        <el-form-item
          v-if="param.ParameterUIBindType === 'Normal'"
          :label="param.DisplayName || param.Name.replace('@', '')"
        >
          <el-input
            v-if="isStringType(param)"
            v-model="formData[param.Name]"
            :placeholder="`请输入${param.DisplayName || param.Name.replace('@', '')}`"
            clearable
            class="form-input"
          />
          <el-input-number
            v-else-if="isNumberType(param)"
            v-model="formData[param.Name]"
            :placeholder="`请输入${param.DisplayName || param.Name.replace('@', '')}`"
            controls-position="right"
            class="form-input"
          />
        </el-form-item>

        <!-- 开始日期 -->
        <el-form-item
          v-else-if="param.ParameterUIBindType === 'StartDate'"
          :label="param.DisplayName || '开始日期'"
        >
          <el-date-picker
            v-model="formData[param.Name]"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            class="form-input"
          />
        </el-form-item>

        <!-- 结束日期 -->
        <el-form-item
          v-else-if="param.ParameterUIBindType === 'EndDate'"
          :label="param.DisplayName || '结束日期'"
        >
          <el-date-picker
            v-model="formData[param.Name]"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            class="form-input"
          />
        </el-form-item>
      </template>

      <el-form-item class="form-actions" label=" ">
        <el-button
          type="primary"
          :icon="Search"
          :loading="loading"
          @click="handleQuery"
        >
          查询
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { QueryParam } from '@/types/report'

const props = defineProps<{
  params: QueryParam[]
  loading: boolean
}>()

const emit = defineEmits<{
  query: [data: Record<string, unknown>]
  reset: []
}>()

const formRef = ref()
const formData = ref<Record<string, unknown>>({})

const visibleParams = computed(() =>
  props.params.filter(p => p.ParameterUIBindType !== 'Hidden')
)

watch(() => props.params, (params) => {
  const data: Record<string, unknown> = {}
  params.forEach(param => {
    data[param.Name] = param.DefaultValue
  })
  formData.value = data
}, { immediate: true })

function isStringType(param: QueryParam) {
  return param.DataType?.name === 'String' || !param.DataType
}

function isNumberType(param: QueryParam) {
  return param.DataType?.name === 'Int32' || param.DataType?.name === 'Int64'
}

function handleQuery() {
  emit('query', { ...formData.value })
}

function handleReset() {
  const data: Record<string, unknown> = {}
  props.params.forEach(param => {
    data[param.Name] = param.DefaultValue
  })
  formData.value = data
  emit('reset')
}
</script>

<style scoped>
.query-form {
  margin-bottom: var(--spacing-md);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-content {
  padding: var(--spacing-md);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.form-actions {
  margin-left: auto;
}

.form-input {
  width: 200px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-regular);
  font-size: var(--font-size-sm);
  padding-bottom: var(--spacing-xs);
}
</style>
