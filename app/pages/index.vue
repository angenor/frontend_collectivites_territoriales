<script setup lang="ts">
import type { DashboardStats } from '~/types'
import type { RegionWithStats } from '~/types/collectivites'
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

const statistiquesService = useStatistiquesService()
const geoService = useGeoService()
const comptesService = useComptesAdministratifsService()
const router = useRouter()

// États
const showScrollTop = ref(false)
const isLoadingStats = ref(true)
const isLoadingRegions = ref(true)
const isLoadingComptes = ref(true)
const dashboardStats = ref<DashboardStats | null>(null)
const regions = ref<RegionWithStats[]>([])
const comptes = ref<CompteAdministratifWithStats[]>([])
const selectedRegion = ref<RegionWithStats | null>(null)
const hoveredRegion = ref<RegionWithStats | null>(null)

// Compte administratif sélectionné (affiché dans le notebook)
const selectedCompte = ref<CompteAdministratifWithStats | null>(null)
const selectedLocation = ref<{ label: string } | null>(null)

// Modal pour sélection de compte (quand plusieurs comptes à un emplacement)
const showComptesModal = ref(false)
const modalComptes = ref<CompteAdministratifWithStats[]>([])
const modalLocation = ref<{ label: string; latitude: number; longitude: number } | null>(null)

// Charger les statistiques
const loadStats = async () => {
  isLoadingStats.value = true
  try {
    dashboardStats.value = await statistiquesService.getDashboardStats()
  } catch (err: any) {
    console.error('Erreur lors du chargement des statistiques:', err)
  } finally {
    isLoadingStats.value = false
  }
}

// Charger les régions pour la carte
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

// Charger les comptes administratifs publiés
const loadComptes = async () => {
  isLoadingComptes.value = true
  try {
    const response = await comptesService.getComptes({
      statut: 'publie',
      limit: 100,
    })
    comptes.value = response.items
  } catch (err: any) {
    console.error('Erreur lors du chargement des comptes:', err)
  } finally {
    isLoadingComptes.value = false
  }
}

// Handlers pour la carte
const handleRegionClick = (region: RegionWithStats | null) => {
  selectedRegion.value = region
}

const handleRegionHover = (region: RegionWithStats | null) => {
  hoveredRegion.value = region
}

// Handler pour clic sur marqueur
const handleMarkerClick = (
  comptesClicked: CompteAdministratifWithStats[],
  location: { label: string; latitude: number; longitude: number }
) => {
  if (comptesClicked.length === 1) {
    selectCompte(comptesClicked[0], location.label)
  } else {
    modalComptes.value = comptesClicked
    modalLocation.value = location
    showComptesModal.value = true
  }
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
  } else {
    router.push(`/admin/comptes-administratifs/${compte.id}`)
  }
}

// Gestion du scroll to top
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadStats()
  loadRegions()
  loadComptes()
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
        :comptes="comptes"
        :is-loading-regions="isLoadingRegions"
        :is-loading-comptes="isLoadingComptes"
        :is-loading-stats="isLoadingStats"
        :dashboard-stats="dashboardStats"
        :selected-compte="selectedCompte"
        :selected-location="selectedLocation"
        @region-click="handleRegionClick"
        @region-hover="handleRegionHover"
        @marker-click="handleMarkerClick"
        @navigate-to-compte="navigateToCompte"
        @clear-selected-compte="clearSelectedCompte"
      />

      <!-- Section informations complémentaires -->
      <HomeInfoCards />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Modal de sélection de compte administratif -->
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
