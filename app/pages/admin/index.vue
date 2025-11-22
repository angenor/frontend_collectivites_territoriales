<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Tableau de Bord
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Vue d'ensemble de la plateforme de suivi des revenus miniers
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Total Communes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-transform hover:scale-105">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Communes</p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ stats.totalCommunes }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-xs text-green-600 dark:text-green-400 font-medium">+12% ce mois</span>
        </div>
      </div>

      <!-- Total Projets Miniers -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-transform hover:scale-105">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Projets Miniers</p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ stats.totalProjets }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-xs text-green-600 dark:text-green-400 font-medium">{{ stats.projetsActifs }} actifs</span>
        </div>
      </div>

      <!-- Total Revenus -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-transform hover:scale-105">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus (Année)</p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(stats.totalRevenus) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-xs text-green-600 dark:text-green-400 font-medium">+8.2% vs année précédente</span>
        </div>
      </div>

      <!-- Total Utilisateurs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-transform hover:scale-105">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs</p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ stats.totalUtilisateurs }}
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ stats.utilisateursActifs }} actifs</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenus par Région -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Revenus par Région
          </h2>
          <select class="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <!-- Placeholder pour le graphique -->
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p class="text-sm">Graphique à implémenter</p>
          </div>
        </div>
      </div>

      <!-- Évolution des Revenus -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Évolution des Revenus
          </h2>
          <select class="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>12 derniers mois</option>
            <option>6 derniers mois</option>
            <option>3 derniers mois</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <!-- Placeholder pour le graphique -->
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p class="text-sm">Graphique à implémenter</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Top Communes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Activités Récentes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Activités Récentes
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div :class="[
                'w-2 h-2 mt-2 rounded-full',
                activity.type === 'create' ? 'bg-green-500' :
                activity.type === 'update' ? 'bg-blue-500' : 'bg-red-500'
              ]"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ activity.time }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Communes par Revenus -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Top 5 Communes
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="(commune, index) in topCommunes"
              :key="commune.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ index + 1 }}</span>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ commune.nom }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ commune.region }}
                  </p>
                </div>
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(commune.revenus) }}
              </div>
            </div>
          </div>
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

// Mock data - sera remplacé par des appels API réels
const stats = ref({
  totalCommunes: 152,
  totalProjets: 28,
  projetsActifs: 23,
  totalRevenus: 45250000000,
  totalUtilisateurs: 42,
  utilisateursActifs: 38,
})

const recentActivities = ref([
  {
    id: 1,
    type: 'create',
    description: 'Nouveau projet minier ajouté à Toamasina',
    time: 'Il y a 2 heures',
  },
  {
    id: 2,
    type: 'update',
    description: 'Revenus mis à jour pour la commune de Moramanga',
    time: 'Il y a 4 heures',
  },
  {
    id: 3,
    type: 'create',
    description: 'Nouvel utilisateur créé: Marie Rakoto',
    time: 'Il y a 6 heures',
  },
  {
    id: 4,
    type: 'update',
    description: 'Document validé pour Ambatondrazaka',
    time: 'Il y a 1 jour',
  },
  {
    id: 5,
    type: 'delete',
    description: 'Rubrique supprimée du système',
    time: 'Il y a 2 jours',
  },
])

const topCommunes = ref([
  { id: 1, nom: 'Toamasina', region: 'Atsinanana', revenus: 12500000000 },
  { id: 2, nom: 'Moramanga', region: 'Alaotra-Mangoro', revenus: 8750000000 },
  { id: 3, nom: 'Ambatondrazaka', region: 'Alaotra-Mangoro', revenus: 6200000000 },
  { id: 4, nom: 'Fort-Dauphin', region: 'Anosy', revenus: 5800000000 },
  { id: 5, nom: 'Taolagnaro', region: 'Anosy', revenus: 4950000000 },
])

// Formateur de devise
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
  }).format(value)
}

// À terme, on pourrait charger les stats depuis l'API
// onMounted(async () => {
//   const api = useApi()
//   stats.value = await api.get('/api/v1/dashboard/stats')
// })
</script>
