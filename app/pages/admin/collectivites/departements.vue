<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Départements
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les départements administratifs de Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouveau Département
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Rechercher
        </label>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Nom du département..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Région
        </label>
        <select
          v-model="selectedRegion"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Toutes les régions</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">
            {{ region.nom }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Statut
        </label>
        <select
          v-model="statusFilter"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Code
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Nom
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Région
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
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              <Icon name="heroicons:arrow-path" class="mx-auto h-8 w-8 animate-spin" />
              <p class="mt-2">Chargement...</p>
            </td>
          </tr>
          <tr v-else-if="filteredDepartements.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              Aucun département trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="dept in filteredDepartements"
            :key="dept.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {{ dept.code }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ dept.nom }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ dept.region?.nom || 'N/A' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                v-if="dept.actif"
                class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300"
              >
                Actif
              </span>
              <span
                v-else
                class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/50 dark:text-red-300"
              >
                Inactif
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                @click="openEditModal(dept)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(dept)"
                class="cursor-pointer ml-3 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                :title="dept.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="dept.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier le Département' : 'Nouveau Département' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveDepartement" class="space-y-4">
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
              placeholder="Ex: ANA-01"
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
              placeholder="Nom du département"
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
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionnez une région</option>
              <option v-for="region in regions" :key="region.id" :value="region.id">
                {{ region.nom }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Description du département (optionnel)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            ></textarea>
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
              class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
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
const api = useApi()

// State
const departements = ref<any[]>([])
const regions = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

// Filters
const searchTerm = ref('')
const selectedRegion = ref('')
const statusFilter = ref('active')

// Form data
const formData = ref({
  code: '',
  nom: '',
  region_id: '',
  description: '',
  actif: true
})

const currentDepartement = ref<any>(null)

// Computed
const filteredDepartements = computed(() => {
  let result = departements.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(d =>
      d.nom.toLowerCase().includes(term) ||
      d.code.toLowerCase().includes(term)
    )
  }

  // Filter by region
  if (selectedRegion.value) {
    result = result.filter(d => d.region_id === selectedRegion.value)
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    result = result.filter(d => d.actif)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(d => !d.actif)
  }

  return result
})

// Methods
const fetchDepartements = async () => {
  try {
    loading.value = true
    departements.value = await api.get('/api/v1/geo/departements?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement départements:', error)
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

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    region_id: '',
    description: '',
    actif: true
  }
  currentDepartement.value = null
  showModal.value = true
}

const openEditModal = (dept: any) => {
  isEditing.value = true
  currentDepartement.value = dept
  formData.value = {
    code: dept.code,
    nom: dept.nom,
    region_id: dept.region_id,
    description: dept.description || '',
    actif: dept.actif
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    region_id: '',
    description: '',
    actif: true
  }
  currentDepartement.value = null
}

const saveDepartement = async () => {
  try {
    saving.value = true

    if (isEditing.value && currentDepartement.value) {
      // Update
      await api.put(`/api/v1/geo/departements/${currentDepartement.value.id}`, {
        nom: formData.value.nom,
        region_id: formData.value.region_id,
        description: formData.value.description
      })
    } else {
      // Create
      await api.post('/api/v1/geo/departements', formData.value)
    }

    await fetchDepartements()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde département:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (dept: any) => {
  if (!confirm(`Voulez-vous ${dept.actif ? 'désactiver' : 'activer'} ce département ?`)) {
    return
  }

  try {
    if (dept.actif) {
      // Désactiver
      await api.delete(`/api/v1/geo/departements/${dept.id}`)
    } else {
      // Réactiver
      await api.put(`/api/v1/geo/departements/${dept.id}`, { actif: true })
    }

    await fetchDepartements()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchDepartements(), fetchRegions()])
})
</script>
