<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Sociétés Minières
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les sociétés minières exploitantes
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouvelle Société
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Rechercher une société (nom, NIF, STAT)..."
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
              NIF
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Contact
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
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              <Icon name="heroicons:arrow-path" class="mx-auto h-8 w-8 animate-spin" />
              <p class="mt-2">Chargement...</p>
            </td>
          </tr>
          <tr v-else-if="filteredSocietes.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              Aucune société minière trouvée
            </td>
          </tr>
          <tr
            v-else
            v-for="societe in filteredSocietes"
            :key="societe.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {{ societe.code }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              <div class="font-medium">{{ societe.nom }}</div>
              <div v-if="societe.raison_sociale" class="text-xs text-gray-500 dark:text-gray-400">
                {{ societe.raison_sociale }}
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ societe.nif || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              <div v-if="societe.telephone" class="flex items-center gap-1">
                <Icon name="heroicons:phone" class="h-4 w-4" />
                {{ societe.telephone }}
              </div>
              <div v-if="societe.email" class="flex items-center gap-1 text-xs">
                <Icon name="heroicons:envelope" class="h-4 w-4" />
                {{ societe.email }}
              </div>
              <span v-if="!societe.telephone && !societe.email">-</span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                v-if="societe.actif"
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
                @click="openEditModal(societe)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(societe)"
                class="cursor-pointer ml-3 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                :title="societe.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="societe.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 my-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier la Société' : 'Nouvelle Société Minière' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveSociete" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                placeholder="Ex: AMBATOVY"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
              />
            </div>

            <!-- Nom -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom commercial <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.nom"
                type="text"
                required
                placeholder="Nom de la société"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Raison sociale -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Raison sociale
            </label>
            <input
              v-model="formData.raison_sociale"
              type="text"
              placeholder="Raison sociale complète"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- NIF -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                NIF (Numéro d'Identification Fiscale)
              </label>
              <input
                v-model="formData.nif"
                type="text"
                placeholder="Ex: 1234567890"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- STAT -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                STAT (Numéro statistique)
              </label>
              <input
                v-model="formData.stat"
                type="text"
                placeholder="Ex: 12345678901234"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Adresse -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </label>
            <textarea
              v-model="formData.adresse"
              rows="2"
              placeholder="Adresse complète du siège social"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Téléphone -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
              <input
                v-model="formData.telephone"
                type="tel"
                placeholder="+261 34 12 345 67"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="contact@societe.mg"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
const societes = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchTerm = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  raison_sociale: '',
  nif: '',
  stat: '',
  adresse: '',
  telephone: '',
  email: ''
})

const currentSociete = ref<any>(null)

// Computed
const filteredSocietes = computed(() => {
  if (!searchTerm.value) return societes.value

  const term = searchTerm.value.toLowerCase()
  return societes.value.filter(s =>
    s.nom.toLowerCase().includes(term) ||
    s.code.toLowerCase().includes(term) ||
    (s.nif && s.nif.toLowerCase().includes(term)) ||
    (s.stat && s.stat.toLowerCase().includes(term)) ||
    (s.raison_sociale && s.raison_sociale.toLowerCase().includes(term))
  )
})

// Methods
const fetchSocietes = async () => {
  try {
    loading.value = true
    societes.value = await api.get('/api/v1/projets-miniers/societes?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement sociétés minières:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    raison_sociale: '',
    nif: '',
    stat: '',
    adresse: '',
    telephone: '',
    email: ''
  }
  currentSociete.value = null
  showModal.value = true
}

const openEditModal = (societe: any) => {
  isEditing.value = true
  currentSociete.value = societe
  formData.value = {
    code: societe.code,
    nom: societe.nom,
    raison_sociale: societe.raison_sociale || '',
    nif: societe.nif || '',
    stat: societe.stat || '',
    adresse: societe.adresse || '',
    telephone: societe.telephone || '',
    email: societe.email || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    raison_sociale: '',
    nif: '',
    stat: '',
    adresse: '',
    telephone: '',
    email: ''
  }
  currentSociete.value = null
}

const saveSociete = async () => {
  try {
    saving.value = true

    const dataToSend = {
      code: formData.value.code,
      nom: formData.value.nom,
      raison_sociale: formData.value.raison_sociale || null,
      nif: formData.value.nif || null,
      stat: formData.value.stat || null,
      adresse: formData.value.adresse || null,
      telephone: formData.value.telephone || null,
      email: formData.value.email || null,
      actif: true
    }

    if (isEditing.value && currentSociete.value) {
      // Update
      const { code, ...updateData } = dataToSend
      await api.put(`/api/v1/projets-miniers/societes/${currentSociete.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/projets-miniers/societes', dataToSend)
    }

    await fetchSocietes()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde société:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (societe: any) => {
  if (!confirm(`Voulez-vous ${societe.actif ? 'désactiver' : 'activer'} cette société ?`)) {
    return
  }

  try {
    if (societe.actif) {
      // Désactiver
      await api.delete(`/api/v1/projets-miniers/societes/${societe.id}`)
    } else {
      // Réactiver
      await api.put(`/api/v1/projets-miniers/societes/${societe.id}`, { actif: true })
    }

    await fetchSocietes()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchSocietes()
})
</script>
