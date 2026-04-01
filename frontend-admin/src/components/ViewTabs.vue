<template>
  <div class="view-tabs">
    <el-radio-group v-model="activeView" size="default" @change="handleViewChange">
      <el-radio-button
        v-for="view in views"
        :key="view.ViewType"
        :value="view.ViewType"
      >
        <span class="tab-content">
          <el-icon class="tab-icon">
            <Grid v-if="view.ViewType === 'Grid'" />
            <PieChart v-else-if="view.ViewType === 'MSChart'" />
            <Document v-else />
          </el-icon>
          <span class="tab-label">{{ view.ViewName }}</span>
        </span>
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ReportView } from '@/types/report'

const props = defineProps<{
  views: ReportView[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const activeView = ref(props.modelValue || props.views[0]?.ViewType || 'Grid')

watch(() => props.modelValue, (val) => {
  activeView.value = val
})

function handleViewChange(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.view-tabs {
  margin-bottom: var(--spacing-md);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tab-icon {
  font-size: 14px;
}

.tab-label {
  font-size: var(--font-size-sm);
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
