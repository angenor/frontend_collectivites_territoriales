<script setup lang="ts">
import type { DashboardStats } from '~/types'
import type { RegionWithStats, CommuneWithStats } from '~/types/collectivites'
import type { CompteAdministratifWithStats } from '~/types/comptes-administratifs'

// Métadonnées de la page
useHead({
  title: 'Plateforme de Suivi des Revenus Miniers - Accueil',
  meta: [
    {
      name: 'description',
      content: 'Plateforme de suivi de l\'utilisation des revenus miniers des collectivités territoriales à Madagascar'
    }
  ]
})

const geoService = useGeoService()
const config = useRuntimeConfig()
const router = useRouter()

// États
const showScrollTop = ref(false)
const isLoadingStats = ref(true)
const isLoadingRegions = ref(true)
const dashboardStats = ref<DashboardStats | null>(null)
const regions = ref<RegionWithStats[]>([])
const hoveredRegion = ref<RegionWithStats | null>(null)

// Compte administratif sélectionné (affiché dans le notebook)
const selectedCompte = ref<CompteAdministratifWithStats | null>(null)
const selectedLocation = ref<{ label: string } | null>(null)

// Modal communes (clic sur région)
const showCommunesModal = ref(false)
const selectedRegion = ref<RegionWithStats | null>(null)

// Modal comptes (quand plusieurs comptes pour une commune)
const showComptesModal = ref(false)
const modalComptes = ref<CompteAdministratifWithStats[]>([])
const modalLocation = ref<{ label: string; latitude: number; longitude: number } | null>(null)

// Années d'exercice disponibles (chargées depuis l'API publique)
const availableYears = ref<number[]>([])

// Charger les statistiques depuis l'endpoint public
const loadStats = async () => {
  isLoadingStats.value = true
  try {
    const apiBaseUrl = config.public.apiBaseUrl
    const globalStats = await $fetch<{
      geographie: { provinces: number; regions: number; communes: number }
      exercices: { total: number; publies: number }
      finances: { total_recettes: number; total_depenses: number; solde: number }
      revenus_miniers: { total: number; nb_projets: number }
      documents: { publics: number }
    }>(`${apiBaseUrl}/api/v1/statistiques/global`)

    dashboardStats.value = {
      communes_avec_donnees: globalStats.exercices?.publies || 0,
      communes_total: globalStats.geographie?.communes || 0,
      total_recettes: globalStats.finances?.total_recettes || 0,
      total_depenses: globalStats.finances?.total_depenses || 0,
      projets_miniers_actifs: globalStats.revenus_miniers?.nb_projets || 0,
      evolution_recettes: 0,
      evolution_depenses: 0,
      evolution_projets: 0,
      total_collectivites: globalStats.geographie?.communes || 0,
      total_projets_miniers: globalStats.revenus_miniers?.nb_projets || 0,
      total_comptes_administratifs: globalStats.exercices?.total || 0,
    }
  } catch (err: any) {
    console.error('Erreur lors du chargement des statistiques:', err)
  } finally {
    isLoadingStats.value = false
  }
}

// Charger les régions pour la carte (endpoint public)
const loadRegions = async () => {
  isLoadingRegions.value = true
  try {
    regions.value = await geoService.getRegions()
  } catch (err: any) {
    console.error('Erreur lors du chargement des régions:', err)
  } finally {
    isLoadingRegions.value = false
  }
}

// Charger les années d'exercice disponibles (endpoint public)
const loadExerciceYears = async () => {
  try {
    const apiBaseUrl = config.public.apiBaseUrl
    availableYears.value = await $fetch<number[]>(`${apiBaseUrl}/api/v1/exercices/years`)
  } catch (err: any) {
    console.error('Erreur lors du chargement des exercices:', err)
    const currentYear = new Date().getFullYear()
    availableYears.value = Array.from({ length: 5 }, (_, i) => currentYear - i)
  }
}

// Clic sur une région → ouvrir le popup des communes
const handleRegionClick = (region: RegionWithStats | null) => {
  if (!region) return
  selectedRegion.value = region
  showCommunesModal.value = true
}

const handleRegionHover = (region: RegionWithStats | null) => {
  hoveredRegion.value = region
}

// Sélection d'une commune → naviguer vers le compte administratif
const handleCommuneSelect = (commune: CommuneWithStats) => {
  showCommunesModal.value = false

  // Naviguer directement vers la page du compte administratif
  // avec l'année la plus récente disponible
  const annee = availableYears.value[0] || new Date().getFullYear()
  router.push(`/compte-administratif?commune=${commune.id}&annee=${annee}`)
}

// Sélectionner un compte pour affichage dans le notebook
const selectCompte = (compte: CompteAdministratifWithStats, locationLabel?: string) => {
  selectedCompte.value = compte
  selectedLocation.value = locationLabel ? { label: locationLabel } : null
  showComptesModal.value = false
}

// Désélectionner le compte
const clearSelectedCompte = () => {
  selectedCompte.value = null
  selectedLocation.value = null
}

// Navigation vers un compte
const navigateToCompte = (compte: CompteAdministratifWithStats) => {
  showComptesModal.value = false
  const communeId = compte.commune?.id || compte.commune_id
  if (communeId && compte.annee) {
    router.push(`/compte-administratif?commune=${communeId}&annee=${compte.annee}`)
  }
}

// Gestion du scroll to top
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Lifecycle — chargement en parallèle depuis les endpoints publics
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadStats()
  loadRegions()
  loadExerciceYears()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section avec recherche intégrée -->
    <HeroSection />

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <!-- Section Carte Interactive avec Statistiques -->
      <HomeMapSection
        :regions="regions"
        :is-loading-regions="isLoadingRegions"
        :is-loading-stats="isLoadingStats"
        :dashboard-stats="dashboardStats"
        :selected-compte="selectedCompte"
        :selected-location="selectedLocation"
        @region-click="handleRegionClick"
        @region-hover="handleRegionHover"
        @navigate-to-compte="navigateToCompte"
        @clear-selected-compte="clearSelectedCompte"
      />

      <!-- Section informations complémentaires -->
      <HomeInfoCards />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Modal de sélection de commune (clic sur région) -->
    <HomeCommunesModal
      v-model:show="showCommunesModal"
      :region="selectedRegion"
      @select-commune="handleCommuneSelect"
    />

    <!-- Modal de sélection de compte (quand plusieurs comptes pour une commune) -->
    <HomeComptesModal
      v-model:show="showComptesModal"
      :comptes="modalComptes"
      :location="modalLocation"
      @select-compte="selectCompte"
    />

    <!-- Bouton scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition print:hidden z-50"
        aria-label="Retour en haut"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media print {
  .print\:hidden {
    display: none !important;
  }

  body {
    background: white;
  }

  main {
    max-width: 100%;
    padding: 0;
  }
}
</style>
