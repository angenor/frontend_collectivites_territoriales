<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Pages CMS
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérer les pages des comptes administratifs
        </p>
      </div>
      <NuxtLink to="/admin/cms/pages/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouvelle page
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Commune filter -->
        <UiFormSelect
          v-model="filters.commune_id"
          label=""
          :options="communeOptions"
          placeholder="Toutes les communes"
        />

        <!-- Exercice filter -->
        <UiFormSelect
          v-model="filters.exercice_id"
          label=""
          :options="exerciceOptions"
          placeholder="Tous les exercices"
        />

        <!-- Status filter -->
        <UiFormSelect
          v-model="filters.statut"
          label=""
          :options="statutOptions"
          placeholder="Tous les statuts"
        />

        <!-- Reset -->
        <div class="flex items-end">
          <UiButton variant="ghost" @click="resetFilters" :icon="['fas', 'rotate-left']">
            Réinitialiser
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'file-lines']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Total pages</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="text-emerald-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Publiées</p>
            <p class="text-xl font-bold text-emerald-600">{{ stats.publiees }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'edit']" class="text-amber-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Brouillons</p>
            <p class="text-xl font-bold text-amber-600">{{ stats.brouillons }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'box-archive']" class="text-gray-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Archivées</p>
            <p class="text-xl font-bold text-gray-600">{{ stats.archivees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pages list -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <div v-else-if="pages.length === 0" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-12 text-center">
      <font-awesome-icon :icon="['fas', 'file-lines']" class="text-4xl text-[var(--text-muted)] mb-4" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucune page trouvée</h3>
      <p class="text-[var(--text-secondary)] mb-4">Créez votre première page CMS pour un compte administratif.</p>
      <NuxtLink to="/admin/cms/pages/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Créer une page
        </UiButton>
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="page in pagesEnrichies"
        :key="page.id"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 hover:border-[var(--color-primary)]/30 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <NuxtLink
                :to="`/admin/cms/pages/${page.id}`"
                class="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ page.titre || `Page ${page.communeNom} - ${page.exerciceAnnee}` }}
              </NuxtLink>
              <UiBadge :variant="getStatutVariant(page.statut)">
                {{ getStatutLabel(page.statut) }}
              </UiBadge>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              <span class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'city']" class="w-3 h-3" />
                {{ page.communeNom }}
              </span>
              <span class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'calendar']" class="w-3 h-3" />
                Exercice {{ page.exerciceAnnee }}
              </span>
              <span class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'clock']" class="w-3 h-3" />
                Mis à jour le {{ formatDate(page.date_mise_a_jour) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="page.statut === 'brouillon'"
              @click="publierPage(page)"
              class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors cursor-pointer"
              title="Publier"
            >
              <font-awesome-icon :icon="['fas', 'globe']" />
            </button>
            <button
              v-if="page.statut === 'publie'"
              @click="archiverPage(page)"
              class="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              title="Archiver"
            >
              <font-awesome-icon :icon="['fas', 'box-archive']" />
            </button>
            <NuxtLink
              :to="`/admin/cms/pages/${page.id}`"
              class="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
              title="Éditer"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </NuxtLink>
            <button
              @click="confirmDelete(page)"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
              title="Supprimer"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <UiModal v-model="showDeleteModal" title="Supprimer la page" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la page
        <strong>{{ pageToDelete?.titre || 'cette page' }}</strong> ?
        Cette action est irréversible et supprimera toutes les sections associées.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="showDeleteModal = false">
            Annuler
          </UiButton>
          <UiButton variant="danger" @click="deletePage" :loading="deleting">
            Supprimer
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PageCMSList } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'
import { useGeoService } from '~/services/geo.service'
import { useExercicesService } from '~/services/exercices.service'
import type { Commune } from '~/types/collectivites'
import type { ExerciceList } from '~/services/exercices.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const cmsService = useCMSService()
const geoService = useGeoService()
const exercicesService = useExercicesService()
const toast = useAppToast()

// State
const pages = ref<PageCMSList[]>([])
const communes = ref<Array<{ id: number; nom: string }>>([])
const exercices = ref<ExerciceList[]>([])
const loading = ref(true)

// Filters
const filters = ref({
  statut: '' as string,
  commune_id: '' as string,
  exercice_id: '' as string,
})

// Delete modal
const showDeleteModal = ref(false)
const pageToDelete = ref<PageCMSList | null>(null)
const deleting = ref(false)

// Stats (computed from full list)
const stats = computed(() => ({
  total: pages.value.length,
  publiees: pages.value.filter(p => p.statut === 'publie').length,
  brouillons: pages.value.filter(p => p.statut === 'brouillon').length,
  archivees: pages.value.filter(p => p.statut === 'archive').length,
}))

// Pages enrichies avec nom commune et année exercice
const pagesEnrichies = computed(() =>
  pages.value.map(p => ({
    ...p,
    communeNom: communes.value.find(c => c.id === p.commune_id)?.nom || `Commune #${p.commune_id}`,
    exerciceAnnee: exercices.value.find(e => e.id === p.exercice_id)?.annee || p.exercice_id,
  }))
)

// Options pour les filtres
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publie', label: 'Publiée' },
  { value: 'archive', label: 'Archivée' },
]

const communeOptions = computed(() => [
  { value: '', label: 'Toutes les communes' },
  ...communes.value.map(c => ({
    value: String(c.id),
    label: c.nom,
  })),
])

const exerciceOptions = computed(() => [
  { value: '', label: 'Tous les exercices' },
  ...exercices.value.map(e => ({
    value: String(e.id),
    label: String(e.annee),
  })),
])

// Methods
const getStatutVariant = (statut: string) => {
  switch (statut) {
    case 'publie': return 'success'
    case 'brouillon': return 'warning'
    case 'archive': return 'neutral'
    default: return 'neutral'
  }
}

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'publie': return 'Publiée'
    case 'brouillon': return 'Brouillon'
    case 'archive': return 'Archivée'
    default: return statut
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (filters.value.statut) params.statut = filters.value.statut
    if (filters.value.commune_id) params.commune_id = Number(filters.value.commune_id)
    if (filters.value.exercice_id) params.exercice_id = Number(filters.value.exercice_id)

    pages.value = await cmsService.getPages(params)
  } catch (e) {
    console.error('Erreur chargement pages CMS:', e)
    pages.value = []
  } finally {
    loading.value = false
  }
}

const loadReferenceData = async () => {
  // Charger communes et exercices indépendamment pour éviter qu'un échec bloque l'autre
  const loadCommunes = async () => {
    try {
      const communesData = await geoService.getCommunes({ limit: 500 })
      const communesList = Array.isArray(communesData) ? communesData : communesData.items || []
      communes.value = communesList.map((c: any) => ({ id: c.id, nom: c.nom }))
    } catch (e: any) {
      console.error('Erreur chargement communes:', e)
      toast.error(e?.message || 'Erreur lors du chargement des communes')
    }
  }

  const loadExercices = async () => {
    try {
      exercices.value = await exercicesService.getPublicExercices()
    } catch (e: any) {
      console.error('Erreur chargement exercices:', e)
      toast.error(e?.message || 'Erreur lors du chargement des exercices')
    }
  }

  await Promise.all([loadCommunes(), loadExercices()])
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    commune_id: '',
    exercice_id: '',
  }
}

const confirmDelete = (page: PageCMSList) => {
  pageToDelete.value = page
  showDeleteModal.value = true
}

const deletePage = async () => {
  if (!pageToDelete.value) return

  deleting.value = true
  try {
    await cmsService.deletePage(pageToDelete.value.id)
    toast.success('Page supprimée avec succès')
    showDeleteModal.value = false
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

const publierPage = async (page: PageCMSList) => {
  try {
    await cmsService.publierPage(page.id)
    toast.success('Page publiée avec succès')
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la publication')
  }
}

const archiverPage = async (page: PageCMSList) => {
  try {
    await cmsService.archiverPage(page.id)
    toast.success('Page archivée avec succès')
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de l\'archivage')
  }
}

// Watchers
watch(filters, () => {
  loadData()
}, { deep: true })

// Load on mount
onMounted(async () => {
  await loadReferenceData()
  loadData()
})
</script>
