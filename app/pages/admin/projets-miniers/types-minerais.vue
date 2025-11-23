<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Types de Minerais
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les types de minerais exploités à Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouveau Type
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Rechercher un type de minerai..."
        class="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
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
              Description
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
          <tr v-else-if="filteredTypes.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              Aucun type de minerai trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="type in filteredTypes"
            :key="type.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {{ type.code }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ type.nom }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ type.description || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                v-if="type.actif"
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
                @click="openEditModal(type)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(type)"
                class="cursor-pointer ml-3 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                :title="type.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="type.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
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
            {{ isEditing ? 'Modifier le Type de Minerai' : 'Nouveau Type de Minerai' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveType" class="space-y-4">
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
              placeholder="Ex: OR, COBALT, NICKEL"
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
              placeholder="Nom du minerai"
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
              placeholder="Description du type de minerai (optionnel)"
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
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const api = useApi()

// State
const types = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchTerm = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  description: ''
})

const currentType = ref<any>(null)

// Computed
const filteredTypes = computed(() => {
  if (!searchTerm.value) return types.value

  const term = searchTerm.value.toLowerCase()
  return types.value.filter(t =>
    t.nom.toLowerCase().includes(term) ||
    t.code.toLowerCase().includes(term) ||
    (t.description && t.description.toLowerCase().includes(term))
  )
})

// Methods
const fetchTypes = async () => {
  try {
    loading.value = true
    types.value = await api.get('/api/v1/projets-miniers/types-minerais?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement types de minerais:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    description: ''
  }
  currentType.value = null
  showModal.value = true
}

const openEditModal = (type: any) => {
  isEditing.value = true
  currentType.value = type
  formData.value = {
    code: type.code,
    nom: type.nom,
    description: type.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    description: ''
  }
  currentType.value = null
}

const saveType = async () => {
  try {
    saving.value = true

    if (isEditing.value && currentType.value) {
      // Update
      await api.put(`/api/v1/projets-miniers/types-minerais/${currentType.value.id}`, {
        nom: formData.value.nom,
        description: formData.value.description
      })
    } else {
      // Create
      await api.post('/api/v1/projets-miniers/types-minerais', {
        ...formData.value,
        actif: true
      })
    }

    await fetchTypes()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde type de minerai:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (type: any) => {
  if (!confirm(`Voulez-vous ${type.actif ? 'désactiver' : 'activer'} ce type de minerai ?`)) {
    return
  }

  try {
    if (type.actif) {
      // Désactiver
      await api.delete(`/api/v1/projets-miniers/types-minerais/${type.id}`)
    } else {
      // Réactiver
      await api.put(`/api/v1/projets-miniers/types-minerais/${type.id}`, { actif: true })
    }

    await fetchTypes()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchTypes()
})
</script>
