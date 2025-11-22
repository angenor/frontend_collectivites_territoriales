<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Rubriques
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configurez les lignes du tableau de revenus (interface sans code)
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="showPreview = !showPreview"
          class="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ showPreview ? 'Masquer l\'aperçu' : 'Aperçu du tableau' }}
        </button>
        <button
          @click="openCreateModal"
          class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Rubrique
        </button>
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="showPreview" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Aperçu du Tableau de Revenus
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                Rubrique
              </th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                Montant Prévu
              </th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                Montant Réalisé
              </th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                Écart
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="rubrique in sortedRubriques"
              :key="rubrique.id"
              :class="[
                rubrique.niveau === 1 ? 'font-bold bg-blue-50 dark:bg-blue-900/20' : '',
                rubrique.niveau === 2 ? 'bg-gray-50 dark:bg-gray-900/30' : ''
              ]"
            >
              <td class="px-4 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                <span :style="{ paddingLeft: `${(rubrique.niveau - 1) * 20}px` }">
                  {{ rubrique.code }} - {{ rubrique.nom }}
                </span>
              </td>
              <td class="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                {{ rubrique.est_calculee ? '-' : '0.00' }}
              </td>
              <td class="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                {{ rubrique.est_calculee ? '-' : '0.00' }}
              </td>
              <td class="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                -
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
        💡 Cet aperçu montre comment le tableau apparaîtra lors de la saisie des revenus
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rechercher
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nom ou code..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <select
            v-model="categoryFilter"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Toutes</option>
            <option value="recette">Recettes</option>
            <option value="depense">Dépenses</option>
            <option value="solde">Soldes</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            v-model="typeFilter"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            <option value="saisie">Saisie manuelle</option>
            <option value="calculee">Calculée</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Rubriques Tree/List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Arborescence des Rubriques ({{ filteredRubriques.length }})
        </h3>
        <div class="flex items-center space-x-2">
          <button
            @click="expandAll"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer"
          >
            Tout développer
          </button>
          <span class="text-gray-400">|</span>
          <button
            @click="collapseAll"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer"
          >
            Tout réduire
          </button>
        </div>
      </div>

      <!-- Tree View -->
      <div class="p-6">
        <div class="space-y-2">
          <div
            v-for="rubrique in filteredRubriques"
            :key="rubrique.id"
            :style="{ paddingLeft: `${(rubrique.niveau - 1) * 24}px` }"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
          >
            <!-- Left: Rubrique Info -->
            <div class="flex items-center space-x-3 flex-1">
              <!-- Drag Handle -->
              <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-move">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </button>

              <!-- Expand/Collapse (if has children) -->
              <button
                v-if="rubrique.niveau < 3"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div v-else class="w-4"></div>

              <!-- Rubrique Details -->
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-mono text-gray-500 dark:text-gray-400">{{ rubrique.code }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ rubrique.nom }}</span>

                  <!-- Badges -->
                  <span
                    v-if="rubrique.est_calculee"
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    Calculée
                  </span>
                  <span
                    v-if="rubrique.afficher_total"
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    Total
                  </span>
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ rubrique.categorie }} • Niveau {{ rubrique.niveau }}
                  <span v-if="rubrique.formule_calcul" class="ml-2">
                    📐 {{ rubrique.formule_calcul }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center space-x-2">
              <button
                @click="addChild(rubrique)"
                class="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                title="Ajouter une sous-rubrique"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                @click="editRubrique(rubrique)"
                class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
                title="Modifier"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteRubrique(rubrique)"
                class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
                title="Supprimer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Section -->
    <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-blue-800 dark:text-blue-300">
          <p class="font-semibold mb-2">💡 Conseils d'utilisation :</p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>Utilisez le glisser-déposer pour réorganiser les rubriques</li>
            <li>Les rubriques calculées utilisent des formules (ex: R1 + R2 - R3)</li>
            <li>Vous pouvez créer jusqu'à 3 niveaux de hiérarchie</li>
            <li>L'aperçu vous montre le rendu final du tableau</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

// Mock data
const rubriques = ref([
  {
    id: '1',
    code: 'R1',
    nom: 'RECETTES TOTALES',
    categorie: 'recette',
    niveau: 1,
    ordre: 1,
    parent_id: null,
    est_calculee: true,
    formule_calcul: 'R1.1 + R1.2',
    afficher_total: true,
  },
  {
    id: '2',
    code: 'R1.1',
    nom: 'Recettes de fonctionnement',
    categorie: 'recette',
    niveau: 2,
    ordre: 2,
    parent_id: '1',
    est_calculee: false,
    formule_calcul: null,
    afficher_total: true,
  },
  {
    id: '3',
    code: 'R1.1.1',
    nom: 'Impôts et taxes',
    categorie: 'recette',
    niveau: 3,
    ordre: 3,
    parent_id: '2',
    est_calculee: false,
    formule_calcul: null,
    afficher_total: false,
  },
  {
    id: '4',
    code: 'R1.2',
    nom: 'Recettes d\'investissement',
    categorie: 'recette',
    niveau: 2,
    ordre: 4,
    parent_id: '1',
    est_calculee: false,
    formule_calcul: null,
    afficher_total: true,
  },
  {
    id: '5',
    code: 'D1',
    nom: 'DÉPENSES TOTALES',
    categorie: 'depense',
    niveau: 1,
    ordre: 5,
    parent_id: null,
    est_calculee: true,
    formule_calcul: 'D1.1 + D1.2',
    afficher_total: true,
  },
  {
    id: '6',
    code: 'S1',
    nom: 'SOLDE',
    categorie: 'solde',
    niveau: 1,
    ordre: 6,
    parent_id: null,
    est_calculee: true,
    formule_calcul: 'R1 - D1',
    afficher_total: true,
  },
])

const showPreview = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const typeFilter = ref('')

const filteredRubriques = computed(() => {
  let result = rubriques.value

  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.nom.toLowerCase().includes(search) ||
      r.code.toLowerCase().includes(search)
    )
  }

  if (categoryFilter.value) {
    result = result.filter(r => r.categorie === categoryFilter.value)
  }

  if (typeFilter.value) {
    const isCalculated = typeFilter.value === 'calculee'
    result = result.filter(r => r.est_calculee === isCalculated)
  }

  return result
})

const sortedRubriques = computed(() => {
  return [...filteredRubriques.value].sort((a, b) => a.ordre - b.ordre)
})

const openCreateModal = () => {
  console.log('Open create modal')
}

const addChild = (rubrique: any) => {
  console.log('Add child to:', rubrique)
}

const editRubrique = (rubrique: any) => {
  console.log('Edit rubrique:', rubrique)
}

const deleteRubrique = (rubrique: any) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la rubrique ${rubrique.nom} ?`)) {
    console.log('Delete rubrique:', rubrique)
  }
}

const expandAll = () => {
  console.log('Expand all')
}

const collapseAll = () => {
  console.log('Collapse all')
}
</script>
