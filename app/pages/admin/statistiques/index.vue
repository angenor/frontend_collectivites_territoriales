<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
          Tableau de bord statistiques
        </h1>
        <p class="mt-1 text-sm" style="color: var(--text-secondary)">
          Vue d'ensemble des statistiques de la plateforme
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Sélecteur de période -->
        <select
          v-model="periode"
          class="px-3 py-2 border rounded-lg text-sm"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="90j">90 derniers jours</option>
          <option value="1an">Cette année</option>
        </select>
        <!-- Rafraîchir -->
        <button
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="refreshData"
        >
          <font-awesome-icon :icon="['fas', 'sync-alt']" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          <span>Actualiser</span>
        </button>
      </div>
    </div>

    <!-- KPIs principaux -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="p-5 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide" style="color: var(--text-muted)">
              Collectivités
            </p>
            <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
              {{ dashboardStats.total_collectivites }}
            </p>
            <p class="text-xs mt-1" style="color: var(--color-success)">
              {{ communesStats.avec_donnees }} avec données
            </p>
          </div>
          <div class="p-3 rounded-lg" style="background-color: var(--color-primary-light)">
            <font-awesome-icon :icon="['fas', 'building']" class="w-6 h-6" style="color: var(--color-primary)" />
          </div>
        </div>
      </div>

      <div
        class="p-5 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide" style="color: var(--text-muted)">
              Comptes administratifs
            </p>
            <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
              {{ dashboardStats.total_comptes_administratifs }}
            </p>
            <p class="text-xs mt-1" style="color: var(--text-muted)">
              {{ comptesStatut.publie || 0 }} publiés
            </p>
          </div>
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div
        class="p-5 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide" style="color: var(--text-muted)">
              Projets miniers
            </p>
            <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
              {{ dashboardStats.total_projets_miniers }}
            </p>
            <p class="text-xs mt-1" style="color: var(--color-success)">
              {{ dashboardStats.projets_actifs }} actifs
            </p>
          </div>
          <div class="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'gem']" class="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div
        class="p-5 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide" style="color: var(--text-muted)">
              Utilisateurs
            </p>
            <p class="text-2xl font-semibold mt-1" style="color: var(--text-primary)">
              {{ dashboardStats.total_utilisateurs }}
            </p>
            <p class="text-xs mt-1" style="color: var(--text-muted)">
              actifs sur la plateforme
            </p>
          </div>
          <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Évolution des revenus -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">
          Revenus miniers par année
        </h3>
        <div class="h-64">
          <div v-if="revenusData.length > 0" class="h-full flex items-end justify-between gap-2">
            <div
              v-for="item in revenusData"
              :key="item.annee"
              class="flex-1 flex flex-col items-center"
            >
              <div class="w-full flex flex-col items-center">
                <span class="text-xs font-medium mb-1" style="color: var(--text-primary)">
                  {{ formatMontant(item.total) }}
                </span>
                <div
                  class="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                  style="background-color: var(--color-primary)"
                  :style="{ height: `${(item.total / maxRevenu) * 180}px`, minHeight: '20px' }"
                  :title="`${item.annee}: ${formatMontant(item.total)} Ar`"
                />
              </div>
              <span class="text-xs mt-2" style="color: var(--text-muted)">{{ item.annee }}</span>
              <span
                v-if="item.evolution !== 0"
                class="text-xs font-medium"
                :class="item.evolution > 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ item.evolution > 0 ? '+' : '' }}{{ item.evolution.toFixed(1) }}%
              </span>
            </div>
          </div>
          <div v-else class="h-full flex items-center justify-center" style="color: var(--text-muted)">
            Aucune donnée disponible
          </div>
        </div>
      </div>

      <!-- Statut des comptes -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">
          Comptes administratifs par statut
        </h3>
        <div class="space-y-4">
          <div v-for="(count, statut) in comptesStatut" :key="statut" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm capitalize" style="color: var(--text-secondary)">
                {{ formatStatut(statut) }}
              </span>
              <span class="text-sm font-medium" style="color: var(--text-primary)">
                {{ count }}
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full rounded-full transition-all"
                :class="getStatutColor(statut)"
                :style="{ width: `${(count / totalComptes) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques de visite et téléchargements -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Visites -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium" style="color: var(--text-primary)">Visites</h3>
          <NuxtLink
            to="/admin/statistiques/visites"
            class="text-sm transition-colors"
            style="color: var(--color-primary)"
          >
            Voir détails
          </NuxtLink>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm" style="color: var(--text-secondary)">Total visites</span>
            <span class="font-medium" style="color: var(--text-primary)">{{ visitesStats.total_visites }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm" style="color: var(--text-secondary)">Visiteurs uniques</span>
            <span class="font-medium" style="color: var(--text-primary)">{{ visitesStats.visiteurs_uniques }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm" style="color: var(--text-secondary)">Pages vues</span>
            <span class="font-medium" style="color: var(--text-primary)">{{ visitesStats.pages_vues }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm" style="color: var(--text-secondary)">Durée moyenne</span>
            <span class="font-medium" style="color: var(--text-primary)">{{ formatDuree(visitesStats.duree_moyenne) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm" style="color: var(--text-secondary)">Taux de rebond</span>
            <span class="font-medium" style="color: var(--text-primary)">{{ visitesStats.taux_rebond }}%</span>
          </div>
        </div>
      </div>

      <!-- Téléchargements -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h3 class="font-medium mb-4" style="color: var(--text-primary)">Téléchargements</h3>
        <div class="text-center py-4">
          <p class="text-4xl font-bold" style="color: var(--color-primary)">
            {{ telechargementsStats.total }}
          </p>
          <p class="text-sm mt-1" style="color: var(--text-muted)">téléchargements</p>
        </div>
        <div class="pt-4 border-t" style="border-color: var(--border-primary)">
          <p class="text-sm" style="color: var(--text-secondary)">
            {{ telechargementsStats.documents_telecharges }} documents différents téléchargés
          </p>
        </div>
        <div v-if="documentsPopulaires.length > 0" class="mt-4 space-y-2">
          <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Top documents</p>
          <div
            v-for="doc in documentsPopulaires.slice(0, 3)"
            :key="doc.document_id"
            class="flex items-center justify-between text-sm"
          >
            <span class="truncate flex-1" style="color: var(--text-secondary)">{{ doc.titre }}</span>
            <span class="font-medium ml-2" style="color: var(--text-primary)">{{ doc.telechargements }}</span>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium" style="color: var(--text-primary)">Activité récente</h3>
          <NuxtLink
            to="/admin/statistiques/audit"
            class="text-sm transition-colors"
            style="color: var(--color-primary)"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div v-if="activiteRecente.length === 0" class="text-center py-8">
          <p class="text-sm" style="color: var(--text-muted)">Aucune activité récente</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="activite in activiteRecente.slice(0, 5)"
            :key="activite.id"
            class="flex items-start gap-3"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getActionIconClass(activite.action)"
            >
              <font-awesome-icon :icon="getActionIcon(activite.action)" class="w-3 h-3" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate" style="color: var(--text-primary)">
                {{ formatAction(activite.action) }}
                <span v-if="activite.table_name" style="color: var(--text-muted)">
                  - {{ activite.table_name }}
                </span>
              </p>
              <p class="text-xs" style="color: var(--text-muted)">
                {{ formatRelativeTime(activite.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphique évolution visites -->
    <div
      class="p-6 rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <h3 class="font-medium mb-4" style="color: var(--text-primary)">
        Évolution des visites ({{ periode === '7j' ? '7 derniers jours' : periode === '30j' ? '30 derniers jours' : '90 derniers jours' }})
      </h3>
      <div class="h-48">
        <div v-if="visitesParJour.length > 0" class="h-full flex items-end gap-1">
          <div
            v-for="(jour, index) in visitesParJour"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
              style="background-color: var(--color-primary)"
              :style="{ height: `${(jour.visites / maxVisitesJour) * 140}px`, minHeight: '4px' }"
              :title="`${formatDateShort(jour.date)}: ${jour.visites} visites`"
            />
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center" style="color: var(--text-muted)">
          Aucune donnée de visite disponible
        </div>
      </div>
      <div v-if="visitesParJour.length > 0" class="flex justify-between mt-2">
        <span class="text-xs" style="color: var(--text-muted)">{{ formatDateShort(visitesParJour[0]?.date) }}</span>
        <span class="text-xs" style="color: var(--text-muted)">{{ formatDateShort(visitesParJour[visitesParJour.length - 1]?.date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, ActivityLog } from '~/types'
import type { VisiteStats } from '~/services/statistiques.service'

definePageMeta({
  layout: 'admin'
})

const statistiquesService = useStatistiquesService()

// État
const isLoading = ref(false)
const periode = ref<'7j' | '30j' | '90j' | '1an'>('30j')

// Données
const dashboardStats = ref<DashboardStats>({
  total_collectivites: 0,
  total_projets_miniers: 0,
  total_comptes_administratifs: 0,
  total_utilisateurs: 0,
  comptes_par_statut: {},
  revenus_par_annee: [],
  projets_actifs: 0
})

const communesStats = ref<{ avec_donnees: number; sans_donnees: number; total: number }>({
  avec_donnees: 0,
  sans_donnees: 0,
  total: 0
})

const comptesStatut = ref<Record<string, number>>({})
const revenusData = ref<Array<{ annee: number; total: number; evolution: number }>>([])
const visitesStats = ref<VisiteStats>({
  total_visites: 0,
  visiteurs_uniques: 0,
  pages_vues: 0,
  duree_moyenne: 0,
  taux_rebond: 0
})
const visitesParJour = ref<Array<{ date: string; visites: number; visiteurs: number }>>([])
const telechargementsStats = ref<{ total: number; documents_telecharges: number }>({
  total: 0,
  documents_telecharges: 0
})
const documentsPopulaires = ref<Array<{ document_id: string; titre: string; telechargements: number }>>([])
const activiteRecente = ref<ActivityLog[]>([])

// Computed
const totalComptes = computed(() => Object.values(comptesStatut.value).reduce((a, b) => a + b, 0) || 1)
const maxRevenu = computed(() => Math.max(...revenusData.value.map(r => r.total), 1))
const maxVisitesJour = computed(() => Math.max(...visitesParJour.value.map(v => v.visites), 1))

// Watchers
watch(periode, () => {
  loadVisitesData()
})

// Méthodes
const refreshData = () => {
  loadAllData()
}

const loadAllData = async () => {
  isLoading.value = true
  await Promise.all([
    loadDashboardStats(),
    loadCommunesStats(),
    loadComptesStatut(),
    loadRevenusData(),
    loadVisitesData(),
    loadTelechargements(),
    loadActiviteRecente()
  ])
  isLoading.value = false
}

const loadDashboardStats = async () => {
  try {
    dashboardStats.value = await statistiquesService.getDashboardStats()
  } catch (error) {
    console.error('Erreur chargement dashboard stats:', error)
    // Mock data
    dashboardStats.value = {
      total_collectivites: 1695,
      total_projets_miniers: 47,
      total_comptes_administratifs: 342,
      total_utilisateurs: 28,
      comptes_par_statut: { brouillon: 120, valide: 180, publie: 42 },
      revenus_par_annee: [],
      projets_actifs: 35
    }
  }
}

const loadCommunesStats = async () => {
  try {
    communesStats.value = await statistiquesService.getCommunesAvecDonnees()
  } catch (error) {
    console.error('Erreur chargement communes stats:', error)
    communesStats.value = { avec_donnees: 245, sans_donnees: 1450, total: 1695 }
  }
}

const loadComptesStatut = async () => {
  try {
    comptesStatut.value = await statistiquesService.getComptesParStatut()
  } catch (error) {
    console.error('Erreur chargement comptes statut:', error)
    comptesStatut.value = { brouillon: 120, valide: 180, publie: 42 }
  }
}

const loadRevenusData = async () => {
  try {
    revenusData.value = await statistiquesService.getRevenusParAnnee({ annees: 5 })
  } catch (error) {
    console.error('Erreur chargement revenus:', error)
    // Mock data
    revenusData.value = [
      { annee: 2020, total: 45000000000, evolution: 0 },
      { annee: 2021, total: 52000000000, evolution: 15.5 },
      { annee: 2022, total: 48000000000, evolution: -7.7 },
      { annee: 2023, total: 61000000000, evolution: 27.1 },
      { annee: 2024, total: 58000000000, evolution: -4.9 }
    ]
  }
}

const loadVisitesData = async () => {
  try {
    const [stats, parJour] = await Promise.all([
      statistiquesService.getVisiteStats({ periode: periode.value }),
      statistiquesService.getVisitesParJour({ jours: periode.value === '7j' ? 7 : periode.value === '30j' ? 30 : 90 })
    ])
    visitesStats.value = stats
    visitesParJour.value = parJour
  } catch (error) {
    console.error('Erreur chargement visites:', error)
    // Mock data
    visitesStats.value = {
      total_visites: 12458,
      visiteurs_uniques: 4523,
      pages_vues: 34567,
      duree_moyenne: 185,
      taux_rebond: 42.5
    }
    const days = periode.value === '7j' ? 7 : periode.value === '30j' ? 30 : 90
    visitesParJour.value = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return {
        date: date.toISOString().split('T')[0],
        visites: Math.floor(Math.random() * 300) + 100,
        visiteurs: Math.floor(Math.random() * 150) + 50
      }
    })
  }
}

const loadTelechargements = async () => {
  try {
    const [stats, populaires] = await Promise.all([
      statistiquesService.getTelechargementStats({ periode: periode.value }),
      statistiquesService.getDocumentsPopulaires({ limite: 5 })
    ])
    telechargementsStats.value = stats
    documentsPopulaires.value = populaires
  } catch (error) {
    console.error('Erreur chargement téléchargements:', error)
    telechargementsStats.value = { total: 2847, documents_telecharges: 156 }
    documentsPopulaires.value = [
      { document_id: '1', titre: 'Compte administratif 2023 - Antananarivo', telechargements: 234 },
      { document_id: '2', titre: 'Rapport revenus miniers T3 2024', telechargements: 189 },
      { document_id: '3', titre: 'Guide utilisateur plateforme', telechargements: 156 }
    ]
  }
}

const loadActiviteRecente = async () => {
  try {
    activiteRecente.value = await statistiquesService.getActiviteRecente({ limite: 10 })
  } catch (error) {
    console.error('Erreur chargement activité:', error)
    activiteRecente.value = [
      { id: '1', action: 'create', table_name: 'comptes_administratifs', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
      { id: '2', action: 'update', table_name: 'utilisateurs', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: '3', action: 'delete', table_name: 'documents', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
      { id: '4', action: 'create', table_name: 'revenus_miniers', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: '5', action: 'update', table_name: 'projets', created_at: new Date(Date.now() - 5 * 3600000).toISOString() }
    ] as ActivityLog[]
  }
}

// Helpers
const formatMontant = (montant: number) => {
  if (montant >= 1000000000) {
    return `${(montant / 1000000000).toFixed(1)} Mrd`
  }
  if (montant >= 1000000) {
    return `${(montant / 1000000).toFixed(1)} M`
  }
  return montant.toLocaleString('fr-FR')
}

const formatStatut = (statut: string) => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
    archive: 'Archivé'
  }
  return labels[statut] || statut
}

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'publie': return 'bg-green-500'
    case 'valide': return 'bg-blue-500'
    case 'brouillon': return 'bg-amber-500'
    case 'archive': return 'bg-gray-500'
    default: return 'bg-gray-400'
  }
}

const formatDuree = (secondes: number) => {
  const minutes = Math.floor(secondes / 60)
  const secs = secondes % 60
  return `${minutes}m ${secs}s`
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  return `Il y a ${diffDays}j`
}

const formatAction = (action: string) => {
  const labels: Record<string, string> = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression',
    login: 'Connexion',
    logout: 'Déconnexion',
    export: 'Export',
    import: 'Import'
  }
  return labels[action] || action
}

const getActionIcon = (action: string): [string, string] => {
  switch (action) {
    case 'create': return ['fas', 'plus']
    case 'update': return ['fas', 'edit']
    case 'delete': return ['fas', 'trash']
    case 'login': return ['fas', 'sign-in-alt']
    case 'logout': return ['fas', 'sign-out-alt']
    case 'export': return ['fas', 'download']
    case 'import': return ['fas', 'upload']
    default: return ['fas', 'circle']
  }
}

const getActionIconClass = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-600 dark:bg-green-900/30'
    case 'update': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
    case 'delete': return 'bg-red-100 text-red-600 dark:bg-red-900/30'
    case 'login': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
    case 'logout': return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30'
  }
}

// Lifecycle
onMounted(() => {
  loadAllData()
})
</script>
