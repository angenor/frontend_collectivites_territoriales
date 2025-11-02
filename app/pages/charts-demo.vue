<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
    <div class="max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <font-awesome-icon icon="chart-bar" class="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Démonstration amCharts5
        </h1>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Exemples d'intégration de graphiques financiers interactifs avec amCharts5
        </p>
      </div>

      <!-- Info Card -->
      <div class="mb-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg shadow-md">
        <div class="flex items-start gap-3">
          <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 text-2xl mt-1" />
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Configuration amCharts5
            </h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
              amCharts5 a été installé et configuré avec succès dans ce projet Nuxt.
            </p>
            <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Package: @amcharts/amcharts5 v5.14.3</li>
              <li>Plugin client-side: app/plugins/amcharts.client.ts</li>
              <li>Composant: app/components/FinancialChart.vue</li>
              <li>Modules disponibles: Core, XY, Percent, Radar, Hierarchy, Flow, Map</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="space-y-8">
        <!-- Example 1: Recettes Analysis -->
        <FinancialChart
          title="Analyse des Recettes 2024"
          subtitle="Répartition par catégorie de recettes"
          :data="recettesData"
          initialChartType="bar"
        />

        <!-- Example 2: Dépenses Analysis -->
        <FinancialChart
          title="Analyse des Dépenses 2024"
          subtitle="Répartition par catégorie de dépenses"
          :data="depensesData"
          initialChartType="pie"
        />

        <!-- Example 3: Evolution temporelle -->
        <FinancialChart
          title="Évolution Budget 2020-2024"
          subtitle="Tendance sur 5 ans"
          :data="evolutionData"
          initialChartType="line"
        />
      </div>

      <!-- Usage Instructions -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <font-awesome-icon icon="book" class="text-indigo-600 dark:text-indigo-400" />
          Comment utiliser le composant FinancialChart
        </h2>

        <div class="prose prose-blue dark:prose-invert max-w-none">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Import du composant</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto"><code class="text-sm">&lt;script setup&gt;
// Le composant est auto-importé par Nuxt
const chartData = [
  { category: 'Recettes Fiscales', value: 125000000, color: '#10b981' },
  { category: 'Subventions', value: 85000000, color: '#34d399' }
]
&lt;/script&gt;</code></pre>

          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Utilisation dans le template</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto"><code class="text-sm">&lt;template&gt;
  &lt;FinancialChart
    title="Mon graphique"
    subtitle="Description du graphique"
    :data="chartData"
    initialChartType="bar"
  /&gt;
&lt;/template&gt;</code></pre>

          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Propriétés disponibles</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">title</code>: Titre du graphique (optionnel)</li>
            <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">subtitle</code>: Sous-titre du graphique (optionnel)</li>
            <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">data</code>: Tableau d'objets {category, value, color?}</li>
            <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">initialChartType</code>: Type de graphique initial ('bar', 'pie', ou 'line')</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Types de graphiques</h3>
          <div class="grid md:grid-cols-3 gap-4 mt-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <font-awesome-icon icon="chart-bar" class="text-blue-600 dark:text-blue-400 text-2xl mb-2" />
              <h4 class="font-semibold text-gray-900 dark:text-white">Barres</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Comparaison de valeurs</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <font-awesome-icon icon="circle" class="text-green-600 dark:text-green-400 text-2xl mb-2" />
              <h4 class="font-semibold text-gray-900 dark:text-white">Camembert</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Répartition en %</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <font-awesome-icon icon="chart-line" class="text-purple-600 dark:text-purple-400 text-2xl mb-2" />
              <h4 class="font-semibold text-gray-900 dark:text-white">Courbe</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Tendances temporelles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <font-awesome-icon icon="arrow-left" />
          Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Données pour l'exemple des recettes
const recettesData = [
  { category: 'Recettes Fiscales', value: 125000000, color: '#10b981' },
  { category: 'Recettes Domaniales', value: 85000000, color: '#34d399' },
  { category: 'Subventions État', value: 65000000, color: '#6ee7b7' },
  { category: 'Autres Recettes', value: 45000000, color: '#a7f3d0' },
]

// Données pour l'exemple des dépenses
const depensesData = [
  { category: 'Personnel', value: 95000000, color: '#ef4444' },
  { category: 'Fonctionnement', value: 75000000, color: '#f87171' },
  { category: 'Investissement', value: 85000000, color: '#fca5a5' },
  { category: 'Dette', value: 35000000, color: '#fecaca' },
  { category: 'Autres', value: 30000000, color: '#fee2e2' },
]

// Données pour l'évolution temporelle
const evolutionData = [
  { category: '2020', value: 180000000, color: '#3b82f6' },
  { category: '2021', value: 215000000, color: '#3b82f6' },
  { category: '2022', value: 245000000, color: '#3b82f6' },
  { category: '2023', value: 290000000, color: '#3b82f6' },
  { category: '2024', value: 320000000, color: '#3b82f6' },
]

// SEO Meta
useHead({
  title: 'Démonstration amCharts5 - Graphiques Financiers',
  meta: [
    {
      name: 'description',
      content: 'Page de démonstration de l\'intégration amCharts5 dans l\'application de gestion des collectivités territoriales'
    }
  ]
})
</script>

<style scoped>
/* Ajout de styles personnalisés si nécessaire */
code {
  font-family: 'Courier New', Courier, monospace;
}

pre code {
  display: block;
  white-space: pre;
}
</style>
