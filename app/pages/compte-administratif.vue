<script setup lang="ts">
import { useBudgetTableData, type TableauCompletAPI } from '~/composables/useBudgetTableData'
import type { ColonneDynamique } from '~/types/comptes-administratifs'

// Récupérer les paramètres de la route
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const comptesService = useComptesAdministratifsService()

// Métadonnées de la page
useHead({
  title: 'Compte Administratif - Plateforme de Suivi des Revenus Miniers',
  meta: [
    {
      name: 'description',
      content: 'Visualisation du compte administratif des collectivités territoriales à Madagascar'
    }
  ]
})

// État de la page
const isLoading = ref(true)
const errorMessage = ref('')
const showScrollTop = ref(false)
const activeSheet = ref<'RECETTE' | 'DEPENSES' | 'EQUILIBRE'>('RECETTE')

// Données API
const tableauComplet = ref<TableauCompletAPI | null>(null)
const colonnes = ref<ColonneDynamique[]>([])

// Budget data composable
const budgetData = useBudgetTableData({
  tableauComplet,
  colonnes,
})

// Colonnes pour l'affichage (configuration statique)
const defaultColonnesRecettes = computed(() => [
  { cle: 'budget_primitif', label: 'Budget Primitif', type_donnee: 'montant' as const },
  { cle: 'budget_additionnel', label: 'Budget Additionnel', type_donnee: 'montant' as const },
  { cle: 'modifications', label: 'Modifications +/-', type_donnee: 'montant' as const },
  { cle: 'previsions_definitives', label: 'Prévisions Définitives', type_donnee: 'montant' as const },
  { cle: 'or_admis', label: 'OR Admis', type_donnee: 'montant' as const },
  { cle: 'recouvrement', label: 'Recouvrement', type_donnee: 'montant' as const },
  { cle: 'reste_a_recouvrer', label: 'Reste à Recouvrer', type_donnee: 'montant' as const },
  { cle: 'taux_execution_recette', label: 'Taux Exéc.', type_donnee: 'pourcentage' as const },
])

const defaultColonnesDepenses = computed(() => [
  { cle: 'budget_primitif', label: 'Budget Primitif', type_donnee: 'montant' as const },
  { cle: 'budget_additionnel', label: 'Budget Additionnel', type_donnee: 'montant' as const },
  { cle: 'modifications', label: 'Modifications +/-', type_donnee: 'montant' as const },
  { cle: 'previsions_definitives', label: 'Prévisions Définitives', type_donnee: 'montant' as const },
  { cle: 'engagement', label: 'Engagement', type_donnee: 'montant' as const },
  { cle: 'mandat_admis', label: 'Mandat Admis', type_donnee: 'montant' as const },
  { cle: 'paiement', label: 'Paiement', type_donnee: 'montant' as const },
  { cle: 'reste_a_payer', label: 'Reste à Payer', type_donnee: 'montant' as const },
  { cle: 'taux_execution_depense', label: 'Taux Exéc.', type_donnee: 'pourcentage' as const },
])

// Charger les données au montage
const loadData = async () => {
  const communeId = route.query.commune as string
  const annee = parseInt(route.query.annee as string)

  if (!communeId || !annee) {
    errorMessage.value = 'Paramètres de recherche manquants'
    isLoading.value = false
    return
  }

  try {
    // Charger les colonnes dynamiques
    colonnes.value = await comptesService.getColonnes()

    // Charger le tableau complet
    const apiBaseUrl = config.public.apiBaseUrl
    const response = await $fetch<TableauCompletAPI>(`${apiBaseUrl}/api/v1/tableaux`, {
      params: {
        commune_id: communeId,
        exercice_annee: annee,
      },
    })
    tableauComplet.value = response

    if (!response) {
      errorMessage.value = 'Aucun compte administratif trouvé pour cette commune et cette année.'
    }
  } catch (err: any) {
    console.error('Erreur lors du chargement des données:', err)
    errorMessage.value = err.message || 'Erreur lors du chargement des données'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Gestion du téléchargement
const handleTelecharger = (format: 'excel' | 'word') => {
  const fileName = `compte_administratif_${tableauComplet.value?.commune_nom}_${tableauComplet.value?.exercice_annee}.${format === 'excel' ? 'xlsx' : 'docx'}`
  alert(`Téléchargement du fichier: ${fileName}\n\nNote: La génération automatique des fichiers Excel/Word sera implémentée prochainement.`)
}

// Retour à l'accueil
const retourAccueil = () => {
  router.push('/')
}

// Gestion du scroll to top
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Computed pour les informations de base
const communeNom = computed(() => tableauComplet.value?.commune_nom || 'N/A')
const regionNom = computed(() => tableauComplet.value?.region_nom || 'N/A')
const provinceNom = computed(() => tableauComplet.value?.province_nom || 'N/A')
const exerciceAnnee = computed(() => tableauComplet.value?.exercice_annee || 0)

// Données pour les graphiques - Recettes vs Dépenses
const chartRecettesVsDepenses = computed(() => {
  if (!tableauComplet.value) return []

  return [
    { category: 'Recettes', value: budgetData.totaux.value.recettes, color: '#10b981' },
    { category: 'Dépenses', value: budgetData.totaux.value.depenses, color: '#ef4444' }
  ]
})

// Répartition des Recettes
const chartRepartitionRecettes = computed(() => {
  if (!tableauComplet.value) return []

  const lignes = budgetData.previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
  return lignes.map((ligne, index) => ({
    category: ligne.intitule,
    value: ligne.recouvrement || 0,
    color: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'][index % 5]
  }))
})

// Répartition des Dépenses
const chartRepartitionDepenses = computed(() => {
  if (!tableauComplet.value) return []

  const lignes = budgetData.previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
  return lignes.map((ligne, index) => ({
    category: ligne.intitule,
    value: ligne.paiement || 0,
    color: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'][index % 5]
  }))
})

// Budget vs Réalisation
const chartBudgetVsRealisation = computed(() => {
  if (!tableauComplet.value) return []

  const recettesBudget = budgetData.totauxRecettes.value.general.previsions_definitives || 0
  const recettesRealisation = budgetData.totauxRecettes.value.general.recouvrement || 0
  const depensesBudget = budgetData.totauxDepenses.value.general.previsions_definitives || 0
  const depensesRealisation = budgetData.totauxDepenses.value.general.paiement || 0

  return [
    { category: 'Recettes Budgétées', value: recettesBudget, color: '#34d399' },
    { category: 'Recettes Réalisées', value: recettesRealisation, color: '#10b981' },
    { category: 'Dépenses Budgétées', value: depensesBudget, color: '#fca5a5' },
    { category: 'Dépenses Réalisées', value: depensesRealisation, color: '#ef4444' }
  ]
})

// Taux d'exécution
const chartTauxExecution = computed(() => {
  if (!tableauComplet.value) return []

  const lignes = budgetData.previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
  return lignes.map((ligne) => {
    const taux = ligne.taux_execution_recette ? ligne.taux_execution_recette * 100 : 0
    return {
      category: ligne.intitule,
      value: Math.round(taux),
      color: taux >= 90 ? '#10b981' : taux >= 70 ? '#f59e0b' : '#ef4444'
    }
  })
})

// Formater la date
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return 'Non disponible'
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return date.toLocaleDateString('fr-FR', options)
}

// Formater les nombres
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec bouton retour, Logo et ThemeToggle -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          @click="retourAccueil"
          class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium group"
        >
          <font-awesome-icon icon="arrow-left" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'accueil</span>
        </button>

        <!-- Logo centré -->
        <div class="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <img
            src="/images/logos/logo_fond_bleu_texte_blanc.jpeg"
            alt="Logo PCQVP & TI Madagascar"
            class="h-12 w-auto object-contain dark:hidden"
          />
          <img
            src="/images/logos/logo_fond_noire_texte_blanc.jpeg"
            alt="Logo PCQVP & TI Madagascar"
            class="h-12 w-auto object-contain hidden dark:block"
          />
        </div>

        <div class="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section v-if="tableauComplet && !isLoading" class="relative min-h-[400px] flex items-center overflow-hidden pb-20">
      <!-- Image de fond -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/hero_background.jpg"
          alt="Exploitation minière à Madagascar"
          class="w-full h-full object-cover brightness-90 dark:brightness-75"
        />
      </div>

      <!-- Contenu de la hero section -->
      <div class="relative z-10 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="flex flex-col items-center gap-4">
            <!-- Titre -->
            <div class="w-auto bg-white/0 dark:bg-gray-900/0 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50">
              <h1 class="text-4xl sm:text-5xl font-bold text-white whitespace-nowrap flex items-center gap-4">
                <font-awesome-icon icon="landmark" class="text-blue-300 dark:text-blue-400" />
                Compte Administratif {{ exerciceAnnee }}
              </h1>
            </div>

            <!-- Breadcrumb -->
            <div class="w-auto bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl px-6 py-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50">
              <div class="flex flex-wrap justify-center items-center gap-2 text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                <font-awesome-icon icon="map-marker-alt" class="text-red-500 dark:text-red-400" />
                <span class="font-semibold">{{ provinceNom }}</span>
                <font-awesome-icon icon="chevron-right" class="text-sm text-gray-400" />
                <span class="font-semibold">{{ regionNom }}</span>
                <font-awesome-icon icon="chevron-right" class="text-sm text-gray-400" />
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ communeNom }}</span>
              </div>
            </div>

            <!-- Badges d'information -->
            <div class="flex flex-wrap justify-center gap-4 mt-2">
              <div class="bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/50 dark:border-gray-700/50">
                <span class="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                  <font-awesome-icon icon="calendar" class="text-purple-600 dark:text-purple-400" />
                  Année fiscale: {{ exerciceAnnee }}
                </span>
              </div>
              <div class="bg-blue-500/90 dark:bg-blue-600/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-blue-400/50 dark:border-blue-500/50">
                <span class="text-white font-medium flex items-center gap-2">
                  <font-awesome-icon icon="clock" class="text-blue-100" />
                  Généré le: {{ formatDate(tableauComplet?.date_generation) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 space-y-8">
      <!-- Indicateur de chargement -->
      <Transition name="fade">
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div class="relative inline-block">
              <font-awesome-icon icon="spinner" class="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <p class="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg flex items-center justify-center gap-2">
              <font-awesome-icon icon="chart-bar" class="text-blue-600 dark:text-blue-400" />
              Chargement des données...
            </p>
            <p class="mt-2 text-gray-500 dark:text-gray-400 text-sm">Veuillez patienter</p>
          </div>
        </div>
      </Transition>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="errorMessage && !isLoading" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 dark:border-red-400 p-6 rounded-lg shadow-lg">
          <div class="flex items-start gap-4">
            <div class="bg-red-500 dark:bg-red-600 p-3 rounded-lg shadow-md">
              <font-awesome-icon icon="exclamation-triangle" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-red-800 dark:text-red-300 font-bold text-lg flex items-center gap-2 mb-2">
                <font-awesome-icon icon="times-circle" class="text-red-600 dark:text-red-400" />
                Aucune donnée disponible
              </h3>
              <p class="text-red-700 dark:text-red-400 text-sm leading-relaxed">{{ errorMessage }}</p>
              <button
                @click="retourAccueil"
                class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Section principale avec données réelles -->
      <Transition name="slide-up">
        <section v-if="tableauComplet && !isLoading" class="relative -mt-16 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-3xl p-6 sm:p-8 lg:p-10 transition-all duration-200 border border-gray-100 dark:border-gray-700">

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-lg">
                  <font-awesome-icon icon="arrow-trend-up" class="w-5 h-5 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recettes</span>
              </div>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                {{ formatNumber(budgetData.totaux.value.recettes) }} Ar
              </p>
            </div>

            <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-lg">
                  <font-awesome-icon icon="arrow-trend-down" class="w-5 h-5 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Dépenses</span>
              </div>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
                {{ formatNumber(budgetData.totaux.value.depenses) }} Ar
              </p>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                  <font-awesome-icon icon="scale-balanced" class="w-5 h-5 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Solde</span>
              </div>
              <p class="text-2xl font-bold font-mono" :class="budgetData.totaux.value.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ formatNumber(budgetData.totaux.value.solde) }} Ar
              </p>
            </div>
          </div>

          <!-- Sélecteur de feuille -->
          <div class="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6 w-fit">
            <button
              v-for="sheet in [
                { key: 'RECETTE', label: 'Recettes', icon: 'arrow-trend-up', color: 'green' },
                { key: 'DEPENSES', label: 'Dépenses', icon: 'arrow-trend-down', color: 'red' },
                { key: 'EQUILIBRE', label: 'Équilibre', icon: 'scale-balanced', color: 'blue' },
              ]"
              :key="sheet.key"
              @click="activeSheet = sheet.key as any"
              class="flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium"
              :class="activeSheet === sheet.key
                ? `bg-${sheet.color}-600 text-white shadow-lg`
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            >
              <font-awesome-icon :icon="['fas', sheet.icon]" class="w-4 h-4" />
              {{ sheet.label }}
            </button>
          </div>

          <!-- Tableau RECETTES -->
          <div v-if="activeSheet === 'RECETTE'" class="space-y-8">
            <!-- RECETTES DE FONCTIONNEMENT -->
            <PublicBudgetSectionTableReadOnly
              title="RECETTES DE FONCTIONNEMENT"
              :subtitle="`${communeNom} - Exercice ${exerciceAnnee}`"
              icon="arrow-trend-up"
              color-theme="green"
              :lignes="budgetData.previewRecettesFonctionnement.value"
              :colonnes="defaultColonnesRecettes"
              :totaux="budgetData.totauxRecettes.value.fonctionnement"
              total-label="TOTAL RECETTES FONCTIONNEMENT"
            />

            <!-- RECETTES D'INVESTISSEMENT -->
            <PublicBudgetSectionTableReadOnly
              title="RECETTES D'INVESTISSEMENT"
              :subtitle="`${communeNom} - Exercice ${exerciceAnnee}`"
              icon="landmark"
              color-theme="teal"
              :lignes="budgetData.previewRecettesInvestissement.value"
              :colonnes="defaultColonnesRecettes"
              :totaux="budgetData.totauxRecettes.value.investissement"
              total-label="TOTAL RECETTES INVESTISSEMENT"
            />

            <!-- TOTAL GÉNÉRAL RECETTES -->
            <div class="bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl p-4 text-white">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold">TOTAL GÉNÉRAL RECETTES</span>
                <span class="text-2xl font-bold font-mono">{{ formatNumber(budgetData.totauxRecettes.value.general.recouvrement) }} Ar</span>
              </div>
              <div class="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span class="opacity-75">Budget Primitif</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxRecettes.value.general.budget_primitif) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Prévisions Définitives</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxRecettes.value.general.previsions_definitives) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Reste à Recouvrer</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxRecettes.value.general.reste_a_recouvrer) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Taux d'Exécution</span>
                  <p class="font-mono font-semibold">{{ ((budgetData.totauxRecettes.value.general.taux_execution_recette || 0) * 100).toFixed(1) }}%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tableau DÉPENSES -->
          <div v-else-if="activeSheet === 'DEPENSES'" class="space-y-8">
            <!-- DÉPENSES DE FONCTIONNEMENT -->
            <PublicBudgetSectionTableReadOnly
              title="DÉPENSES DE FONCTIONNEMENT"
              :subtitle="`${communeNom} - Exercice ${exerciceAnnee}`"
              icon="arrow-trend-down"
              color-theme="red"
              :lignes="budgetData.previewDepensesFonctionnement.value"
              :colonnes="defaultColonnesDepenses"
              :totaux="budgetData.totauxDepenses.value.fonctionnement"
              total-label="TOTAL DÉPENSES FONCTIONNEMENT"
            />

            <!-- DÉPENSES D'INVESTISSEMENT -->
            <PublicBudgetSectionTableReadOnly
              title="DÉPENSES D'INVESTISSEMENT"
              :subtitle="`${communeNom} - Exercice ${exerciceAnnee}`"
              icon="building"
              color-theme="orange"
              :lignes="budgetData.previewDepensesInvestissement.value"
              :colonnes="defaultColonnesDepenses"
              :totaux="budgetData.totauxDepenses.value.investissement"
              total-label="TOTAL DÉPENSES INVESTISSEMENT"
            />

            <!-- TOTAL GÉNÉRAL DÉPENSES -->
            <div class="bg-gradient-to-r from-red-700 to-rose-700 rounded-xl p-4 text-white">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold">TOTAL GÉNÉRAL DÉPENSES</span>
                <span class="text-2xl font-bold font-mono">{{ formatNumber(budgetData.totauxDepenses.value.general.paiement) }} Ar</span>
              </div>
              <div class="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span class="opacity-75">Budget Primitif</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxDepenses.value.general.budget_primitif) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Prévisions Définitives</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxDepenses.value.general.previsions_definitives) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Reste à Payer</span>
                  <p class="font-mono font-semibold">{{ formatNumber(budgetData.totauxDepenses.value.general.reste_a_payer) }}</p>
                </div>
                <div>
                  <span class="opacity-75">Taux d'Exécution</span>
                  <p class="font-mono font-semibold">{{ ((budgetData.totauxDepenses.value.general.taux_execution_depense || 0) * 100).toFixed(1) }}%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tableau ÉQUILIBRE -->
          <div v-else class="space-y-8">
            <!-- Équilibre Fonctionnement -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'scale-balanced']" class="text-blue-600 dark:text-blue-400" />
                Équilibre de Fonctionnement
              </h3>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Recettes</p>
                  <p class="text-xl font-bold text-green-600 dark:text-green-400 font-mono">
                    {{ formatNumber(budgetData.totauxEquilibre.value.fonctionnement.recettes.recouvrement) }} Ar
                  </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Dépenses</p>
                  <p class="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
                    {{ formatNumber(budgetData.totauxEquilibre.value.fonctionnement.depenses.paiement) }} Ar
                  </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Solde</p>
                  <p class="text-xl font-bold font-mono" :class="budgetData.totauxEquilibre.value.fonctionnement.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ formatNumber(budgetData.totauxEquilibre.value.fonctionnement.solde) }} Ar
                  </p>
                </div>
              </div>
            </div>

            <!-- Équilibre Investissement -->
            <div class="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'building']" class="text-purple-600 dark:text-purple-400" />
                Équilibre d'Investissement
              </h3>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Recettes</p>
                  <p class="text-xl font-bold text-green-600 dark:text-green-400 font-mono">
                    {{ formatNumber(budgetData.totauxEquilibre.value.investissement.recettes.recouvrement) }} Ar
                  </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Dépenses</p>
                  <p class="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
                    {{ formatNumber(budgetData.totauxEquilibre.value.investissement.depenses.paiement) }} Ar
                  </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Solde</p>
                  <p class="text-xl font-bold font-mono" :class="budgetData.totauxEquilibre.value.investissement.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ formatNumber(budgetData.totauxEquilibre.value.investissement.solde) }} Ar
                  </p>
                </div>
              </div>
            </div>

            <!-- Équilibre Général -->
            <div class="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-6 text-white">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'calculator']" class="text-blue-200" />
                ÉQUILIBRE GÉNÉRAL
              </h3>
              <div class="grid md:grid-cols-3 gap-6">
                <div>
                  <p class="text-sm opacity-75">Total Recettes</p>
                  <p class="text-2xl font-bold font-mono">{{ formatNumber(budgetData.totauxEquilibre.value.general.recettes) }} Ar</p>
                </div>
                <div>
                  <p class="text-sm opacity-75">Total Dépenses</p>
                  <p class="text-2xl font-bold font-mono">{{ formatNumber(budgetData.totauxEquilibre.value.general.depenses) }} Ar</p>
                </div>
                <div>
                  <p class="text-sm opacity-75">Solde Global</p>
                  <p class="text-2xl font-bold font-mono" :class="budgetData.totauxEquilibre.value.general.solde >= 0 ? 'text-green-300' : 'text-red-300'">
                    {{ formatNumber(budgetData.totauxEquilibre.value.general.solde) }} Ar
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Graphiques -->
          <div v-if="tableauComplet" class="mt-12 space-y-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                <div class="bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 p-3 rounded-xl shadow-lg">
                  <font-awesome-icon icon="chart-line" class="w-7 h-7 text-white" />
                </div>
                <span>Analyses Graphiques</span>
              </h2>
              <p class="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Visualisation interactive des données financières du compte administratif {{ exerciceAnnee }}
              </p>
            </div>

            <!-- Graphique 1: Recettes vs Dépenses -->
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                  <font-awesome-icon icon="chart-bar" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Vue d'ensemble Budgétaire</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Comparaison Recettes vs Dépenses</p>
                </div>
              </div>
              <FinancialChart
                title="Recettes vs Dépenses"
                subtitle="Équilibre budgétaire global"
                :data="chartRecettesVsDepenses"
                initialChartType="bar"
              />
            </div>

            <!-- Graphiques Répartition -->
            <div class="grid lg:grid-cols-2 gap-8">
              <!-- Répartition des Recettes -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                    <font-awesome-icon icon="arrow-up" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Répartition des Recettes</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Par catégorie budgétaire</p>
                  </div>
                </div>
                <FinancialChart
                  title="Sources de Recettes"
                  subtitle="Distribution par catégorie"
                  :data="chartRepartitionRecettes"
                  initialChartType="pie"
                />
              </div>

              <!-- Répartition des Dépenses -->
              <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-gradient-to-r from-red-600 to-rose-600 p-2 rounded-lg">
                    <font-awesome-icon icon="arrow-down" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Répartition des Dépenses</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Par catégorie budgétaire</p>
                  </div>
                </div>
                <FinancialChart
                  title="Postes de Dépenses"
                  subtitle="Distribution par catégorie"
                  :data="chartRepartitionDepenses"
                  initialChartType="pie"
                />
              </div>
            </div>

            <!-- Budget vs Réalisation -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                  <font-awesome-icon icon="chart-line" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Budget vs Réalisation</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Prévisions budgétaires et exécution réelle</p>
                </div>
              </div>
              <FinancialChart
                title="Performance Budgétaire"
                subtitle="Comparaison Budget/Réalisation"
                :data="chartBudgetVsRealisation"
                initialChartType="bar"
              />
            </div>

            <!-- Taux d'exécution -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-700">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-lg">
                  <font-awesome-icon icon="chart-bar" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Taux d'Exécution des Recettes</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Pourcentage de réalisation par rapport aux prévisions</p>
                </div>
              </div>
              <FinancialChart
                title="Taux d'Exécution (%)"
                subtitle="Performance de recouvrement des recettes"
                :data="chartTauxExecution"
                initialChartType="bar"
              />
              <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 border border-green-300 dark:border-green-700">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-green-600"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">≥ 90%</span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Excellente performance</p>
                </div>
                <div class="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-300 dark:border-amber-700">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-amber-600"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">70-89%</span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Performance satisfaisante</p>
                </div>
                <div class="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 border border-red-300 dark:border-red-700">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-600"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">&lt; 70%</span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">À améliorer</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section téléchargement -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">Télécharger les données</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Téléchargez le compte administratif complet
                </p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="handleTelecharger('excel')"
                  class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg"
                >
                  <font-awesome-icon icon="file-excel" class="w-4 h-4" />
                  Excel
                </button>
                <button
                  @click="handleTelecharger('word')"
                  class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg"
                >
                  <font-awesome-icon icon="file-word" class="w-4 h-4" />
                  Word
                </button>
              </div>
            </div>
          </div>
        </section>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 dark:from-gray-950 dark:via-black dark:to-gray-950 text-white mt-16 print:hidden transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-blue-600 p-2 rounded-lg">
                <font-awesome-icon icon="info-circle" class="w-4 h-4" />
              </div>
              À propos
            </h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm leading-relaxed flex items-start gap-2">
              <font-awesome-icon icon="industry" class="text-blue-400 mt-1 flex-shrink-0" />
              <span>
                Projet "Minerais critiques : justice fiscale et redistribution de revenus"
                mené par PCQVP Madagascar et TI Madagascar.
              </span>
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-green-600 p-2 rounded-lg">
                <font-awesome-icon icon="envelope" class="w-4 h-4" />
              </div>
              Contact
            </h3>
            <div class="space-y-2 text-gray-300 dark:text-gray-400 text-sm">
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="envelope" class="text-green-400" />
                vramaherison@transparency.mg
              </p>
              <p class="flex items-start gap-2">
                <font-awesome-icon icon="building" class="text-green-400 mt-1 flex-shrink-0" />
                <span>Transparency International - Initiative Madagascar</span>
              </p>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-purple-600 p-2 rounded-lg">
                <font-awesome-icon icon="globe" class="w-4 h-4" />
              </div>
              Ressources
            </h3>
            <div class="space-y-2 text-gray-300 dark:text-gray-400 text-sm">
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="chart-bar" class="text-purple-400" />
                Plateforme de suivi des revenus miniers
              </p>
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="landmark" class="text-purple-400" />
                Collectivités Territoriales de Madagascar
              </p>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p class="flex items-center justify-center gap-2">
            <font-awesome-icon icon="heart" class="text-red-500" />
            &copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>

    <!-- Bouton scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all print:hidden z-50 group"
        aria-label="Retour en haut"
      >
        <font-awesome-icon icon="arrow-up" class="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* Print styles */
@media print {
  header,
  footer,
  .print\:hidden {
    display: none !important;
  }

  body {
    background: white;
  }

  main {
    max-width: 100%;
    padding: 0;
  }
}
</style>
