<script setup lang="ts">
import type { DashboardStats } from '~/types'
import type { RegionWithStats } from '~/types/collectivites'
import type { CompteAdministratifWithStats } from '~/types/comptes-administratifs'

defineProps<{
  regions: RegionWithStats[]
  isLoadingRegions: boolean
  isLoadingStats: boolean
  dashboardStats: DashboardStats | null
  selectedCompte: CompteAdministratifWithStats | null
  selectedLocation: { label: string } | null
}>()

const emit = defineEmits<{
  'region-click': [region: RegionWithStats | null]
  'region-hover': [region: RegionWithStats | null]
  'navigate-to-compte': [compte: CompteAdministratifWithStats]
  'clear-selected-compte': []
}>()
</script>

<template>
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
            :is-loading="isLoadingRegions"
            @region-click="(r) => emit('region-click', r)"
            @region-hover="(r) => emit('region-hover', r)"
            class="h-full w-full"
          />
          <template #fallback>
            <div class="h-full flex items-center justify-center">
              <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Panneau d'informations Notebook -->
      <HomeNotebookPanel
        :selected-compte="selectedCompte"
        :selected-location="selectedLocation"
        :dashboard-stats="dashboardStats"
        :is-loading-stats="isLoadingStats"
        :regions="regions"
        @navigate-to-compte="(c) => emit('navigate-to-compte', c)"
        @clear-selected-compte="emit('clear-selected-compte')"
      />
    </div>
  </section>
</template>

<style scoped>
.map-stats-grid {
  min-height: 600px;
}

.map-container {
  min-height: 500px;
  height: 600px;
}

@media (min-width: 1024px) {
  .map-container {
    height: 650px;
  }
}

@media (max-width: 1023px) {
  .map-container {
    height: 500px;
    min-height: 400px;
  }
}
</style>
