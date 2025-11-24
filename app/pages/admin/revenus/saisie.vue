<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Saisie des Revenus Miniers
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Saisissez les données financières par commune et période
      </p>
    </div>

    <!-- Selection Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Exercice -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exercice <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedExerciceId"
            @change="onExerciceChange"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Sélectionner...</option>
            <option v-for="ex in exercices" :key="ex.id" :value="ex.id">
              {{ ex.annee }}
            </option>
          </select>
        </div>

        <!-- Période -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Période <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedPeriodeId"
            :disabled="!selectedExerciceId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            <option v-for="periode in filteredPeriodes" :key="periode.id" :value="periode.id">
              {{ periode.nom }}
            </option>
          </select>
        </div>

        <!-- Commune -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commune <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedCommuneId"
            :disabled="!selectedPeriodeId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            <option v-for="commune in communes" :key="commune.id" :value="commune.id">
              {{ commune.nom }}
            </option>
          </select>
        </div>

        <!-- Projet Minier (optionnel) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Projet Minier
          </label>
          <select
            v-model="selectedProjetId"
            :disabled="!selectedCommuneId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Tous</option>
            <option v-for="projet in projets" :key="projet.id" :value="projet.id">
              {{ projet.nom }}
            </option>
          </select>
        </div>
      </div>

      <!-- Load Button -->
      <div class="mt-4 flex items-center justify-between">
        <div v-if="isFormValid" class="text-sm text-green-600 dark:text-green-400">
          ✓ Prêt à charger les données
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Sélectionnez l'exercice, la période et la commune pour commencer
        </div>
        <button
          @click="loadData"
          :disabled="!isFormValid || loading"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ loading ? 'Chargement...' : 'Charger les données' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="w-12 h-12 mx-auto animate-spin text-gray-400" />
      <p class="mt-4 text-gray-500">Chargement des données...</p>
    </div>

    <!-- Data Entry Table -->
    <div
      v-else-if="dataLoaded"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Tableau de Saisie
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ getSelectedExercice()?.annee }} • {{ getSelectedPeriode()?.nom }} • {{ getSelectedCommune()?.nom }}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="importExcel"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
          >
            <Icon name="heroicons:document-arrow-down" class="inline-block w-4 h-4 mr-1" />
            Importer Excel
          </button>
          <button
            @click="saveDraft"
            :disabled="saving"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            <Icon name="heroicons:bookmark" class="inline-block w-4 h-4 mr-1" />
            {{ saving ? 'Enregistrement...' : 'Enregistrer brouillon' }}
          </button>
          <button
            @click="validateData"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            <Icon name="heroicons:check-circle" class="inline-block w-4 h-4 mr-1" />
            Valider
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                Rubrique
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                Montant Prévu (Ar)
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                Montant Réalisé (Ar)
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                Écart (Ar)
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                Taux de Réalisation
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(row, index) in tableData"
              :key="row.rubrique_id"
              :class="[
                row.niveau === 1 ? 'bg-blue-50 dark:bg-blue-900/20 font-bold' : '',
                row.niveau === 2 ? 'bg-gray-50 dark:bg-gray-900/30 font-semibold' : '',
                row.est_calculee ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
              ]"
            >
              <!-- Rubrique -->
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                <div :style="{ paddingLeft: `${(row.niveau - 1) * 16}px` }" class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 mr-2">{{ row.code }}</span>
                  <span>{{ row.nom }}</span>
                  <span v-if="row.est_calculee" class="ml-2 text-xs text-purple-600 dark:text-purple-400">
                    (calculé)
                  </span>
                </div>
              </td>

              <!-- Montant Prévu -->
              <td class="px-6 py-3 text-right">
                <input
                  v-if="!row.est_calculee"
                  v-model.number="row.montant_prevu"
                  @input="calculateRow(index)"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(row.montant_prevu) }}
                </span>
              </td>

              <!-- Montant Réalisé -->
              <td class="px-6 py-3 text-right">
                <input
                  v-if="!row.est_calculee"
                  v-model.number="row.montant_realise"
                  @input="calculateRow(index)"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(row.montant_realise) }}
                </span>
              </td>

              <!-- Écart -->
              <td class="px-6 py-3 text-right">
                <span
                  :class="[
                    'text-sm font-medium',
                    row.ecart > 0 ? 'text-green-600 dark:text-green-400' :
                    row.ecart < 0 ? 'text-red-600 dark:text-red-400' :
                    'text-gray-900 dark:text-white'
                  ]"
                >
                  {{ formatCurrency(row.ecart) }}
                </span>
              </td>

              <!-- Taux de Réalisation -->
              <td class="px-6 py-3 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <span
                    :class="[
                      'text-sm font-medium',
                      row.taux_realisation >= 100 ? 'text-green-600 dark:text-green-400' :
                      row.taux_realisation >= 80 ? 'text-blue-600 dark:text-blue-400' :
                      row.taux_realisation >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    ]"
                  >
                    {{ row.taux_realisation.toFixed(1) }}%
                  </span>
                  <!-- Progress bar -->
                  <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full transition-all',
                        row.taux_realisation >= 100 ? 'bg-green-600' :
                        row.taux_realisation >= 80 ? 'bg-blue-600' :
                        row.taux_realisation >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      ]"
                      :style="{ width: `${Math.min(row.taux_realisation, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="lastSaved" class="mr-4">
              <Icon name="heroicons:clock" class="inline-block w-4 h-4 mr-1" />
              Dernière sauvegarde: {{ lastSaved }}
            </span>
            <span>
              <Icon name="heroicons:document-text" class="inline-block w-4 h-4 mr-1" />
              Statut: {{ isValidated ? 'Validé' : 'Brouillon' }}
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="cancel"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              @click="saveDraft"
              :disabled="saving"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Enregistrer brouillon
            </button>
            <button
              @click="validateData"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Soumettre pour validation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!dataLoaded && !loading"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
    >
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-lg">
        Sélectionnez l'exercice, la période et la commune pour commencer la saisie
      </p>
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
const exercices = ref<any[]>([])
const periodes = ref<any[]>([])
const communes = ref<any[]>([])
const projets = ref<any[]>([])
const rubriques = ref<any[]>([])

const selectedExerciceId = ref('')
const selectedPeriodeId = ref('')
const selectedCommuneId = ref('')
const selectedProjetId = ref('')

const dataLoaded = ref(false)
const loading = ref(false)
const saving = ref(false)
const tableData = ref<any[]>([])
const lastSaved = ref('')
const isValidated = ref(false)

// Computed
const isFormValid = computed(() => {
  return selectedExerciceId.value && selectedPeriodeId.value && selectedCommuneId.value
})

const filteredPeriodes = computed(() => {
  if (!selectedExerciceId.value) return []
  return periodes.value.filter(p => p.exercice_id === selectedExerciceId.value)
})

const getSelectedExercice = () => {
  return exercices.value.find(e => e.id === selectedExerciceId.value)
}

const getSelectedPeriode = () => {
  return periodes.value.find(p => p.id === selectedPeriodeId.value)
}

const getSelectedCommune = () => {
  return communes.value.find(c => c.id === selectedCommuneId.value)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchExercices(),
    fetchCommunes(),
    fetchProjets(),
    fetchRubriques(),
    fetchPeriodes()
  ])
})

// Methods
const fetchExercices = async () => {
  try {
    exercices.value = await api.get('/api/v1/exercices/exercices')
  } catch (error) {
    console.error('Erreur chargement exercices:', error)
  }
}

const fetchPeriodes = async () => {
  try {
    periodes.value = await api.get('/api/v1/exercices/periodes')
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const fetchCommunes = async () => {
  try {
    communes.value = await api.get('/api/v1/geo/communes')
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const fetchProjets = async () => {
  try {
    projets.value = await api.get('/api/v1/projets-miniers/projets')
  } catch (error) {
    console.error('Erreur chargement projets:', error)
  }
}

const fetchRubriques = async () => {
  try {
    rubriques.value = await api.get('/api/v1/rubriques/')
  } catch (error) {
    console.error('Erreur chargement rubriques:', error)
  }
}

const onExerciceChange = () => {
  // Reset période when exercice changes
  selectedPeriodeId.value = ''
}

const loadData = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true

    // Build table structure from rubriques
    const tableStructure = rubriques.value.map(rubrique => ({
      rubrique_id: rubrique.id,
      code: rubrique.code,
      nom: rubrique.nom,
      niveau: rubrique.niveau,
      est_calculee: rubrique.est_calculee,
      montant_prevu: 0,
      montant_realise: 0,
      ecart: 0,
      taux_realisation: 0,
      revenu_id: null // Will be set if revenue exists
    }))

    // Load existing revenue data
    const params = new URLSearchParams({
      commune_id: selectedCommuneId.value,
      periode_id: selectedPeriodeId.value
    })

    if (selectedProjetId.value) {
      params.append('projet_minier_id', selectedProjetId.value)
    }

    const existingRevenus = await api.get(`/api/v1/revenus/search?${params.toString()}`)

    // Merge existing data with table structure
    existingRevenus.forEach((revenu: any) => {
      const row = tableStructure.find(r => r.rubrique_id === revenu.rubrique_id)
      if (row) {
        row.revenu_id = revenu.id
        row.montant_prevu = parseFloat(revenu.montant_prevu || 0)
        row.montant_realise = parseFloat(revenu.montant || 0)
        row.ecart = parseFloat(revenu.ecart || 0)
        row.taux_realisation = parseFloat(revenu.taux_realisation || 0)
      }
    })

    tableData.value = tableStructure
    dataLoaded.value = true

    // Calculate all rows to ensure consistency
    tableData.value.forEach((_, index) => calculateRow(index))

  } catch (error: any) {
    console.error('Erreur chargement données:', error)
    alert(error.message || 'Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

const calculateRow = (index: number) => {
  const row = tableData.value[index]

  // Only calculate for non-calculated rows
  if (!row.est_calculee) {
    // Calculate écart
    row.ecart = row.montant_realise - row.montant_prevu

    // Calculate taux de réalisation
    if (row.montant_prevu > 0) {
      row.taux_realisation = (row.montant_realise / row.montant_prevu) * 100
    } else {
      row.taux_realisation = 0
    }
  }

  // TODO: Recalculate formulas for calculated rows based on their children
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

const saveDraft = async () => {
  await saveData(false)
}

const validateData = async () => {
  if (confirm('Êtes-vous sûr de vouloir soumettre ces données pour validation?')) {
    await saveData(true)
  }
}

const saveData = async (validate: boolean = false) => {
  try {
    saving.value = true

    // Save only non-calculated rows
    const rowsToSave = tableData.value.filter(row => !row.est_calculee)

    for (const row of rowsToSave) {
      const data = {
        commune_id: selectedCommuneId.value,
        rubrique_id: row.rubrique_id,
        periode_id: selectedPeriodeId.value,
        projet_minier_id: selectedProjetId.value || null,
        montant: row.montant_realise,
        montant_prevu: row.montant_prevu
      }

      if (row.revenu_id) {
        // Update existing revenue
        await api.put(`/api/v1/revenus/${row.revenu_id}`, data)
      } else {
        // Create new revenue
        const created = await api.post('/api/v1/revenus/', data)
        row.revenu_id = created.id
      }
    }

    lastSaved.value = new Date().toLocaleTimeString('fr-FR')
    isValidated.value = validate

    if (validate) {
      alert('Données soumises avec succès pour validation')
    } else {
      alert('Brouillon enregistré avec succès')
    }
  } catch (error: any) {
    console.error('Erreur sauvegarde:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const importExcel = () => {
  // Redirect to Excel import page
  navigateTo('/admin/import/excel')
}

const cancel = () => {
  if (confirm('Êtes-vous sûr de vouloir annuler? Les modifications non sauvegardées seront perdues.')) {
    dataLoaded.value = false
    selectedExerciceId.value = ''
    selectedPeriodeId.value = ''
    selectedCommuneId.value = ''
    selectedProjetId.value = ''
    tableData.value = []
    lastSaved.value = ''
    isValidated.value = false
  }
}
</script>
