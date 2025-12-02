<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Tableau de Bord
      </h1>
      <p class="mt-2 text-[var(--text-secondary)]">
        Bienvenue sur l'espace d'administration de la plateforme de suivi des revenus miniers.
      </p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-[var(--text-secondary)] mb-1">{{ kpi.label }}</p>
            <p class="text-2xl font-bold text-[var(--text-primary)] font-mono">
              {{ kpi.value }}
            </p>
            <p
              v-if="kpi.change"
              :class="[
                'mt-2 text-xs font-medium flex items-center gap-1',
                kpi.changeType === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
              ]"
            >
              <font-awesome-icon :icon="['fas', kpi.changeType === 'up' ? 'arrow-up' : 'arrow-down']" />
              <span>{{ kpi.change }} vs mois dernier</span>
            </p>
          </div>
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              kpi.iconBg
            ]"
          >
            <font-awesome-icon :icon="kpi.icon" :class="kpi.iconColor" class="text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
            Activité Récente
          </h2>
          <NuxtLink
            to="/admin/statistiques/audit"
            class="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Voir tout
          </NuxtLink>
        </div>

        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-start gap-4 pb-4 border-b border-[var(--border-light)] last:border-0 last:pb-0"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                activity.iconBg
              ]"
            >
              <font-awesome-icon :icon="activity.icon" :class="activity.iconColor" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-[var(--text-primary)]">{{ activity.description }}</p>
              <p class="text-xs text-[var(--text-muted)] mt-1">
                {{ activity.user }} • {{ activity.time }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
        <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
          Actions Rapides
        </h2>

        <div class="space-y-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)] transition-all group"
          >
            <div class="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
              <font-awesome-icon :icon="action.icon" />
            </div>
            <div>
              <p class="text-sm font-medium text-[var(--text-primary)]">{{ action.label }}</p>
              <p class="text-xs text-[var(--text-muted)]">{{ action.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Welcome message for new users -->
    <div class="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-700)] rounded-xl p-6 text-white">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <font-awesome-icon :icon="['fas', 'rocket']" class="text-3xl" />
        </div>
        <div>
          <h3 class="font-heading text-xl font-bold uppercase tracking-wide mb-1">
            Bienvenue, {{ user?.prenom || user?.nom || 'Administrateur' }} !
          </h3>
          <p class="text-white/80">
            Explorez le tableau de bord pour suivre les revenus miniers des collectivités territoriales de Madagascar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { user } = useAuth()

// KPI data (placeholder - would come from API)
const kpis = [
  {
    label: 'Communes',
    value: '1,695',
    change: '+12',
    changeType: 'up',
    icon: ['fas', 'city'],
    iconBg: 'bg-[var(--color-primary-50)]',
    iconColor: 'text-[var(--color-primary)]',
  },
  {
    label: 'Total Recettes',
    value: '2.4 Mrd Ar',
    change: '+8.3%',
    changeType: 'up',
    icon: ['fas', 'arrow-trend-up'],
    iconBg: 'bg-[var(--color-success-light)]',
    iconColor: 'text-[var(--color-success)]',
  },
  {
    label: 'Total Dépenses',
    value: '1.9 Mrd Ar',
    change: '-2.1%',
    changeType: 'down',
    icon: ['fas', 'arrow-trend-down'],
    iconBg: 'bg-[var(--color-error-light)]',
    iconColor: 'text-[var(--color-error)]',
  },
  {
    label: 'Projets Miniers',
    value: '47',
    change: '+3',
    changeType: 'up',
    icon: ['fas', 'gem'],
    iconBg: 'bg-[var(--color-warning-light)]',
    iconColor: 'text-[var(--color-warning)]',
  },
]

// Recent activities (placeholder)
const recentActivities = [
  {
    id: 1,
    description: 'Nouvelle recette ajoutée pour Antananarivo-Renivohitra',
    user: 'Jean Rakoto',
    time: 'Il y a 5 min',
    icon: ['fas', 'plus'],
    iconBg: 'bg-[var(--color-success-light)]',
    iconColor: 'text-[var(--color-success)]',
  },
  {
    id: 2,
    description: 'Compte administratif 2024 publié pour Toamasina I',
    user: 'Marie Rabe',
    time: 'Il y a 1 heure',
    icon: ['fas', 'check'],
    iconBg: 'bg-[var(--color-primary-50)]',
    iconColor: 'text-[var(--color-primary)]',
  },
  {
    id: 3,
    description: 'Import de données Excel - 25 communes',
    user: 'Admin',
    time: 'Il y a 2 heures',
    icon: ['fas', 'file-import'],
    iconBg: 'bg-[var(--color-warning-light)]',
    iconColor: 'text-[var(--color-warning)]',
  },
  {
    id: 4,
    description: 'Nouvel utilisateur créé: editeur@ti-mg.org',
    user: 'Admin',
    time: 'Hier',
    icon: ['fas', 'user-plus'],
    iconBg: 'bg-[var(--color-info-light)]',
    iconColor: 'text-[var(--color-info)]',
  },
]

// Quick actions
const quickActions = [
  {
    to: '/admin/import',
    label: 'Importer des données',
    description: 'Fichier Excel ou CSV',
    icon: ['fas', 'file-import'],
  },
  {
    to: '/admin/comptes-administratifs',
    label: 'Comptes administratifs',
    description: 'Gérer les comptes',
    icon: ['fas', 'file-invoice-dollar'],
  },
  {
    to: '/admin/utilisateurs',
    label: 'Utilisateurs',
    description: 'Gérer les accès',
    icon: ['fas', 'users'],
  },
]
</script>
