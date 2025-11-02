<template>
  <div class="financial-chart-container">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-700 dark:via-blue-700 dark:to-purple-700 p-6">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <font-awesome-icon icon="chart-bar" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-2xl font-bold text-white">{{ title }}</h3>
            <p class="text-blue-100 text-sm mt-1">{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Chart Type Selector -->
      <div class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div class="flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm">
          <button
            @click="chartType = 'bar'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2',
              chartType === 'bar'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <font-awesome-icon icon="chart-bar" />
            Barres
          </button>
          <button
            @click="chartType = 'pie'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2',
              chartType === 'pie'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <font-awesome-icon icon="circle" />
            Camembert
          </button>
          <button
            @click="chartType = 'line'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2',
              chartType === 'line'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <font-awesome-icon icon="chart-line" />
            Courbe
          </button>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="p-6">
        <div ref="chartDiv" class="w-full" style="min-height: 400px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface ChartData {
  category: string
  value: number
  color?: string
}

interface Props {
  title?: string
  subtitle?: string
  data?: ChartData[]
  initialChartType?: 'bar' | 'pie' | 'line'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Visualisation Financière',
  subtitle: 'Analyse des données budgétaires',
  initialChartType: 'bar',
  data: () => [
    { category: 'Recettes Fiscales', value: 125000000, color: '#10b981' },
    { category: 'Recettes Domaniales', value: 85000000, color: '#34d399' },
    { category: 'Subventions', value: 65000000, color: '#6ee7b7' },
    { category: 'Autres Recettes', value: 45000000, color: '#a7f3d0' },
  ]
})

const chartDiv = ref<HTMLDivElement | null>(null)
const chartType = ref<'bar' | 'pie' | 'line'>(props.initialChartType)
let root: any = null
let chart: any = null

const { $am5 } = useNuxtApp()

const createBarChart = () => {
  if (!chartDiv.value || !$am5) return

  // Create root
  root = $am5.core.Root.new(chartDiv.value)

  // Set themes
  root.setThemes([
    $am5.themes.Animated.new(root),
    $am5.themes.Responsive.new(root)
  ])

  // Create chart
  chart = root.container.children.push(
    $am5.xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout,
      paddingLeft: 0,
      paddingRight: 0
    })
  )

  // Create axes
  const xAxis = chart.xAxes.push(
    $am5.xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: $am5.xy.AxisRendererX.new(root, {
        minGridDistance: 30
      }),
      tooltip: $am5.core.Tooltip.new(root, {})
    })
  )

  xAxis.data.setAll(props.data)

  const yAxis = chart.yAxes.push(
    $am5.xy.ValueAxis.new(root, {
      renderer: $am5.xy.AxisRendererY.new(root, {})
    })
  )

  // Create series
  const series = chart.series.push(
    $am5.xy.ColumnSeries.new(root, {
      name: 'Montant',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'value',
      categoryXField: 'category',
      tooltip: $am5.core.Tooltip.new(root, {
        labelText: '{categoryX}: {valueY} Ar'
      })
    })
  )

  // Set colors
  series.columns.template.setAll({
    strokeOpacity: 0,
    cornerRadiusTL: 8,
    cornerRadiusTR: 8
  })

  series.columns.template.adapters.add('fill', (fill: any, target: any) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const index = series.dataItems.indexOf(dataItem)
      return $am5.core.color(props.data[index]?.color || '#3b82f6')
    }
    return fill
  })

  series.data.setAll(props.data)

  // Animate
  series.appear(1000)
  chart.appear(1000, 100)
}

const createPieChart = () => {
  if (!chartDiv.value || !$am5) return

  // Create root
  root = $am5.core.Root.new(chartDiv.value)

  // Set themes
  root.setThemes([
    $am5.themes.Animated.new(root),
    $am5.themes.Responsive.new(root)
  ])

  // Create chart
  chart = root.container.children.push(
    $am5.percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: $am5.core.percent(50)
    })
  )

  // Create series
  const series = chart.series.push(
    $am5.percent.PieSeries.new(root, {
      valueField: 'value',
      categoryField: 'category',
      legendLabelText: '{category}',
      legendValueText: '{value} Ar'
    })
  )

  // Set colors
  series.slices.template.setAll({
    strokeWidth: 2,
    stroke: $am5.core.color(0xffffff)
  })

  series.slices.template.adapters.add('fill', (fill: any, target: any) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const index = series.dataItems.indexOf(dataItem)
      return $am5.core.color(props.data[index]?.color || '#3b82f6')
    }
    return fill
  })

  series.labels.template.setAll({
    text: '{category}: {valuePercentTotal.formatNumber("0.00")}%',
    fontSize: 12
  })

  series.data.setAll(props.data)

  // Add legend
  const legend = chart.children.push(
    $am5.core.Legend.new(root, {
      centerX: $am5.core.percent(50),
      x: $am5.core.percent(50),
      layout: root.horizontalLayout
    })
  )

  legend.data.setAll(series.dataItems)

  // Animate
  series.appear(1000, 100)
}

const createLineChart = () => {
  if (!chartDiv.value || !$am5) return

  // Create root
  root = $am5.core.Root.new(chartDiv.value)

  // Set themes
  root.setThemes([
    $am5.themes.Animated.new(root),
    $am5.themes.Responsive.new(root)
  ])

  // Create chart
  chart = root.container.children.push(
    $am5.xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout
    })
  )

  // Create axes
  const xAxis = chart.xAxes.push(
    $am5.xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: $am5.xy.AxisRendererX.new(root, {
        minGridDistance: 30
      }),
      tooltip: $am5.core.Tooltip.new(root, {})
    })
  )

  xAxis.data.setAll(props.data)

  const yAxis = chart.yAxes.push(
    $am5.xy.ValueAxis.new(root, {
      renderer: $am5.xy.AxisRendererY.new(root, {})
    })
  )

  // Create series
  const series = chart.series.push(
    $am5.xy.LineSeries.new(root, {
      name: 'Montant',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'value',
      categoryXField: 'category',
      stroke: $am5.core.color('#3b82f6'),
      tooltip: $am5.core.Tooltip.new(root, {
        labelText: '{categoryX}: {valueY} Ar'
      })
    })
  )

  series.strokes.template.setAll({
    strokeWidth: 3
  })

  series.bullets.push(() => {
    return $am5.core.Bullet.new(root, {
      sprite: $am5.core.Circle.new(root, {
        radius: 5,
        fill: series.get('stroke'),
        stroke: $am5.core.color(0xffffff),
        strokeWidth: 2
      })
    })
  })

  series.data.setAll(props.data)

  // Animate
  series.appear(1000)
  chart.appear(1000, 100)
}

const disposeChart = () => {
  if (root) {
    root.dispose()
    root = null
    chart = null
  }
}

const renderChart = () => {
  disposeChart()

  if (chartType.value === 'bar') {
    createBarChart()
  } else if (chartType.value === 'pie') {
    createPieChart()
  } else if (chartType.value === 'line') {
    createLineChart()
  }
}

onMounted(() => {
  renderChart()
})

onUnmounted(() => {
  disposeChart()
})

watch(chartType, () => {
  renderChart()
})

watch(() => props.data, () => {
  renderChart()
}, { deep: true })
</script>

<style scoped>
.financial-chart-container {
  width: 100%;
}
</style>
