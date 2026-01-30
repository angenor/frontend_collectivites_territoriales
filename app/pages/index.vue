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
    // Si un seul compte, afficher dans le notebook
    selectCompte(comptesClicked[0], location.label)
  } else {
    // Si plusieurs comptes, afficher la modal de sélection
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
  // La page compte-administratif attend les paramètres commune et annee
  const communeId = compte.commune?.id || compte.commune_id
  if (communeId && compte.annee) {
    router.push(`/compte-administratif?commune=${communeId}&annee=${compte.annee}`)
  } else {
    // Fallback vers la page admin si pas de commune (cas région/district)
    router.push(`/admin/comptes-administratifs/${compte.id}`)
  }
}

// Formatage des montants
const formatMontant = (value: number | undefined): string => {
  if (!value) return '0'
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + ' Mrd'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + ' M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + ' K'
  }
  return value.toLocaleString('fr-FR')
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
      <section class="py-8">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
          <font-awesome-icon :icon="['fas', 'map']" class="text-blue-600 dark:text-blue-400" />
          <span>Carte des Régions de Madagascar</span>
        </h2>

        <!-- Grid côte à côte : Carte + Statistiques Notebook -->
        <div class="grid lg:grid-cols-3 gap-6 items-stretch map-stats-grid">
          <!-- Carte (2/3 de largeur sur desktop) -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden map-container">
            <ClientOnly>
              <MadagascarMap
                :regions="regions"
                :comptes="comptes"
                :is-loading="isLoadingRegions || isLoadingComptes"
                @region-click="handleRegionClick"
                @region-hover="handleRegionHover"
                @marker-click="handleMarkerClick"
                class="h-full w-full"
              />
              <template #fallback>
                <div class="h-full flex items-center justify-center">
                  <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- Panneau d'informations Notebook (1/3 de largeur sur desktop) -->
          <div class="info-card">
            <div class="info-card-inner p-5 h-full overflow-y-auto">
              <!-- Header -->
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', selectedCompte ? 'file-invoice-dollar' : 'chart-bar']" class="text-blue-600 dark:text-blue-400" />
                <span>{{ selectedCompte ? 'Compte Administratif' : 'Statistiques' }}</span>
              </h3>

              <!-- Contenu dynamique -->
              <Transition name="fade" mode="out-in">
                <!-- Compte administratif sélectionné -->
                <div v-if="selectedCompte" key="compte" class="space-y-4">
                  <!-- En-tête avec localisation -->
                  <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                    <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      {{ selectedLocation?.label || 'Localisation' }}
                    </p>
                    <p class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ selectedCompte.collectivite_nom || selectedCompte.commune?.nom || selectedCompte.region?.nom || 'Collectivité' }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Exercice {{ selectedCompte.annee }}
                    </p>
                  </div>

                  <!-- Statut -->
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Statut :</span>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': selectedCompte.statut === 'publie',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': selectedCompte.statut === 'valide',
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': selectedCompte.statut === 'brouillon',
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300': selectedCompte.statut === 'archive',
                      }"
                    >
                      {{ selectedCompte.statut }}
                    </span>
                  </div>

                  <!-- Informations géographiques -->
                  <div class="space-y-2">
                    <div v-if="selectedCompte.region" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <font-awesome-icon :icon="['fas', 'map']" class="w-4 text-blue-600 dark:text-blue-400" />
                      <span>Région : {{ selectedCompte.region.nom }}</span>
                    </div>
                    <div v-if="selectedCompte.commune" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <font-awesome-icon :icon="['fas', 'city']" class="w-4 text-green-600 dark:text-green-400" />
                      <span>Commune : {{ selectedCompte.commune.nom }}</span>
                    </div>
                  </div>

                  <!-- Dates -->
                  <div v-if="selectedCompte.date_publication || selectedCompte.date_validation" class="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
                    <p v-if="selectedCompte.date_publication" class="text-xs text-gray-500 dark:text-gray-400">
                      Publié le : {{ new Date(selectedCompte.date_publication).toLocaleDateString('fr-FR') }}
                    </p>
                    <p v-if="selectedCompte.date_validation" class="text-xs text-gray-500 dark:text-gray-400">
                      Validé le : {{ new Date(selectedCompte.date_validation).toLocaleDateString('fr-FR') }}
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                    <button
                      @click="navigateToCompte(selectedCompte)"
                      class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" />
                      Voir les détails
                    </button>
                    <button
                      @click="clearSelectedCompte"
                      class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition text-sm border border-gray-300 dark:border-gray-600"
                    >
                      <font-awesome-icon :icon="['fas', 'times']" class="mr-1" />
                      Fermer
                    </button>
                  </div>
                </div>

                <!-- État par défaut : Statistiques de la plateforme -->
                <div v-else key="stats" class="space-y-4">
                  <!-- Communes avec données -->
                  <div class="stat-item p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Communes avec données</p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                          <template v-if="isLoadingStats">
                            <span class="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                          </template>
                          <template v-else>
                            {{ dashboardStats?.communes_avec_donnees || 0 }}
                            <span class="text-xs font-normal text-gray-500 dark:text-gray-400">/ {{ dashboardStats?.communes_total || 0 }}</span>
                          </template>
                        </p>
                      </div>
                      <div class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                        <font-awesome-icon :icon="['fas', 'city']" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div v-if="!isLoadingStats && dashboardStats?.communes_total" class="mt-2">
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          class="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          :style="{ width: `${(dashboardStats.communes_avec_donnees / dashboardStats.communes_total) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Total Recettes -->
                  <div class="stat-item p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Total Recettes</p>
                        <p class="text-xl font-bold text-green-600 dark:text-green-400">
                          <template v-if="isLoadingStats">
                            <span class="inline-block w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                          </template>
                          <template v-else>
                            {{ formatMontant(dashboardStats?.total_recettes) }}
                            <span class="text-xs font-normal text-gray-500 dark:text-gray-400">Ar</span>
                          </template>
                        </p>
                      </div>
                      <div class="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                        <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <!-- Total Dépenses -->
                  <div class="stat-item p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Total Dépenses</p>
                        <p class="text-xl font-bold text-orange-600 dark:text-orange-400">
                          <template v-if="isLoadingStats">
                            <span class="inline-block w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                          </template>
                          <template v-else>
                            {{ formatMontant(dashboardStats?.total_depenses) }}
                            <span class="text-xs font-normal text-gray-500 dark:text-gray-400">Ar</span>
                          </template>
                        </p>
                      </div>
                      <div class="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full">
                        <font-awesome-icon :icon="['fas', 'arrow-trend-down']" class="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>

                  <!-- Comptes administratifs -->
                  <div class="stat-item p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Comptes Administratifs</p>
                        <p class="text-xl font-bold text-purple-600 dark:text-purple-400">
                          <template v-if="isLoadingStats">
                            <span class="inline-block w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                          </template>
                          <template v-else>
                            {{ dashboardStats?.total_comptes_administratifs || 0 }}
                          </template>
                        </p>
                      </div>
                      <div class="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                        <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <!-- Résumé régions/communes -->
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div class="grid grid-cols-2 gap-2">
                      <div class="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ regions.length }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Régions</p>
                      </div>
                      <div class="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p class="text-xl font-bold text-green-600 dark:text-green-400">
                          {{ regions.reduce((sum, r) => sum + (r.nb_communes || 0), 0) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Communes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </section>

      <!-- Section informations complémentaires -->
      <section class="grid md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Transparence</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Accédez librement aux informations financières des collectivités bénéficiaires des revenus miniers.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Redevabilité</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Suivez l'utilisation des fonds publics et l'exécution budgétaire en temps réel.
          </p>
        </div>

        <!-- Card 3 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Accessibilité</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Données ouvertes, téléchargeables et facilement exploitables pour tous les citoyens.
          </p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 dark:bg-gray-950 text-white mt-16 print:hidden transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-3">À propos</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Projet "Minerais critiques : justice fiscale et redistribution de revenus"
              mené par PCQVP Madagascar et TI Madagascar.
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Contact</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Email: vramaherison@transparency.mg<br>
              Transparency International - Initiative Madagascar
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Ressources</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Plateforme de suivi des revenus miniers<br>
              Collectivités Territoriales de Madagascar
            </p>
          </div>
        </div>
        <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.</p>
          <p class="mt-3 text-gray-500 dark:text-gray-600">
            Plateforme développée par
            <a
              href="https://www.linkedin.com/company/herhero-forchange/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-400 hover:text-blue-300 dark:text-blue-500 dark:hover:text-blue-400 transition font-medium"
            >
              HerHero
            </a>
          </p>
        </div>
      </div>
    </footer>

    <!-- Modal de sélection de compte administratif -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showComptesModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="showComptesModal = false"
          ></div>

          <!-- Modal content -->
          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="text-blue-600 dark:text-blue-400" />
                  Comptes Administratifs
                </h3>
                <p v-if="modalLocation" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ modalLocation.label }}
                </p>
              </div>
              <button
                @click="showComptesModal = false"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
              </button>
            </div>

            <!-- Liste des comptes -->
            <div class="p-4 overflow-y-auto max-h-[60vh]">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sélectionnez un compte administratif pour voir les détails :
              </p>

              <div class="space-y-2">
                <button
                  v-for="compte in modalComptes"
                  :key="compte.id"
                  @click="selectCompte(compte, modalLocation?.label)"
                  class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition group"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="text-left">
                      <p class="font-semibold text-gray-900 dark:text-white">
                        {{ compte.collectivite_nom || compte.commune?.nom || compte.region?.nom || 'Collectivité' }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Exercice {{ compte.annee }}
                        <span v-if="compte.statut" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          :class="{
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': compte.statut === 'publie',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': compte.statut === 'valide',
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': compte.statut === 'brouillon',
                          }">
                          {{ compte.statut }}
                        </span>
                      </p>
                    </div>
                  </div>
                  <font-awesome-icon
                    :icon="['fas', 'chevron-right']"
                    class="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                  />
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                @click="showComptesModal = false"
                class="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
/* Import Google Font for handwriting style */
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap');

/* Notebook Card Style */
.info-card {
  position: relative;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.25));
  transition: 0.3s all;
  min-height: 500px;
}

.info-card:hover {
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.35));
}

.info-card-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  padding-left: 45px; /* Plus de padding pour éviter la ligne rouge */
  padding-right: 15px;
  /* Lined paper effect with red margin line */
  background:
    repeating-linear-gradient(
      #0000 0 calc(1.6rem - 1px),
      #c5dbe8 0 1.6rem
    ) right bottom / 100% 100%,
    linear-gradient(#ef4444 0 0) 35px 0 / 2px 100% #fffef5;
  background-repeat: no-repeat;
  line-height: 1.6rem;
  /* Punched holes effect */
  -webkit-mask: radial-gradient(circle 0.5rem at 17px 50%, #0000 98%, #000) 0 0 / 100% 3.2rem;
  mask: radial-gradient(circle 0.5rem at 17px 50%, #0000 98%, #000) 0 0 / 100% 3.2rem;
  /* Handwriting font - plus grand et plus visible */
  font-family: 'Caveat', cursive;
  font-size: 1.25rem;
  color: #1e3a5f;
  font-weight: 500;
}

/* Sticky tape effect */
.info-card::before,
.info-card::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 45px;
  background: #e6e6e6b8;
  z-index: 10;
}

.info-card::before {
  left: 60%;
  top: -12px;
  transform: rotate(45deg);
}

.info-card::after {
  left: 40%;
  bottom: -12px;
  transform: rotate(-45deg);
}

/* Dark mode support */
.dark .info-card-inner {
  background-color: #1e293b;
  background:
    repeating-linear-gradient(
      #0000 0 calc(1.6rem - 1px),
      #374151 0 1.6rem
    ) right bottom / 100% 100%,
    linear-gradient(#ef4444 0 0) 35px 0 / 2px 100% #1e293b;
  background-repeat: no-repeat;
  color: #f1f5f9;
  font-weight: 500;
}

.dark .info-card::before,
.dark .info-card::after {
  background: #475569b8;
}

/* Notebook content styles - headers */
.info-card-inner h3 {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1e3a8a;
  text-decoration: underline;
  text-decoration-color: #2563eb;
  text-underline-offset: 4px;
  margin-bottom: 1rem;
}

.dark .info-card-inner h3 {
  color: #bfdbfe;
  text-decoration-color: #60a5fa;
}

/* Notebook stat items - handwritten style */
.stat-item {
  background: transparent !important;
  border: none !important;
  border-bottom: 2px dashed #64748b !important;
  border-radius: 0 !important;
  padding: 0.75rem 0.75rem !important; /* Plus de padding horizontal */
  margin-left: 0;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(254, 243, 199, 0.4) !important;
  transform: none;
}

.dark .stat-item {
  border-bottom-color: #4b5563 !important;
}

.dark .stat-item:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

/* Stat labels - more visible */
.stat-item p.text-xs {
  font-size: 1.1rem !important;
  color: #374151 !important;
  font-weight: 500;
}

.dark .stat-item p.text-xs {
  color: #d1d5db !important;
}

/* Stat values - larger bold handwriting */
.stat-item .text-xl {
  font-size: 1.8rem !important;
  font-weight: 700;
  color: #1e3a8a !important;
}

.dark .stat-item .text-xl {
  color: #93c5fd !important;
}

/* Keep colored text for specific stats */
.stat-item .text-green-600 {
  color: #166534 !important;
}
.stat-item .text-orange-600 {
  color: #c2410c !important;
}
.stat-item .text-purple-600 {
  color: #7c3aed !important;
}

.dark .stat-item .text-green-600,
.dark .stat-item .dark\\:text-green-400 {
  color: #86efac !important;
}
.dark .stat-item .text-orange-600,
.dark .stat-item .dark\\:text-orange-400 {
  color: #fdba74 !important;
}
.dark .stat-item .text-purple-600,
.dark .stat-item .dark\\:text-purple-400 {
  color: #c4b5fd !important;
}

/* Info boxes in notebook style */
.info-card-inner :deep(.bg-blue-100),
.info-card-inner :deep(.bg-purple-100),
.info-card-inner :deep(.bg-gray-50) {
  background: rgba(254, 249, 195, 0.6) !important;
  border: 2px dashed #b45309 !important;
  border-radius: 0.25rem;
}

.dark .info-card-inner :deep(.bg-blue-100),
.dark .info-card-inner :deep(.bg-purple-100),
.dark .info-card-inner :deep(.bg-gray-50) {
  background: rgba(30, 58, 138, 0.3) !important;
  border-color: #60a5fa !important;
}

/* Divider style */
.info-card-inner hr {
  width: calc(100% - 1.2rem);
  margin-left: auto;
  margin-right: 1.2rem;
  border: none;
  border-bottom: 2px dashed #64748b;
  margin-top: 0;
}

.dark .info-card-inner hr {
  border-bottom-color: #4b5563;
}

/* Buttons in notebook style */
.info-card-inner button {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  font-weight: 700;
  border: 2px solid !important;
  border-radius: 0.25rem !important;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.info-card-inner button:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

/* Primary button - style encre bleue */
.info-card-inner button.bg-blue-600 {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1e40af 100%) !important;
  border-color: #1e3a8a !important;
  color: #ffffff !important;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.info-card-inner button.bg-blue-600:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e3a8a 100%) !important;
}

/* Secondary button - style papier */
.info-card-inner button.bg-gray-100,
.info-card-inner button:not(.bg-blue-600) {
  background: #fffbeb !important;
  border-color: #92400e !important;
  color: #78350f !important;
}

.info-card-inner button.bg-gray-100:hover,
.info-card-inner button:not(.bg-blue-600):hover {
  background: #fef3c7 !important;
}

.dark .info-card-inner button.bg-gray-100,
.dark .info-card-inner button:not(.bg-blue-600) {
  background: #374151 !important;
  border-color: #60a5fa !important;
  color: #e5e7eb !important;
}

.dark .info-card-inner button.bg-gray-100:hover,
.dark .info-card-inner button:not(.bg-blue-600):hover {
  background: #4b5563 !important;
}

/* Progress bars with pencil/ink effect */
.info-card-inner .bg-blue-500 {
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
}

/* Grid summary (Régions/Communes) - more visible */
.info-card-inner .grid.grid-cols-2 > div {
  background: rgba(254, 249, 195, 0.5) !important;
  border: 1px solid #d97706 !important;
}

.info-card-inner .grid.grid-cols-2 .text-xl {
  font-size: 2rem !important;
  font-weight: 700;
}

.info-card-inner .grid.grid-cols-2 .text-xs {
  font-size: 1rem !important;
  color: #374151 !important;
}

.dark .info-card-inner .grid.grid-cols-2 > div {
  background: rgba(30, 58, 138, 0.25) !important;
  border-color: #3b82f6 !important;
}

.dark .info-card-inner .grid.grid-cols-2 .text-xs {
  color: #d1d5db !important;
}

/* Icons in notebook - keep them visible */
.info-card-inner svg,
.info-card-inner .fa-icon {
  opacity: 0.9;
}

/* =============================================
   Styles pour le compte administratif sélectionné
   ============================================= */

/* En-tête du compte - boîte localisation */
.info-card-inner > div > div:first-child .p-3 {
  padding: 1rem !important;
}

.info-card-inner .text-xs {
  font-size: 1.1rem !important;
  font-weight: 500;
}

/* Nom de la collectivité - plus grand */
.info-card-inner .text-xl.font-bold {
  font-size: 1.6rem !important;
  color: #1e3a8a !important;
}

.dark .info-card-inner .text-xl.font-bold {
  color: #bfdbfe !important;
}

/* Exercice et autres textes */
.info-card-inner .text-sm {
  font-size: 1.15rem !important;
  color: #374151 !important;
}

.dark .info-card-inner .text-sm {
  color: #d1d5db !important;
}

/* Statut badge */
.info-card-inner .rounded-full.text-xs {
  font-size: 1rem !important;
  padding: 0.35rem 0.75rem !important;
  font-weight: 600;
}

/* Informations géographiques */
.info-card-inner .space-y-2 > div {
  font-size: 1.2rem !important;
}

.info-card-inner .space-y-2 span {
  color: #1e3a5f !important;
}

.dark .info-card-inner .space-y-2 span {
  color: #e2e8f0 !important;
}

/* Dates de publication/validation */
.info-card-inner .pt-3.space-y-1 p {
  font-size: 1.05rem !important;
  color: #4b5563 !important;
}

.dark .info-card-inner .pt-3.space-y-1 p {
  color: #9ca3af !important;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: all 0.3s ease;
}

/* Print styles */
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

/* Map and stats grid */
.map-stats-grid {
  min-height: 600px;
}

.map-container {
  min-height: 500px;
  height: 600px;
}

/* Responsive adjustments */
@media (min-width: 1024px) {
  .map-container,
  .info-card {
    height: 650px;
  }
}

@media (max-width: 1023px) {
  .map-container {
    height: 500px;
    min-height: 400px;
  }

  .info-card {
    min-height: 400px;
    height: auto !important;
  }
}
</style>
