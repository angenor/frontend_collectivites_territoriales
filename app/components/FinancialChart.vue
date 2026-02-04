<template>
  <div>
    <!-- Chart type selector -->
    <div class="flex items-center justify-end gap-2 mb-4">
      <button
        v-for="type in chartTypes"
        :key="type.value"
        @click="currentChartType = type.value"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        :class="currentChartType === type.value
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        <font-awesome-icon :icon="type.icon" class="w-3 h-3" />
        {{ type.label }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!data || !data.length" class="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500">
      <div class="text-center">
        <font-awesome-icon icon="chart-bar" class="w-10 h-10 mb-2 opacity-50" />
        <p class="text-sm">Aucune donnée disponible</p>
      </div>
    </div>

    <!-- Chart container -->
    <div v-else ref="chartRef" class="h-72" />
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

interface ChartDataItem {
  category: string
  value: number
  color: string
}

interface Props {
  title?: string
  subtitle?: string
  data: ChartDataItem[]
  initialChartType?: 'bar' | 'pie'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  initialChartType: 'bar',
})

const chartTypes = [
  { value: 'bar' as const, label: 'Barres', icon: 'chart-bar' },
  { value: 'pie' as const, label: 'Camembert', icon: 'chart-pie' },
]

const chartRef = ref<HTMLElement | null>(null)
const currentChartType = ref<'bar' | 'pie'>(props.initialChartType)

let root: am5.Root | null = null

const isDarkMode = () => {
  if (!import.meta.client) return false
  return document.documentElement.classList.contains('dark')
}

const disposeChart = () => {
  if (root) {
    root.dispose()
    root = null
  }
}

const initBarChart = () => {
  if (!chartRef.value || !props.data.length) return

  disposeChart()

  root = am5.Root.new(chartRef.value)
  root.setThemes([am5themes_Animated.new(root)])

  const dark = isDarkMode()
  const labelColor = dark ? '#9ca3af' : '#6b7280'

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      paddingLeft: 0,
      layout: root.verticalLayout,
    })
  )

  // X axis
  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
        cellStartLocation: 0.15,
        cellEndLocation: 0.85,
      }),
    })
  )
  xAxis.get('renderer').labels.template.setAll({
    fontSize: 11,
    fill: am5.color(labelColor),
    oversizedBehavior: 'wrap',
    maxWidth: 120,
    textAlign: 'center',
  })
  xAxis.get('renderer').grid.template.setAll({
    strokeOpacity: dark ? 0.1 : 0.15,
  })
  xAxis.data.setAll(props.data)

  // Y axis
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      numberFormat: "#.#a' Ar'",
    })
  )
  yAxis.get('renderer').labels.template.setAll({
    fontSize: 11,
    fill: am5.color(labelColor),
  })
  yAxis.get('renderer').grid.template.setAll({
    strokeOpacity: dark ? 0.1 : 0.15,
  })

  // Series
  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: 'value',
      categoryXField: 'category',
      tooltip: am5.Tooltip.new(root, {
        labelText: "{category}: {valueY.formatNumber('#,###')} Ar",
      }),
    })
  )

  series.columns.template.setAll({
    cornerRadiusTL: 6,
    cornerRadiusTR: 6,
    strokeOpacity: 0,
    fillOpacity: 0.9,
    width: am5.percent(70),
  })

  // Individual bar colors from data
  series.columns.template.adapters.add('fill', (_fill, target) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const data = dataItem.dataContext as ChartDataItem
      if (data?.color) return am5.color(data.color)
    }
    return _fill
  })

  series.columns.template.states.create('hover', {
    fillOpacity: 1,
  })

  series.data.setAll(props.data)
  series.appear(1000)

  // Cursor
  chart.set('cursor', am5xy.XYCursor.new(root, {
    behavior: 'none',
  }))

  chart.appear(1000, 100)
}

const initPieChart = () => {
  if (!chartRef.value || !props.data.length) return

  disposeChart()

  root = am5.Root.new(chartRef.value)
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(40),
    })
  )

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: 'value',
      categoryField: 'category',
      tooltip: am5.Tooltip.new(root, {
        labelText: "{category}: {value.formatNumber('#,###')} Ar ({valuePercentTotal.formatNumber('0.0')}%)",
      }),
    })
  )

  // Individual slice colors from data
  series.slices.template.adapters.add('fill', (_fill, target) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const data = dataItem.dataContext as ChartDataItem
      if (data?.color) return am5.color(data.color)
    }
    return _fill
  })
  series.slices.template.adapters.add('stroke', (_stroke, target) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const data = dataItem.dataContext as ChartDataItem
      if (data?.color) return am5.color(data.color)
    }
    return _stroke
  })

  series.slices.template.setAll({
    strokeWidth: 2,
    strokeOpacity: 0.3,
  })

  series.slices.template.states.create('hover', {
    scale: 1.05,
  })

  // Labels
  const dark = isDarkMode()
  const labelColor = dark ? '#d1d5db' : '#374151'

  series.labels.template.setAll({
    fontSize: 12,
    fill: am5.color(labelColor),
    text: '{category}',
    maxWidth: 120,
    oversizedBehavior: 'wrap',
  })

  series.ticks.template.setAll({
    stroke: am5.color(dark ? '#4b5563' : '#d1d5db'),
  })

  series.data.setAll(props.data)
  series.appear(1000, 100)
  chart.appear(1000, 100)
}

const initChart = () => {
  if (!import.meta.client) return
  if (currentChartType.value === 'pie') {
    initPieChart()
  } else {
    initBarChart()
  }
}

// Watch chart type changes
watch(currentChartType, () => {
  nextTick(() => initChart())
})

// Watch data changes
watch(() => props.data, (newData) => {
  if (import.meta.client && newData?.length) {
    nextTick(() => initChart())
  }
}, { deep: true })

onMounted(() => {
  if (import.meta.client && props.data?.length) {
    nextTick(() => initChart())
  }
})

onUnmounted(() => {
  disposeChart()
})
</script>
