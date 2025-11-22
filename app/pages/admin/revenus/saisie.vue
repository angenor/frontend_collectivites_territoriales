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
            v-model="selectedExercice"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Sélectionner...</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <!-- Période -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Période <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedPeriode"
            :disabled="!selectedExercice"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            <option value="T1">Trimestre 1</option>
            <option value="T2">Trimestre 2</option>
            <option value="T3">Trimestre 3</option>
            <option value="T4">Trimestre 4</option>
            <option value="S1">Semestre 1</option>
            <option value="S2">Semestre 2</option>
            <option value="ANNUEL">Annuel</option>
          </select>
        </div>

        <!-- Commune -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commune <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedCommune"
            :disabled="!selectedPeriode"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            <option value="1">Toamasina I</option>
            <option value="2">Moramanga</option>
            <option value="3">Ambatondrazaka</option>
          </select>
        </div>

        <!-- Projet Minier (optionnel) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Projet Minier
          </label>
          <select
            v-model="selectedProjet"
            :disabled="!selectedCommune"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Tous</option>
            <option value="1">QMM - Ilménite</option>
            <option value="2">Ambatovy - Nickel</option>
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
          :disabled="!isFormValid"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Charger les données
        </button>
      </div>
    </div>

    <!-- Data Entry Table -->
    <div
      v-if="dataLoaded"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Tableau de Saisie
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ selectedExercice }} • {{ selectedPeriode }} • Commune: Toamasina I
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="importExcel"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
          >
            📊 Importer Excel
          </button>
          <button
            @click="saveDraft"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
          >
            💾 Enregistrer brouillon
          </button>
          <button
            @click="validateData"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
          >
            ✓ Valider
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
              :key="row.id"
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
            <span class="mr-4">💾 Dernière sauvegarde: Il y a 2 minutes</span>
            <span>📝 Statut: Brouillon</span>
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
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Enregistrer brouillon
            </button>
            <button
              @click="validateData"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Soumettre pour validation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!dataLoaded"
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

const selectedExercice = ref('')
const selectedPeriode = ref('')
const selectedCommune = ref('')
const selectedProjet = ref('')
const dataLoaded = ref(false)

const isFormValid = computed(() => {
  return selectedExercice.value && selectedPeriode.value && selectedCommune.value
})

// Mock table data
const tableData = ref([
  {
    id: '1',
    code: 'R1',
    nom: 'RECETTES TOTALES',
    niveau: 1,
    est_calculee: true,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
  {
    id: '2',
    code: 'R1.1',
    nom: 'Recettes de fonctionnement',
    niveau: 2,
    est_calculee: false,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
  {
    id: '3',
    code: 'R1.1.1',
    nom: 'Impôts et taxes',
    niveau: 3,
    est_calculee: false,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
  {
    id: '4',
    code: 'R1.1.2',
    nom: 'Revenus miniers',
    niveau: 3,
    est_calculee: false,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
  {
    id: '5',
    code: 'D1',
    nom: 'DÉPENSES TOTALES',
    niveau: 1,
    est_calculee: true,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
  {
    id: '6',
    code: 'S1',
    nom: 'SOLDE',
    niveau: 1,
    est_calculee: true,
    montant_prevu: 0,
    montant_realise: 0,
    ecart: 0,
    taux_realisation: 0,
  },
])

const loadData = () => {
  dataLoaded.value = true
  // TODO: Load data from API
  console.log('Loading data for:', {
    exercice: selectedExercice.value,
    periode: selectedPeriode.value,
    commune: selectedCommune.value,
    projet: selectedProjet.value,
  })
}

const calculateRow = (index: number) => {
  const row = tableData.value[index]

  // Calculate écart
  row.ecart = row.montant_realise - row.montant_prevu

  // Calculate taux de réalisation
  if (row.montant_prevu > 0) {
    row.taux_realisation = (row.montant_realise / row.montant_prevu) * 100
  } else {
    row.taux_realisation = 0
  }

  // TODO: Recalculate formulas for calculated rows
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const importExcel = () => {
  console.log('Import Excel')
  // TODO: Implement Excel import
}

const saveDraft = () => {
  console.log('Save draft')
  // TODO: Save to API as draft
}

const validateData = () => {
  console.log('Validate data')
  // TODO: Submit for validation
}

const cancel = () => {
  if (confirm('Êtes-vous sûr de vouloir annuler? Les modifications non sauvegardées seront perdues.')) {
    dataLoaded.value = false
    selectedExercice.value = ''
    selectedPeriode.value = ''
    selectedCommune.value = ''
    selectedProjet.value = ''
  }
}
</script>
