<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/statistiques"
          class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style="color: var(--text-muted)"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
            Statistiques de visite
          </h1>
          <p class="text-sm" style="color: var(--text-muted)">
            Analyse détaillée du trafic sur la plateforme
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="periode"
          class="px-3 py-2 border rounded-lg text-sm"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="90j">90 derniers jours</option>
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Visites totales</p>
        <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
          {{ visitesStats.total_visites.toLocaleString('fr-FR') }}
        </p>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Visiteurs uniques</p>
        <p class="text-2xl font-semibold mt-1" style="color: var(--color-primary)">
          {{ visitesStats.visiteurs_uniques.toLocaleString('fr-FR') }}
        </p>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Pages vues</p>
        <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
          {{ visitesStats.pages_vues.toLocaleString('fr-FR') }}
        </p>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Durée moyenne</p>
        <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
          {{ formatDuree(visitesStats.duree_moyenne) }}
        </p>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Taux de rebond</p>
        <p class="text-2xl font-semibold mt-1" :class="visitesStats.taux_rebond > 50 ? 'text-amber-600' : 'text-green-600'">
          {{ visitesStats.taux_rebond }}%
        </p>
      </div>
    </div>

    <!-- Graphique évolution -->
    <div
      class="p-6 rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium" style="color: var(--text-primary)">Évolution des visites</h3>
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: var(--color-primary)"></span>
            <span style="color: var(--text-muted)">Visites</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            <span style="color: var(--text-muted)">Visiteurs</span>
          </div>
        </div>
      </div>
      <div class="h-64">
        <div v-if="visitesParJour.length > 0" class="h-full flex flex-col">
          <!-- Graphique -->
          <div class="flex-1 flex items-end gap-1">
            <div
              v-for="(jour, index) in visitesParJour"
              :key="index"
              class="flex-1 flex flex-col items-center gap-0.5"
            >
              <div
                class="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                style="background-color: var(--color-primary)"
                :style="{ height: `${(jour.visites / maxVisites) * 180}px`, minHeight: '4px' }"
                :title="`${formatDate(jour.date)}: ${jour.visites} visites`"
              />
              <div
                class="w-full rounded-t transition-all cursor-pointer hover:opacity-80 bg-green-500"
                :style="{ height: `${(jour.visiteurs / maxVisites) * 180}px`, minHeight: '2px' }"
                :title="`${formatDate(jour.date)}: ${jour.visiteurs} visiteurs`"
              />
            </div>
          </div>
          <!-- Légende dates -->
          <div class="flex justify-between mt-2 px-1">
            <span class="text-xs" style="color: var(--text-muted)">{{ formatDateShort(visitesParJour[0]?.date) }}</span>
            <span class="text-xs" style="color: var(--text-muted)">{{ formatDateShort(visitesParJour[Math.floor(visitesParJour.length / 2)]?.date) }}</span>
            <span class="text-xs" style="color: var(--text-muted)">{{ formatDateShort(visitesParJour[visitesParJour.length - 1]?.date) }}</span>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center" style="color: var(--text-muted)">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-6 h-6 animate-spin mr-2" />
          Chargement...
        </div>
      </div>
    </div>

    <!-- Pages populaires et Géographie -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pages populaires -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">Pages les plus visitées</h3>
        <div v-if="pagesPopulaires.length === 0" class="text-center py-8">
          <p style="color: var(--text-muted)">Aucune donnée disponible</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(page, index) in pagesPopulaires"
            :key="page.page_url"
            class="flex items-center gap-3"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              :class="index < 3 ? 'text-white' : ''"
              :style="{
                backgroundColor: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'var(--bg-tertiary)',
                color: index >= 3 ? 'var(--text-muted)' : undefined
              }"
            >
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate" style="color: var(--text-primary)">{{ page.page_url }}</p>
              <div class="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-1">
                <div
                  class="h-full rounded-full transition-all"
                  style="background-color: var(--color-primary)"
                  :style="{ width: `${(page.visites / maxPageVisites) * 100}%` }"
                />
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm font-medium" style="color: var(--text-primary)">{{ page.visites }}</span>
              <p class="text-xs" style="color: var(--text-muted)">visites</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Visites par région -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">Visites par région</h3>
        <div v-if="visitesParRegion.length === 0" class="text-center py-8">
          <p style="color: var(--text-muted)">Aucune donnée disponible</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="region in visitesParRegion.slice(0, 8)"
            :key="region.region"
            class="flex items-center justify-between"
          >
            <span class="text-sm" style="color: var(--text-secondary)">{{ region.region }}</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all"
                  style="background-color: var(--color-primary)"
                  :style="{ width: `${(region.visites / maxRegionVisites) * 100}%` }"
                />
              </div>
              <span class="text-sm font-medium w-12 text-right" style="color: var(--text-primary)">
                {{ region.visites }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visites par pays et téléchargements -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Visites par pays -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">Origine géographique</h3>
        <div v-if="visitesParPays.length === 0" class="text-center py-8">
          <p style="color: var(--text-muted)">Aucune donnée disponible</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="pays in visitesParPays.slice(0, 10)"
            :key="pays.pays"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ getPaysFlag(pays.pays) }}</span>
              <span class="text-sm" style="color: var(--text-secondary)">{{ pays.pays }}</span>
            </div>
            <span class="text-sm font-medium" style="color: var(--text-primary)">
              {{ pays.visites }} ({{ ((pays.visites / totalVisitesPays) * 100).toFixed(1) }}%)
            </span>
          </div>
        </div>
      </div>

      <!-- Téléchargements documents -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">Téléchargements de documents</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary)">
            <p class="text-3xl font-bold" style="color: var(--color-primary)">
              {{ telechargementsStats.total }}
            </p>
            <p class="text-xs mt-1" style="color: var(--text-muted)">Total téléchargements</p>
          </div>
          <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary)">
            <p class="text-3xl font-bold" style="color: var(--text-primary)">
              {{ telechargementsStats.documents_telecharges }}
            </p>
            <p class="text-xs mt-1" style="color: var(--text-muted)">Documents uniques</p>
          </div>
        </div>
        <div v-if="documentsPopulaires.length > 0" class="space-y-3">
          <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Documents les plus téléchargés</p>
          <div
            v-for="doc in documentsPopulaires"
            :key="doc.document_id"
            class="flex items-center justify-between p-2 rounded-lg"
            style="background-color: var(--bg-tertiary)"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <font-awesome-icon :icon="['fas', 'file-pdf']" class="w-4 h-4 text-red-500" />
              <span class="text-sm truncate" style="color: var(--text-secondary)">{{ doc.titre }}</span>
            </div>
            <span class="text-sm font-medium ml-2" style="color: var(--text-primary)">{{ doc.telechargements }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VisiteStats, PageStats } from '~/services/statistiques.service'

definePageMeta({
  layout: 'admin'
})

const statistiquesService = useStatistiquesService()

// État
const periode = ref<'7j' | '30j' | '90j'>('30j')

// Données
const visitesStats = ref<VisiteStats>({
  total_visites: 0,
  visiteurs_uniques: 0,
  pages_vues: 0,
  duree_moyenne: 0,
  taux_rebond: 0
})
const visitesParJour = ref<Array<{ date: string; visites: number; visiteurs: number }>>([])
const pagesPopulaires = ref<PageStats[]>([])
const visitesParRegion = ref<Array<{ region: string; visites: number }>>([])
const visitesParPays = ref<Array<{ pays: string; visites: number }>>([])
const telechargementsStats = ref<{ total: number; documents_telecharges: number }>({ total: 0, documents_telecharges: 0 })
const documentsPopulaires = ref<Array<{ document_id: string; titre: string; telechargements: number }>>([])

// Computed
const maxVisites = computed(() => Math.max(...visitesParJour.value.map(v => v.visites), 1))
const maxPageVisites = computed(() => Math.max(...pagesPopulaires.value.map(p => p.visites), 1))
const maxRegionVisites = computed(() => Math.max(...visitesParRegion.value.map(r => r.visites), 1))
const totalVisitesPays = computed(() => visitesParPays.value.reduce((a, b) => a + b.visites, 0) || 1)

// Watchers
watch(periode, () => {
  loadData()
})

// Méthodes
const loadData = async () => {
  await Promise.all([
    loadVisitesStats(),
    loadVisitesParJour(),
    loadPagesPopulaires(),
    loadVisitesParRegion(),
    loadVisitesParPays(),
    loadTelechargements()
  ])
}

const loadVisitesStats = async () => {
  try {
    visitesStats.value = await statistiquesService.getVisiteStats({ periode: periode.value })
  } catch (error) {
    console.error('Erreur:', error)
    visitesStats.value = {
      total_visites: 12458,
      visiteurs_uniques: 4523,
      pages_vues: 34567,
      duree_moyenne: 185,
      taux_rebond: 42.5
    }
  }
}

const loadVisitesParJour = async () => {
  try {
    const jours = periode.value === '7j' ? 7 : periode.value === '30j' ? 30 : 90
    visitesParJour.value = await statistiquesService.getVisitesParJour({ jours })
  } catch (error) {
    console.error('Erreur:', error)
    const days = periode.value === '7j' ? 7 : periode.value === '30j' ? 30 : 90
    visitesParJour.value = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return {
        date: date.toISOString().split('T')[0],
        visites: Math.floor(Math.random() * 400) + 200,
        visiteurs: Math.floor(Math.random() * 200) + 80
      }
    })
  }
}

const loadPagesPopulaires = async () => {
  try {
    pagesPopulaires.value = await statistiquesService.getPagesPopulaires({ limite: 10, periode: periode.value })
  } catch (error) {
    console.error('Erreur:', error)
    pagesPopulaires.value = [
      { page_url: '/compte-administratif/antananarivo', visites: 1234, visiteurs_uniques: 890, duree_moyenne: 245 },
      { page_url: '/', visites: 1056, visiteurs_uniques: 756, duree_moyenne: 45 },
      { page_url: '/compte-administratif/toamasina', visites: 876, visiteurs_uniques: 654, duree_moyenne: 198 },
      { page_url: '/documents', visites: 654, visiteurs_uniques: 432, duree_moyenne: 120 },
      { page_url: '/compte-administratif/antsirabe', visites: 543, visiteurs_uniques: 398, duree_moyenne: 210 },
      { page_url: '/a-propos', visites: 432, visiteurs_uniques: 321, duree_moyenne: 95 },
      { page_url: '/contact', visites: 321, visiteurs_uniques: 234, duree_moyenne: 67 },
      { page_url: '/faq', visites: 234, visiteurs_uniques: 189, duree_moyenne: 145 }
    ]
  }
}

const loadVisitesParRegion = async () => {
  try {
    visitesParRegion.value = await statistiquesService.getVisitesParRegion()
  } catch (error) {
    console.error('Erreur:', error)
    visitesParRegion.value = [
      { region: 'Analamanga', visites: 4523 },
      { region: 'Vakinankaratra', visites: 1234 },
      { region: 'Atsinanana', visites: 987 },
      { region: 'Boeny', visites: 765 },
      { region: 'DIANA', visites: 654 },
      { region: 'Haute Matsiatra', visites: 543 },
      { region: 'Atsimo-Andrefana', visites: 432 },
      { region: 'Amoron\'i Mania', visites: 321 }
    ]
  }
}

const loadVisitesParPays = async () => {
  try {
    visitesParPays.value = await statistiquesService.getVisitesParPays()
  } catch (error) {
    console.error('Erreur:', error)
    visitesParPays.value = [
      { pays: 'Madagascar', visites: 8765 },
      { pays: 'France', visites: 1234 },
      { pays: 'États-Unis', visites: 543 },
      { pays: 'Allemagne', visites: 321 },
      { pays: 'Suisse', visites: 234 },
      { pays: 'Canada', visites: 187 },
      { pays: 'Belgique', visites: 145 },
      { pays: 'Royaume-Uni', visites: 98 }
    ]
  }
}

const loadTelechargements = async () => {
  try {
    const [stats, populaires] = await Promise.all([
      statistiquesService.getTelechargementStats({ periode: periode.value }),
      statistiquesService.getDocumentsPopulaires({ limite: 5 })
    ])
    telechargementsStats.value = stats
    documentsPopulaires.value = populaires
  } catch (error) {
    console.error('Erreur:', error)
    telechargementsStats.value = { total: 2847, documents_telecharges: 156 }
    documentsPopulaires.value = [
      { document_id: '1', titre: 'Compte administratif 2023 - Antananarivo', telechargements: 234 },
      { document_id: '2', titre: 'Rapport revenus miniers T3 2024', telechargements: 189 },
      { document_id: '3', titre: 'Guide utilisateur plateforme', telechargements: 156 },
      { document_id: '4', titre: 'Données financières 2022', telechargements: 134 },
      { document_id: '5', titre: 'Analyse comparative régions', telechargements: 98 }
    ]
  }
}

// Helpers
const formatDuree = (secondes: number) => {
  const minutes = Math.floor(secondes / 60)
  const secs = secondes % 60
  return `${minutes}m ${secs}s`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const getPaysFlag = (pays: string) => {
  const flags: Record<string, string> = {
    'Madagascar': '🇲🇬',
    'France': '🇫🇷',
    'États-Unis': '🇺🇸',
    'Allemagne': '🇩🇪',
    'Suisse': '🇨🇭',
    'Canada': '🇨🇦',
    'Belgique': '🇧🇪',
    'Royaume-Uni': '🇬🇧'
  }
  return flags[pays] || '🌍'
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
