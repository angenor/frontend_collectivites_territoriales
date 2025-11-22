<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Régions
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gérez les régions de Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle Région
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une région..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Tous</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
    </div>

    <!-- Regions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="region in filteredRegions"
        :key="region.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ region.nom }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Code: {{ region.code }}
            </p>
          </div>
          <span :class="[
            'px-2 py-1 text-xs font-semibold rounded-full',
            region.actif ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          ]">
            {{ region.actif ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="region.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {{ region.description }}
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Départements</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ region.nb_departements || 0 }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Communes</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ region.nb_communes || 0 }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-2">
          <button
            @click="viewRegion(region)"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
            title="Voir"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            @click="editRegion(region)"
            class="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
            title="Modifier"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="deleteRegion(region)"
            class="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
            title="Supprimer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredRegions.length === 0"
      class="text-center py-12"
    >
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">Aucune région trouvée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

// Mock data - À remplacer par des appels API
const regions = ref([
  { id: '1', code: 'ALM', nom: 'Alaotra-Mangoro', description: 'Région située dans la partie centre-est de Madagascar', actif: true, nb_departements: 5, nb_communes: 82 },
  { id: '2', code: 'AMO', nom: 'Amoron\'i Mania', description: 'Région du centre de Madagascar', actif: true, nb_departements: 4, nb_communes: 52 },
  { id: '3', code: 'ANO', nom: 'Anosy', description: 'Région du sud-est de Madagascar', actif: true, nb_departements: 4, nb_communes: 54 },
  { id: '4', code: 'ATS', nom: 'Atsinanana', description: 'Région de la côte est de Madagascar', actif: true, nb_departements: 7, nb_communes: 95 },
  { id: '5', code: 'BET', nom: 'Betsiboka', description: 'Région du nord-ouest de Madagascar', actif: true, nb_departements: 2, nb_communes: 22 },
  { id: '6', code: 'BON', nom: 'Boeny', description: 'Région du nord-ouest de Madagascar', actif: true, nb_departements: 6, nb_communes: 46 },
])

const searchQuery = ref('')
const statusFilter = ref('')

const filteredRegions = computed(() => {
  let result = regions.value

  // Filter by search
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(region =>
      region.nom.toLowerCase().includes(search) ||
      region.code.toLowerCase().includes(search)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'actif'
    result = result.filter(region => region.actif === isActive)
  }

  return result
})

// Methods
const openCreateModal = () => {
  console.log('Open create modal')
  // TODO: Implement modal
}

const viewRegion = (region: any) => {
  console.log('View region:', region)
  // TODO: Navigate to region details
}

const editRegion = (region: any) => {
  console.log('Edit region:', region)
  // TODO: Implement edit modal
}

const deleteRegion = (region: any) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la région ${region.nom} ?`)) {
    console.log('Delete region:', region)
    // TODO: Call API to delete
  }
}
</script>
