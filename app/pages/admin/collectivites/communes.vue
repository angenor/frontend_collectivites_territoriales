<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Communes
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gérez les communes de Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
      >
        <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
        Nouvelle Commune
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher une commune..."
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <select
          v-model="filterDepartement"
          @change="fetchCommunes"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Tous les départements</option>
          <option v-for="dep in departements" :key="dep.id" :value="dep.id">
            {{ dep.nom }}
          </option>
        </select>
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

    <!-- Table -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Code
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Commune
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Département
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Région
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Population
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-if="filteredCommunes.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              Aucune commune trouvée
            </td>
          </tr>
          <tr
            v-else
            v-for="commune in filteredCommunes"
            :key="commune.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
              {{ commune.code }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ commune.nom }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ commune.departement?.nom || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ commune.region?.nom || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ commune.population ? commune.population.toLocaleString() : '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  commune.actif ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                ]"
              >
                {{ commune.actif ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                @click="openEditModal(commune)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(commune)"
                class="cursor-pointer ml-3 text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                :title="commune.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="commune.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 my-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier la Commune' : 'Nouvelle Commune' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveCommune" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Ex: TANA01"
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
                placeholder="Ex: Antananarivo Renivohitra"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Région -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Région <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.region_id"
                @change="onRegionChange"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner une région</option>
                <option v-for="region in regions" :key="region.id" :value="region.id">
                  {{ region.nom }}
                </option>
              </select>
            </div>

            <!-- Département -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Département <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.departement_id"
                required
                :disabled="!formData.region_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
              >
                <option value="">Sélectionner un département</option>
                <option v-for="dep in filteredDepartements" :key="dep.id" :value="dep.id">
                  {{ dep.nom }}
                </option>
              </select>
            </div>

            <!-- Population -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Population
              </label>
              <input
                v-model.number="formData.population"
                type="number"
                min="0"
                placeholder="Ex: 15000"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Superficie -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Superficie (km²)
              </label>
              <input
                v-model.number="formData.superficie"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 125.5"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Description de la commune"
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
  middleware: ['auth']
})

const api = useApi()

// State
const communes = ref<any[]>([])
const regions = ref<any[]>([])
const departements = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchTerm = ref('')
const filterDepartement = ref('')
const statusFilter = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  region_id: '',
  departement_id: '',
  population: null as number | null,
  superficie: null as number | null,
  description: '',
  actif: true
})

const currentCommune = ref<any>(null)

// Computed
const filteredDepartements = computed(() => {
  if (!formData.value.region_id) return []
  return departements.value.filter(d => d.region_id === formData.value.region_id)
})

const filteredCommunes = computed(() => {
  let result = communes.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(c =>
      c.nom.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term)
    )
  }

  if (filterDepartement.value) {
    result = result.filter(c => c.departement_id === filterDepartement.value)
  }

  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true'
    result = result.filter(c => c.actif === isActive)
  }

  return result
})

// Methods
const fetchCommunes = async () => {
  try {
    loading.value = true
    let url = '/api/v1/geo/communes?actif_only=false'
    if (filterDepartement.value) {
      url += `&departement_id=${filterDepartement.value}`
    }
    communes.value = await api.get(url)
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  } finally {
    loading.value = false
  }
}

const fetchRegions = async () => {
  try {
    regions.value = await api.get('/api/v1/geo/regions')
  } catch (error) {
    console.error('Erreur chargement régions:', error)
  }
}

const fetchDepartements = async () => {
  try {
    departements.value = await api.get('/api/v1/geo/departements?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement départements:', error)
  }
}

const onRegionChange = () => {
  // Reset département when region changes
  formData.value.departement_id = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    region_id: '',
    departement_id: '',
    population: null,
    superficie: null,
    description: '',
    actif: true
  }
  currentCommune.value = null
  showModal.value = true
}

const openEditModal = (commune: any) => {
  isEditing.value = true
  currentCommune.value = commune
  formData.value = {
    code: commune.code,
    nom: commune.nom,
    region_id: commune.region_id,
    departement_id: commune.departement_id,
    population: commune.population,
    superficie: commune.superficie,
    description: commune.description || '',
    actif: commune.actif
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    region_id: '',
    departement_id: '',
    population: null,
    superficie: null,
    description: '',
    actif: true
  }
  currentCommune.value = null
}

const saveCommune = async () => {
  try {
    saving.value = true

    if (isEditing.value && currentCommune.value) {
      // Update
      const { code, ...updateData } = formData.value
      await api.put(`/api/v1/geo/communes/${currentCommune.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/geo/communes', formData.value)
    }

    await fetchCommunes()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde commune:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (commune: any) => {
  try {
    await api.put(`/api/v1/geo/communes/${commune.id}`, { actif: !commune.actif })
    await fetchCommunes()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchRegions(),
    fetchDepartements(),
    fetchCommunes()
  ])
})
</script>
