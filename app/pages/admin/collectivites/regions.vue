<template>
  <div class="p-6">
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
        <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
        Nouvelle Région
      </button>
    </div>

    <!-- Search and Filter -->
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
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="w-12 h-12 mx-auto animate-spin text-gray-400" />
      <p class="mt-4 text-gray-500">Chargement...</p>
    </div>

    <!-- Regions Grid -->
    <div v-else-if="filteredRegions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="region in filteredRegions"
        :key="region.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ region.nom }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Code: {{ region.code }}
            </p>
          </div>
          <span
            :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              region.actif
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
            ]"
          >
            {{ region.actif ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <p v-if="region.description" class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {{ region.description }}
        </p>

        <div class="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="openEditModal(region)"
            class="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
            title="Modifier"
          >
            <Icon name="heroicons:pencil" class="w-5 h-5" />
          </button>
          <button
            @click="toggleStatus(region)"
            class="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg cursor-pointer"
            :title="region.actif ? 'Désactiver' : 'Activer'"
          >
            <Icon :name="region.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:map" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Aucune région trouvée</p>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier la Région' : 'Nouvelle Région' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveRegion" class="space-y-4">
          <!-- Code -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.code"
              type="text"
              required
              :disabled="isEditing"
              maxlength="10"
              placeholder="Ex: TANA"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
            />
          </div>

          <!-- Nom -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nom"
              type="text"
              required
              maxlength="255"
              placeholder="Ex: Analamanga"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Description de la région"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Icon v-if="saving" name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

const api = useApi()

// State
const regions = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  description: '',
  actif: true
})

const currentRegion = ref<any>(null)

// Computed
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
  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true'
    result = result.filter(region => region.actif === isActive)
  }

  return result
})

// Methods
const fetchRegions = async () => {
  try {
    loading.value = true
    regions.value = await api.get('/api/v1/geo/regions?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement régions:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    description: '',
    actif: true
  }
  currentRegion.value = null
  showModal.value = true
}

const openEditModal = (region: any) => {
  isEditing.value = true
  currentRegion.value = region
  formData.value = {
    code: region.code,
    nom: region.nom,
    description: region.description || '',
    actif: region.actif
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    description: '',
    actif: true
  }
  currentRegion.value = null
}

const saveRegion = async () => {
  try {
    saving.value = true

    if (isEditing.value && currentRegion.value) {
      // Update
      const { code, ...updateData } = formData.value
      await api.put(`/api/v1/geo/regions/${currentRegion.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/geo/regions', formData.value)
    }

    await fetchRegions()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde région:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (region: any) => {
  try {
    await api.put(`/api/v1/geo/regions/${region.id}`, { actif: !region.actif })
    await fetchRegions()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchRegions()
})
</script>
