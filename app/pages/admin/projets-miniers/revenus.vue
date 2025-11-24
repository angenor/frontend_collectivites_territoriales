<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Revenus des Projets Miniers
      </h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Consultez les revenus générés par les projets miniers
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <select
        v-model="filterProjet"
        @change="fetchRevenus"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous les projets</option>
        <option v-for="projet in projets" :key="projet.id" :value="projet.id">
          {{ projet.nom }}
        </option>
      </select>

      <select
        v-model="filterCommune"
        @change="fetchRevenus"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Toutes les communes</option>
        <option v-for="commune in communes" :key="commune.id" :value="commune.id">
          {{ commune.nom }}
        </option>
      </select>

      <select
        v-model="filterExercice"
        @change="fetchRevenus"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous les exercices</option>
        <option v-for="exercice in exercices" :key="exercice.id" :value="exercice.annee">
          {{ exercice.annee }}
        </option>
      </select>

      <button
        @click="exportExcel"
        class="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        <Icon name="heroicons:document-arrow-down" class="h-5 w-5" />
        Export Excel
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="w-12 h-12 mx-auto animate-spin text-gray-400" />
      <p class="mt-4 text-gray-500">Chargement...</p>
    </div>

    <!-- Stats Cards -->
    <div v-else-if="revenus.length > 0" class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">Total Revenus</p>
        <p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatMoney(totalRevenus) }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">Nombre de Lignes</p>
        <p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ revenus.length }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">Projets Actifs</p>
        <p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ projetsCount }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">Communes Concernées</p>
        <p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ communesCount }}
        </p>
      </div>
    </div>

    <!-- Table -->
    <div v-if="!loading" class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Projet
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Commune
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rubrique
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Période
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Montant
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Montant Prévu
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-if="revenus.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              Aucun revenu trouvé pour ces critères
            </td>
          </tr>
          <tr
            v-else
            v-for="revenu in revenus"
            :key="revenu.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ getProjetName(revenu.projet_minier_id) || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ getCommuneName(revenu.commune_id) || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ getRubriqueName(revenu.rubrique_id) || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ getPeriodeName(revenu.periode_id) || '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
              {{ formatMoney(revenu.montant) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
              {{ revenu.montant_prevu ? formatMoney(revenu.montant_prevu) : '-' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-center text-sm">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  revenu.valide ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                ]"
              >
                {{ revenu.valide ? 'Validé' : 'En attente' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
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
const revenus = ref<any[]>([])
const projets = ref<any[]>([])
const communes = ref<any[]>([])
const exercices = ref<any[]>([])
const rubriques = ref<any[]>([])
const periodes = ref<any[]>([])
const loading = ref(true)
const filterProjet = ref('')
const filterCommune = ref('')
const filterExercice = ref('')

// Computed
const totalRevenus = computed(() => {
  return revenus.value.reduce((sum, r) => sum + parseFloat(r.montant || 0), 0)
})

const projetsCount = computed(() => {
  const uniqueProjects = new Set(revenus.value.map(r => r.projet_minier_id).filter(Boolean))
  return uniqueProjects.size
})

const communesCount = computed(() => {
  const uniqueCommunes = new Set(revenus.value.map(r => r.commune_id).filter(Boolean))
  return uniqueCommunes.size
})

// Methods
const fetchRevenus = async () => {
  try {
    loading.value = true
    // Pour l'instant, on retourne un tableau vide car l'endpoint spécifique n'existe pas encore
    // TODO: Créer un endpoint pour filtrer les revenus par projet minier
    revenus.value = []
  } catch (error) {
    console.error('Erreur chargement revenus:', error)
  } finally {
    loading.value = false
  }
}

const fetchProjets = async () => {
  try {
    projets.value = await api.get('/api/v1/projets-miniers/projets')
  } catch (error) {
    console.error('Erreur chargement projets:', error)
  }
}

const fetchCommunes = async () => {
  try {
    communes.value = await api.get('/api/v1/geo/communes')
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const fetchExercices = async () => {
  try {
    exercices.value = await api.get('/api/v1/exercices/exercices')
  } catch (error) {
    console.error('Erreur chargement exercices:', error)
  }
}

const fetchRubriques = async () => {
  try {
    rubriques.value = await api.get('/api/v1/rubriques/')
  } catch (error) {
    console.error('Erreur chargement rubriques:', error)
  }
}

const fetchPeriodes = async () => {
  try {
    periodes.value = await api.get('/api/v1/exercices/periodes')
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const getProjetName = (id: string) => {
  const projet = projets.value.find(p => p.id === id)
  return projet?.nom || ''
}

const getCommuneName = (id: string) => {
  const commune = communes.value.find(c => c.id === id)
  return commune?.nom || ''
}

const getRubriqueName = (id: string) => {
  const rubrique = rubriques.value.find(r => r.id === id)
  return rubrique?.nom || ''
}

const getPeriodeName = (id: string) => {
  const periode = periodes.value.find(p => p.id === id)
  return periode?.nom || ''
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0
  }).format(value)
}

const exportExcel = () => {
  alert('Export Excel - Fonctionnalité à implémenter')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchProjets(),
    fetchCommunes(),
    fetchExercices(),
    fetchRubriques(),
    fetchPeriodes()
  ])
  await fetchRevenus()
})
</script>
