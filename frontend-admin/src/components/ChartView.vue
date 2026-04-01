<template>
  <div class="chart-view card">
    <div class="chart-header">
      <div class="header-left">
        <el-icon><PieChart /></el-icon>
        <span class="header-title">{{ reportName }}</span>
      </div>
      <div class="header-right">
        <el-radio-group v-model="chartType" size="small">
          <el-radio-button value="bar">
            <el-icon><Histogram /></el-icon>
            柱状图
          </el-radio-button>
          <el-radio-button value="line">
            <el-icon><TrendCharts /></el-icon>
            曲线图
          </el-radio-button>
          <el-radio-button value="pie">
            <el-icon><PieChart /></el-icon>
            饼图
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="chart-body" v-loading="loading">
      <div ref="chartRef" class="chart-container"></div>
      <el-empty v-if="!data.length && !loading" description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Histogram, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps<{
  reportName: string
  data: Record<string, unknown>[]
  loading: boolean
}>()

const chartRef = ref<HTMLElement>()
const chartType = ref('bar')
let chartInstance: echarts.ECharts | null = null

const colorPalette = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance || !props.data.length) return

  const months = props.data.map(d => `${d.Month}月`)
  const approved = props.data.map(d => d.Approved as number)
  const rejected = props.data.map(d => d.Rejected as number)
  const running = props.data.map(d => d.Running as number)
  const total = props.data.map(d => d.Total as number)

  let option: echarts.EChartsOption

  if (chartType.value === 'pie') {
    const pieData = [
      { name: '核准', value: approved.reduce((a, b) => a + b, 0) },
      { name: '驳回', value: rejected.reduce((a, b) => a + b, 0) },
      { name: '运行中', value: running.reduce((a, b) => a + b, 0) }
    ]

    option = {
      color: colorPalette,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: { color: '#262626' }
      },
      legend: {
        bottom: 20,
        textStyle: { color: '#595959' }
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: '#595959'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: pieData
      }]
    }
  } else {
    const seriesType = chartType.value as 'bar' | 'line'
    option = {
      color: colorPalette,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: { color: '#262626' }
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#595959' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#595959' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#595959' }
      },
      series: [
        {
          name: '核准',
          type: seriesType,
          data: approved,
          smooth: true,
          itemStyle: { borderRadius: seriesType === 'bar' ? [4, 4, 0, 0] : 0 }
        },
        {
          name: '驳回',
          type: seriesType,
          data: rejected,
          smooth: true,
          itemStyle: { borderRadius: seriesType === 'bar' ? [4, 4, 0, 0] : 0 }
        },
        {
          name: '运行中',
          type: seriesType,
          data: running,
          smooth: true,
          itemStyle: { borderRadius: seriesType === 'bar' ? [4, 4, 0, 0] : 0 }
        },
        {
          name: '合计',
          type: seriesType,
          data: total,
          smooth: true,
          itemStyle: { borderRadius: seriesType === 'bar' ? [4, 4, 0, 0] : 0 }
        }
      ]
    }
  }

  chartInstance.setOption(option, true)
}

function handleResize() {
  chartInstance?.resize()
}

watch(() => props.data, updateChart, { deep: true })
watch(chartType, updateChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.chart-view {
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.chart-header {
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

.chart-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  min-height: 400px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 380px;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
