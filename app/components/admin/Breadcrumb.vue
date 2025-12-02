<template>
  <nav class="hidden md:flex items-center text-sm" aria-label="Breadcrumb">
    <ol class="flex items-center gap-1">
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
        <!-- Separator -->
        <font-awesome-icon
          v-if="index > 0"
          :icon="['fas', 'chevron-right']"
          class="w-3 h-3 mx-2 text-[var(--text-muted)]"
        />

        <!-- Link or current -->
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.path"
          class="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-[var(--text-primary)]"
        >
          {{ crumb.label }}
        </span>
      </li>
    </ol>
  </nav>

  <!-- Mobile: Current page only -->
  <div class="md:hidden">
    <h1 class="font-heading font-bold text-lg text-[var(--text-primary)] uppercase tracking-wide">
      {{ currentPageTitle }}
    </h1>
  </div>
</template>

<script setup lang="ts">
interface Breadcrumb {
  path: string
  label: string
}

const route = useRoute()

// Route label mapping
const routeLabels: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/comptes-administratifs': 'Comptes Administratifs',
  '/admin/recettes': 'Recettes',
  '/admin/depenses': 'Dépenses',
  '/admin/exercices': 'Exercices',
  '/admin/import': 'Import',
  '/admin/geo': 'Géographie',
  '/admin/geo/provinces': 'Provinces',
  '/admin/geo/regions': 'Régions',
  '/admin/geo/communes': 'Communes',
  '/admin/projets': 'Projets',
  '/admin/projets/societes': 'Sociétés',
  '/admin/revenus': 'Revenus Miniers',
  '/admin/cms': 'CMS',
  '/admin/cms/pages': 'Pages',
  '/admin/cms/sections': 'Sections',
  '/admin/documents': 'Documents',
  '/admin/utilisateurs': 'Utilisateurs',
  '/admin/newsletter': 'Newsletter',
  '/admin/statistiques': 'Statistiques',
  '/admin/statistiques/visites': 'Visites',
  '/admin/statistiques/audit': 'Journal d\'audit',
  '/admin/parametres': 'Paramètres',
  '/admin/profil': 'Mon Profil',
}

// Build breadcrumbs from current path
const breadcrumbs = computed<Breadcrumb[]>(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = []

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Skip if it's a dynamic segment (starts with number or is a UUID)
    const isDynamic = /^[0-9a-f-]+$/i.test(segment)

    if (isDynamic) {
      // For dynamic routes, try to get a meaningful label
      const label = route.meta?.title as string || 'Détail'
      crumbs.push({ path: currentPath, label })
    } else {
      const label = routeLabels[currentPath] || formatLabel(segment)
      crumbs.push({ path: currentPath, label })
    }
  })

  return crumbs
})

// Current page title for mobile
const currentPageTitle = computed(() => {
  const lastCrumb = breadcrumbs.value[breadcrumbs.value.length - 1]
  return lastCrumb?.label || 'Admin'
})

// Format segment to label (fallback)
const formatLabel = (segment: string): string => {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>
