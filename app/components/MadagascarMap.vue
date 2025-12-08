<script setup lang="ts">
import type { RegionWithStats } from '~/types/collectivites'
import type { CompteAdministratifWithStats } from '~/types/comptes-administratifs'

// Types pour les marqueurs
export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  label: string
  count: number
  comptes: CompteAdministratifWithStats[]
}

// Props
const props = defineProps<{
  regions: RegionWithStats[]
  comptes?: CompteAdministratifWithStats[]
  isLoading?: boolean
  selectedRegionId?: number | null
}>()

// Emits
const emit = defineEmits<{
  regionClick: [region: RegionWithStats | null]
  regionHover: [region: RegionWithStats | null]
  markerClick: [comptes: CompteAdministratifWithStats[], location: { label: string; latitude: number; longitude: number }]
}>()

// amCharts
const { $am5 } = useNuxtApp()
const { isDark } = useDarkMode()

// Refs
const chartRef = ref<HTMLDivElement | null>(null)
let root: any = null
let chart: any = null
let polygonSeries: any = null
let pointSeries: any = null

// Coordonnées précises des capitales/centres des régions de Madagascar
const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  // Hautes terres centrales
  'Analamanga': { lat: -18.8792, lng: 47.5079 }, // Antananarivo
  'Vakinankaratra': { lat: -19.8659, lng: 47.0333 }, // Antsirabe
  'Itasy': { lat: -19.05, lng: 46.75 }, // Miarinarivo
  'Bongolava': { lat: -18.45, lng: 45.95 }, // Tsiroanomandidy

  // Fianarantsoa
  "Amoron'i Mania": { lat: -20.4583, lng: 47.1 }, // Ambositra
  'Haute Matsiatra': { lat: -21.4333, lng: 47.0833 }, // Fianarantsoa
  'Vatovavy': { lat: -21.2, lng: 47.82 }, // Manakara region
  'Fitovinany': { lat: -22.15, lng: 47.83 }, // Manakara Sud
  'Vatovavy-Fitovinany': { lat: -21.55, lng: 47.93 }, // Manakara
  'Ihorombe': { lat: -22.4, lng: 46.3167 }, // Ihosy
  'Atsimo-Atsinanana': { lat: -23.35, lng: 47.6 }, // Farafangana

  // Est
  'Alaotra-Mangoro': { lat: -17.8333, lng: 48.4333 }, // Ambatondrazaka
  'Atsinanana': { lat: -18.1492, lng: 49.4022 }, // Toamasina
  'Analanjirofo': { lat: -16.9833, lng: 49.8667 }, // Fenoarivo Atsinanana

  // Nord
  'Sofia': { lat: -14.9, lng: 47.9833 }, // Antsohihy
  'Boeny': { lat: -15.7167, lng: 46.3167 }, // Mahajanga
  'Betsiboka': { lat: -16.95, lng: 46.8333 }, // Maevatanana
  'Melaky': { lat: -17.65, lng: 44.0167 }, // Maintirano
  'Diana': { lat: -12.2833, lng: 49.2833 }, // Antsiranana
  'Sava': { lat: -14.2667, lng: 50.0167 }, // Sambava

  // Sud
  'Atsimo-Andrefana': { lat: -23.35, lng: 43.6833 }, // Toliara
  'Androy': { lat: -24.85, lng: 45.1667 }, // Ambovombe
  'Anosy': { lat: -25.0333, lng: 46.9833 }, // Taolagnaro
  'Menabe': { lat: -19.8667, lng: 44.5333 }, // Morondava
}

// Mapping des IDs amCharts vers les noms de régions
const amchartsToRegionName: Record<string, string> = {
  'MG-TIT': 'Itasy',
  'MG-TAT': 'Analamanga',
  'MG-TVA': 'Vakinankaratra',
  'MG-TBO': 'Bongolava',
  'MG-FAM': "Amoron'i Mania",
  'MG-FHM': 'Haute Matsiatra',
  'MG-FVF': 'Vatovavy-Fitovinany',
  'MG-FVH': 'Vatovavy',
  'MG-FFT': 'Fitovinany',
  'MG-FHO': 'Ihorombe',
  'MG-FAT': 'Atsimo-Atsinanana',
  'MG-MAL': 'Alaotra-Mangoro',
  'MG-AAO': 'Alaotra-Mangoro',
  'MG-MAT': 'Atsinanana',
  'MG-MAA': 'Analanjirofo',
  'MG-MSF': 'Sofia',
  'MG-MBO': 'Boeny',
  'MG-MBT': 'Betsiboka',
  'MG-MME': 'Melaky',
  'MG-AAM': 'Atsimo-Andrefana',
  'MG-TAD': 'Androy',
  'MG-TAN': 'Anosy',
  'MG-MAM': 'Menabe',
  'MG-DSN': 'Diana',
  'MG-DSV': 'Sava',
}

// Trouver une région par son nom
const findRegionByName = (name: string): RegionWithStats | undefined => {
  return props.regions.find(r =>
    r.nom.toLowerCase() === name.toLowerCase() ||
    r.nom.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(r.nom.toLowerCase())
  )
}

// Trouver une région par son ID amCharts
const findRegionByAmchartsId = (amchartsId: string): RegionWithStats | undefined => {
  const regionName = amchartsToRegionName[amchartsId]
  if (!regionName) return undefined
  return findRegionByName(regionName)
}

// Couleur basée sur les statistiques
const getRegionColor = (region: RegionWithStats | undefined): string => {
  if (!region) return isDark.value ? '#374151' : '#e5e7eb'

  // Couleur basée sur nb_communes (plus de communes = plus foncé)
  const nbCommunes = region.nb_communes || 0
  if (nbCommunes === 0) return isDark.value ? '#374151' : '#e5e7eb'
  if (nbCommunes < 10) return isDark.value ? '#1e40af' : '#93c5fd'
  if (nbCommunes < 20) return isDark.value ? '#1d4ed8' : '#60a5fa'
  if (nbCommunes < 30) return isDark.value ? '#2563eb' : '#3b82f6'
  return isDark.value ? '#3b82f6' : '#2563eb'
}

// Initialiser le graphique
const initChart = async () => {
  if (!chartRef.value || !$am5) return

  // Importer le geodata dynamiquement
  const madagascarRegionHigh = await import('@amcharts/amcharts5-geodata/madagascarRegionHigh').then(m => m.default)

  // Créer le root
  root = $am5.core.Root.new(chartRef.value)

  // Appliquer les thèmes
  root.setThemes([
    $am5.themes.Animated.new(root),
  ])

  // Créer le chart
  chart = root.container.children.push(
    $am5.map.MapChart.new(root, {
      panX: 'rotateX',
      panY: 'translateY',
      projection: $am5.map.geoMercator(),
      homeGeoPoint: { latitude: -18.8792, longitude: 47.5079 },
      homeZoomLevel: 1,
    })
  )

  // Créer la série de polygones
  polygonSeries = chart.series.push(
    $am5.map.MapPolygonSeries.new(root, {
      geoJSON: madagascarRegionHigh,
      valueField: 'value',
      calculateAggregates: true,
    })
  )

  // Style des polygones
  polygonSeries.mapPolygons.template.setAll({
    tooltipText: '{name}',
    interactive: true,
    fill: $am5.core.color(isDark.value ? '#374151' : '#e5e7eb'),
    strokeWidth: 1,
    stroke: $am5.core.color(isDark.value ? '#1f2937' : '#ffffff'),
  })

  // États hover et active
  polygonSeries.mapPolygons.template.states.create('hover', {
    fill: $am5.core.color(isDark.value ? '#4f46e5' : '#818cf8'),
  })

  polygonSeries.mapPolygons.template.states.create('active', {
    fill: $am5.core.color(isDark.value ? '#7c3aed' : '#a78bfa'),
  })

  // Événements
  polygonSeries.mapPolygons.template.events.on('click', (ev: any) => {
    const dataItem = ev.target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      emit('regionClick', region || null)
    }
  })

  polygonSeries.mapPolygons.template.events.on('pointerover', (ev: any) => {
    const dataItem = ev.target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      emit('regionHover', region || null)
    }
  })

  polygonSeries.mapPolygons.template.events.on('pointerout', () => {
    emit('regionHover', null)
  })

  // Adapter le tooltip pour montrer les stats
  polygonSeries.mapPolygons.template.adapters.add('tooltipText', (_text: string, target: any) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      if (region) {
        return `[bold]{name}[/]\nCommunes: ${region.nb_communes || 0}\nProvince: ${region.province_nom || 'N/A'}`
      }
    }
    return '{name}'
  })

  // Mettre à jour les couleurs
  updateColors()

  // Ajouter les contrôles de zoom
  chart.set('zoomControl', $am5.map.ZoomControl.new(root, {}))
}

// Mettre à jour les couleurs des régions
const updateColors = () => {
  if (!polygonSeries) return

  polygonSeries.mapPolygons.each((polygon: any) => {
    const dataItem = polygon.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      const color = getRegionColor(region)
      polygon.set('fill', $am5.core.color(color))
    }
  })
}

// Calculer les marqueurs à partir des comptes administratifs
const computeMarkers = (): MapMarker[] => {
  if (!props.comptes || props.comptes.length === 0) return []

  // Grouper les comptes par localisation (commune > région)
  const locationMap = new Map<string, {
    label: string
    regionName: string
    comptes: CompteAdministratifWithStats[]
  }>()

  for (const compte of props.comptes) {
    // Déterminer la clé de localisation
    let locationKey = ''
    let label = ''
    let regionName = ''

    if (compte.commune) {
      locationKey = `commune_${compte.commune.id}`
      label = compte.commune.nom
      // On utilise la région parente pour les coordonnées
      regionName = compte.region?.nom || ''
    } else if (compte.region) {
      locationKey = `region_${compte.region.id}`
      label = compte.region.nom
      regionName = compte.region.nom
    }

    if (!locationKey) continue

    if (!locationMap.has(locationKey)) {
      locationMap.set(locationKey, { label, regionName, comptes: [] })
    }
    locationMap.get(locationKey)!.comptes.push(compte)
  }

  // Convertir en marqueurs avec coordonnées
  const markers: MapMarker[] = []
  let index = 0

  for (const [key, data] of locationMap) {
    const coords = regionCoordinates[data.regionName]
    if (!coords) continue

    // Décaler légèrement les marqueurs de communes pour éviter la superposition
    const offset = key.startsWith('commune_') ? (index * 0.15) : 0

    markers.push({
      id: key,
      latitude: coords.lat + (Math.sin(index) * offset),
      longitude: coords.lng + (Math.cos(index) * offset),
      label: data.label,
      count: data.comptes.length,
      comptes: data.comptes,
    })
    index++
  }

  return markers
}

// Créer ou mettre à jour les marqueurs sur la carte
const updateMarkers = () => {
  if (!chart || !root || !$am5) return

  const markers = computeMarkers()

  // Supprimer l'ancienne série si elle existe
  if (pointSeries) {
    chart.series.removeValue(pointSeries)
    pointSeries.dispose()
    pointSeries = null
  }

  if (markers.length === 0) return

  // Créer la série de points
  pointSeries = chart.series.push(
    $am5.map.MapPointSeries.new(root, {
      latitudeField: 'latitude',
      longitudeField: 'longitude',
    })
  )

  // Template pour les marqueurs - Style PIN comme Google Maps
  pointSeries.bullets.push(() => {
    const container = $am5.core.Container.new(root, {
      centerX: $am5.core.percent(50),
      centerY: $am5.core.percent(100), // Ancrer en bas pour que la pointe soit sur le point
    })

    // Ombre du pin
    const shadow = container.children.push(
      $am5.core.Ellipse.new(root, {
        radiusX: 8,
        radiusY: 3,
        fill: $am5.core.color('#000000'),
        fillOpacity: 0.3,
        dy: 2, // Juste en dessous du pin
        centerX: $am5.core.percent(50),
        centerY: $am5.core.percent(50),
      })
    )

    // Corps du pin (forme de goutte inversée)
    const pinBody = container.children.push(
      $am5.core.Graphics.new(root, {
        fill: $am5.core.color(isDark.value ? '#ef4444' : '#dc2626'),
        stroke: $am5.core.color('#ffffff'),
        strokeWidth: 2,
        cursorOverStyle: 'pointer',
        tooltipText: '{label}\n{count} compte(s)',
        // Dessiner la forme du pin
        draw: (display: any) => {
          // Forme de pin type Google Maps (pointe vers le bas)
          const w = 24 // largeur
          const h = 34 // hauteur totale
          const r = w / 2 // rayon du cercle supérieur

          display.moveTo(0, -h) // Point haut gauche
          // Arc supérieur gauche vers droite
          display.arc(0, -h + r, r, Math.PI, 0, false)
          // Ligne vers la pointe
          display.lineTo(0, 0)
          // Ligne vers le haut gauche
          display.lineTo(-r, -h + r)
          display.closePath()
        },
      })
    )

    // Cercle blanc intérieur (point central du pin)
    const innerCircle = container.children.push(
      $am5.core.Circle.new(root, {
        radius: 6,
        fill: $am5.core.color('#ffffff'),
        dy: -22, // Positionné au centre du cercle du pin
      })
    )

    // Badge avec le nombre de comptes
    const badge = container.children.push(
      $am5.core.Container.new(root, {
        dx: 14,
        dy: -38,
      })
    )

    badge.children.push(
      $am5.core.RoundedRectangle.new(root, {
        width: 18,
        height: 18,
        cornerRadiusTL: 9,
        cornerRadiusTR: 9,
        cornerRadiusBL: 9,
        cornerRadiusBR: 9,
        fill: $am5.core.color(isDark.value ? '#3b82f6' : '#2563eb'),
        stroke: $am5.core.color('#ffffff'),
        strokeWidth: 1.5,
        centerX: $am5.core.percent(50),
        centerY: $am5.core.percent(50),
      })
    )

    badge.children.push(
      $am5.core.Label.new(root, {
        text: '{count}',
        fill: $am5.core.color('#ffffff'),
        fontSize: 10,
        fontWeight: 'bold',
        centerX: $am5.core.percent(50),
        centerY: $am5.core.percent(50),
        populateText: true,
      })
    )

    // Animation au survol
    pinBody.states.create('hover', {
      scale: 1.15,
      dy: -5,
    })

    // Événement de clic
    pinBody.events.on('click', (ev: any) => {
      const dataItem = ev.target.dataItem
      if (dataItem) {
        const data = dataItem.dataContext as MapMarker
        emit('markerClick', data.comptes, {
          label: data.label,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      }
    })

    return $am5.core.Bullet.new(root, {
      sprite: container,
    })
  })

  // Ajouter les données
  pointSeries.data.setAll(markers)
}

// Watchers
watch(() => props.regions, () => {
  updateColors()
}, { deep: true })

watch(() => props.comptes, () => {
  updateMarkers()
}, { deep: true })

watch(isDark, () => {
  if (polygonSeries) {
    // Mettre à jour les couleurs de stroke et fond
    polygonSeries.mapPolygons.template.setAll({
      stroke: $am5.core.color(isDark.value ? '#1f2937' : '#ffffff'),
    })
    updateColors()
  }
  // Recréer les marqueurs pour les nouvelles couleurs
  updateMarkers()
})

// Lifecycle
onMounted(async () => {
  await initChart()
  // Mettre à jour les marqueurs après l'initialisation
  updateMarkers()
})

onUnmounted(() => {
  if (root) {
    root.dispose()
  }
})
</script>

<template>
  <div class="relative w-full h-full min-h-[400px]">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-xl"
    >
      <div class="flex flex-col items-center gap-3">
        <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <span class="text-sm text-gray-600 dark:text-gray-400">Chargement de la carte...</span>
      </div>
    </div>

    <!-- Chart container -->
    <div
      ref="chartRef"
      class="w-full h-full min-h-[400px] rounded-xl"
    />

    <!-- Légende -->
    <div class="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
      <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre de communes</h4>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#374151]' : 'bg-[#e5e7eb]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">0</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#1e40af]' : 'bg-[#93c5fd]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">1-9</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#1d4ed8]' : 'bg-[#60a5fa]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">10-19</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#2563eb]' : 'bg-[#3b82f6]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">20-29</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#3b82f6]' : 'bg-[#2563eb]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">30+</span>
        </div>
      </div>

      <!-- Légende marqueurs -->
      <div v-if="comptes && comptes.length > 0" class="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Comptes Administratifs</h4>
        <div class="flex items-center gap-2">
          <!-- Pin marker icon -->
          <svg class="w-5 h-6" viewBox="0 0 24 34" fill="none">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22c0-6.6-5.4-12-12-12z" fill="#dc2626" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="5" fill="#fff"/>
          </svg>
          <span class="text-xs text-gray-600 dark:text-gray-400">Cliquez sur un pin</span>
        </div>
      </div>
    </div>
  </div>
</template>
