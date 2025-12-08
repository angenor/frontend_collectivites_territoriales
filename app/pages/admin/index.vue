<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Tableau de Bord
      </h1>
      <p class="mt-2 text-[var(--text-secondary)]">
        Vue d'ensemble de la plateforme de suivi des revenus miniers.
      </p>
    </div>

    <!-- KPI Cards -->
    <div v-if="statsError" class="mb-8 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl p-4">
      <div class="flex items-center gap-3 text-[var(--color-error)]">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
        <span>{{ statsError }}</span>
        <button @click="loadDashboardStats" class="ml-auto px-3 py-1 bg-[var(--color-error)] text-white rounded-lg text-sm hover:bg-[var(--color-error)]/80">
          Réessayer
        </button>
      </div>
    </div>
    <AdminDashboardKpiCards
      v-else
      :stats="dashboardStats"
      :loading="statsLoading"
      class="mb-8"
    />

    <!-- Charts and Activity section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Revenue Chart -->
      <div class="lg:col-span-2">
        <div v-if="revenueError" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm h-full">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            Évolution des Revenus
          </h2>
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-4xl text-[var(--color-error)] mb-3" />
              <p class="text-[var(--text-secondary)] mb-3">{{ revenueError }}</p>
              <button @click="loadRevenueData(selectedRevenuePeriod)" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary)]/80">
                Réessayer
              </button>
            </div>
          </div>
        </div>
        <AdminDashboardRevenueChart
          v-else
          :data="revenueData"
          :loading="revenueLoading"
          @period-change="handlePeriodChange"
        />
      </div>

      <!-- Quick Actions -->
      <AdminDashboardQuickActions />
    </div>

    <!-- Recent Activity -->
    <div v-if="activitiesError" class="mb-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
      <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
        Activité Récente
      </h2>
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-3xl text-[var(--color-error)] mb-3" />
          <p class="text-[var(--text-secondary)] mb-3">{{ activitiesError }}</p>
          <button @click="loadRecentActivities" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary)]/80">
            Réessayer
          </button>
        </div>
      </div>
    </div>
    <AdminDashboardRecentActivity
      v-else
      :activities="recentActivities"
      :loading="activitiesLoading"
      class="mb-8"
    />

    <!-- Welcome message for new users -->
    <div class="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-700)] rounded-xl p-6 text-white">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <font-awesome-icon :icon="['fas', 'rocket']" class="text-3xl" />
        </div>
        <div>
          <h3 class="font-heading text-xl font-bold uppercase tracking-wide mb-1">
            Bienvenue, {{ user?.prenom || user?.nom || 'Administrateur' }} !
          </h3>
          <p class="text-white/80">
            Explorez le tableau de bord pour suivre les revenus miniers des collectivités territoriales de Madagascar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, ActivityLog } from '~/types'
import { useStatistiquesService } from '../../services'

definePageMeta({
  layout: 'admin',
})

const { user } = useAuth()
const statistiquesService = useStatistiquesService()

// ============================================================================
// DASHBOARD STATS
// ============================================================================

const dashboardStats = ref<DashboardStats | null>(null)
const statsLoading = ref(true)
const statsError = ref<string | null>(null)

const loadDashboardStats = async () => {
  statsLoading.value = true
  statsError.value = null
  try {
    dashboardStats.value = await statistiquesService.getDashboardStats()
  } catch (error: any) {
    console.error('Erreur lors du chargement des statistiques:', error)
    statsError.value = error?.message || 'Impossible de charger les statistiques'
    dashboardStats.value = null
  } finally {
    statsLoading.value = false
  }
}

// ============================================================================
// REVENUE CHART DATA
// ============================================================================

interface ChartData {
  period: string
  recettes: number
  depenses: number
  revenus_miniers?: number
}

const revenueData = ref<ChartData[]>([])
const revenueLoading = ref(true)
const revenueError = ref<string | null>(null)
const selectedRevenuePeriod = ref('12m')

const loadRevenueData = async (period: string = '12m') => {
  revenueLoading.value = true
  revenueError.value = null
  try {
    // Déterminer le nombre d'années à récupérer
    const annees = period === '6m' ? 1 : period === '12m' ? 1 : 3

    const data = await statistiquesService.getRevenusParAnnee({ annees })

    // Transformer les données pour le graphique
    revenueData.value = data.map((item: { annee: number; total: number; evolution: number }) => ({
      period: String(item.annee),
      recettes: item.total,
      depenses: Math.round(item.total * 0.85), // Estimation des dépenses
      revenus_miniers: Math.round(item.total * 0.15), // Estimation revenus miniers
    }))
  } catch (error: any) {
    console.error('Erreur lors du chargement des revenus:', error)
    revenueError.value = error?.message || 'Impossible de charger les revenus'
    revenueData.value = []
  } finally {
    revenueLoading.value = false
  }
}

const handlePeriodChange = (period: string) => {
  selectedRevenuePeriod.value = period
  loadRevenueData(period)
}


// ============================================================================
// RECENT ACTIVITIES
// ============================================================================

const recentActivities = ref<ActivityLog[]>([])
const activitiesLoading = ref(true)
const activitiesError = ref<string | null>(null)

const loadRecentActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = null
  try {
    recentActivities.value = await statistiquesService.getActiviteRecente({ limite: 5 })
  } catch (error: any) {
    console.error('Erreur lors du chargement des activités:', error)
    activitiesError.value = error?.message || 'Impossible de charger les activités récentes'
    recentActivities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadDashboardStats()
  loadRevenueData(selectedRevenuePeriod.value)
  loadRecentActivities()
})
</script>
