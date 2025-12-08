<script setup lang="ts">
import type { DashboardStats } from '~/types'
import type { RegionWithStats } from '~/types/collectivites'

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

// États
const showScrollTop = ref(false)
const isLoadingStats = ref(true)
const isLoadingRegions = ref(true)
const dashboardStats = ref<DashboardStats | null>(null)
const regions = ref<RegionWithStats[]>([])
const selectedRegion = ref<RegionWithStats | null>(null)
const hoveredRegion = ref<RegionWithStats | null>(null)

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

// Handlers pour la carte
const handleRegionClick = (region: RegionWithStats | null) => {
  selectedRegion.value = region
}

const handleRegionHover = (region: RegionWithStats | null) => {
  hoveredRegion.value = region
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
      <!-- Section Carte Interactive avec Statistiques intégrées -->
      <section class="py-8">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
          <font-awesome-icon :icon="['fas', 'map']" class="text-blue-600 dark:text-blue-400" />
          <span>Carte des Régions de Madagascar</span>
        </h2>

        <!-- Container avec positionnement relatif -->
        <div class="relative">
          <!-- Panneau d'informations flottant (style notebook) -->
          <div class="info-card absolute top-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] lg:max-w-sm">
            <div class="info-card-inner p-5">
              <!-- Header -->
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', hoveredRegion || selectedRegion ? 'map-marker-alt' : 'chart-bar']" class="text-blue-600 dark:text-blue-400" />
                <span>{{ hoveredRegion || selectedRegion ? 'Informations' : 'Statistiques de la plateforme' }}</span>
              </h3>

              <!-- Contenu dynamique -->
              <Transition name="fade" mode="out-in">
                <!-- État de survol -->
                <div v-if="hoveredRegion" key="hover" class="space-y-3">
                  <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                    <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Région survolée</p>
                    <p class="text-xl font-bold text-gray-900 dark:text-white">{{ hoveredRegion.nom }}</p>
                    <div class="mt-3 space-y-1">
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'building']" class="w-4 text-blue-600 dark:text-blue-400" />
                        Province: {{ hoveredRegion.province_nom || 'N/A' }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'city']" class="w-4 text-blue-600 dark:text-blue-400" />
                        Communes: {{ hoveredRegion.nb_communes || 0 }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- État sélectionné -->
                <div v-else-if="selectedRegion" key="selected" class="space-y-3">
                  <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700">
                    <p class="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Région sélectionnée</p>
                    <p class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedRegion.nom }}</p>
                    <div class="mt-3 space-y-1">
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'building']" class="w-4 text-purple-600 dark:text-purple-400" />
                        Province: {{ selectedRegion.province_nom || 'N/A' }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'city']" class="w-4 text-purple-600 dark:text-purple-400" />
                        Communes: {{ selectedRegion.nb_communes || 0 }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="selectedRegion = null"
                    class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition text-sm border border-gray-300 dark:border-gray-600"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="mr-1" />
                    Désélectionner
                  </button>
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

          <!-- Carte (fond) -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <ClientOnly>
              <MadagascarMap
                :regions="regions"
                :is-loading="isLoadingRegions"
                @region-click="handleRegionClick"
                @region-hover="handleRegionHover"
                class="h-[600px]"
              />
              <template #fallback>
                <div class="h-[600px] flex items-center justify-center">
                  <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </template>
            </ClientOnly>
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
        </div>
      </div>
    </footer>

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
/* Notebook Card Style */
.info-card {
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.25));
  transition: 0.3s all;
}

.info-card:hover {
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.35));
  transform: translateY(-2px);
}

.info-card-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: white;
  border-radius: 0.25rem;
  overflow: hidden;
  padding-left: 30px;
  /* Lined paper effect with red margin line */
  background:
    repeating-linear-gradient(
      #0000 0 calc(1.2rem - 1px),
      #66afe1 0 1.2rem
    ) right bottom / 100% 100%,
    linear-gradient(#ef4444 0 0) 30px 0 / 2px 100% #fff;
  background-repeat: no-repeat;
  line-height: 1.2rem;
  /* Punched holes effect */
  -webkit-mask: radial-gradient(circle 0.5rem at 15px 50%, #0000 98%, #000) 0 0 / 100% 2.4rem;
  mask: radial-gradient(circle 0.5rem at 15px 50%, #0000 98%, #000) 0 0 / 100% 2.4rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
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
      #0000 0 calc(1.2rem - 1px),
      #334155 0 1.2rem
    ) right bottom / 100% 100%,
    linear-gradient(#ef4444 0 0) 30px 0 / 2px 100% #1e293b;
  background-repeat: no-repeat;
}

.dark .info-card::before,
.dark .info-card::after {
  background: #475569b8;
}

/* Divider style */
.info-card-inner hr {
  width: calc(100% - 1.2rem);
  margin-left: auto;
  margin-right: 1.2rem;
  border: none;
  border-bottom: 1px dashed #cbd5e1;
  margin-top: 0;
}

.dark .info-card-inner hr {
  border-bottom-color: #475569;
}

/* Subtle hover effect on stat items */
.stat-item {
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.stat-item:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(2px);
}

.dark .stat-item:hover {
  background: rgba(59, 130, 246, 0.2);
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

/* Responsive adjustments for info card */
@media (max-width: 768px) {
  .info-card {
    position: relative !important;
    top: 0 !important;
    right: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    margin-bottom: 1rem;
  }
}
</style>
