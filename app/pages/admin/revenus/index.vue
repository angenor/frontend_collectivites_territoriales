<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Revenus Miniers
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Suivi des revenus issus des projets miniers
        </p>
      </div>
      <NuxtLink to="/admin/revenus/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouveau revenu
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'coins']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Total général</p>
            <p class="font-semibold text-lg text-[var(--text-primary)]">{{ formatMoney(stats.total) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="text-[var(--color-success)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Ristournes</p>
            <p class="font-semibold text-lg text-[var(--text-primary)]">{{ formatMoney(stats.ristournes) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'receipt']" class="text-[var(--color-secondary)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Redevances</p>
            <p class="font-semibold text-lg text-[var(--text-primary)]">{{ formatMoney(stats.redevances) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--text-muted)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'ellipsis']" class="text-[var(--text-muted)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Autres</p>
            <p class="font-semibold text-lg text-[var(--text-primary)]">{{ formatMoney(stats.autres) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Projet filter -->
        <div class="w-48">
          <UiFormSelect
            v-model="filters.projet_id"
            label="Projet"
            :options="projetOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Exercice filter -->
        <div class="w-32">
          <UiFormSelect
            v-model="filters.exercice_annee"
            label="Exercice"
            :options="anneeOptions"
            placeholder="Toutes"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Type filter -->
        <div class="w-36">
          <UiFormSelect
            v-model="filters.type_revenu"
            label="Type"
            :options="typeOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Région filter -->
        <div class="w-44">
          <UiFormSelect
            v-model="filters.region_id"
            label="Région"
            :options="regionOptions"
            placeholder="Toutes"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Clear filters -->
        <UiButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          :icon="['fas', 'times']"
          @click="clearFilters"
        >
          Effacer
        </UiButton>
      </div>
    </div>

    <!-- Data table -->
    <UiDataTable
      :columns="columns"
      :data="revenus"
      :loading="loading"
      :sortable="true"
      :pagination="{
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
      }"
      empty-message="Aucun revenu trouvé"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <!-- Projet column -->
      <template #cell-projet="{ row }">
        <div v-if="row.projet">
          <NuxtLink
            :to="`/admin/projets/${row.projet_id}`"
            class="font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {{ row.projet.nom }}
          </NuxtLink>
          <p class="text-xs text-[var(--text-muted)]">{{ row.projet.type_minerai }}</p>
        </div>
        <span v-else class="text-[var(--text-muted)]">-</span>
      </template>

      <!-- Commune column -->
      <template #cell-commune="{ row }">
        <NuxtLink
          v-if="row.commune"
          :to="`/admin/geo/communes/${row.commune_id}`"
          class="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          {{ row.commune.nom }}
        </NuxtLink>
        <span v-else class="text-[var(--text-muted)]">-</span>
      </template>

      <!-- Exercice column -->
      <template #cell-exercice="{ row }">
        <span class="text-[var(--text-primary)]">
          {{ row.exercice_annee || '-' }}
        </span>
      </template>

      <!-- Type column -->
      <template #cell-type_revenu="{ value }">
        <span
          :class="[
            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
            getTypeRevenuClass(value)
          ]"
        >
          {{ getTypeRevenuLabel(value) }}
        </span>
      </template>

      <!-- Montant column -->
      <template #cell-montant_recu="{ value }">
        <span class="font-mono font-semibold text-[var(--color-primary)]">
          {{ formatMoney(value) }}
        </span>
      </template>

      <!-- Actions column -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink :to="`/admin/revenus/${row.id}`">
            <UiButton variant="ghost" size="sm" :icon="['fas', 'eye']" title="Voir" />
          </NuxtLink>
          <NuxtLink :to="`/admin/revenus/${row.id}?edit=true`">
            <UiButton variant="ghost" size="sm" :icon="['fas', 'edit']" title="Modifier" />
          </NuxtLink>
          <UiButton
            variant="ghost"
            size="sm"
            :icon="['fas', 'trash']"
            title="Supprimer"
            class="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            @click="confirmDelete(row)"
          />
        </div>
      </template>
    </UiDataTable>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer le revenu"
      size="sm"
      :confirm-loading="deleting"
      confirm-text="Supprimer"
      confirm-variant="danger"
      @confirm="handleDelete"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer ce revenu de
        <strong class="text-[var(--color-primary)]">{{ formatMoney(revenuToDelete?.montant_recu || 0) }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--text-muted)]">
        Cette action est irréversible.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinier } from '~/types/projets-miniers'
import type { ProjetMinierWithStats } from '~/types/projets-miniers'
import type { RegionWithStats } from '~/types/collectivites'
import { useProjetsService } from '~/services/projets.service'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const projetsService = useProjetsService()
const geoService = useGeoService()
const toast = useAppToast()

// State
const revenus = ref<RevenuMinier[]>([])
const projets = ref<ProjetMinierWithStats[]>([])
const regions = ref<RegionWithStats[]>([])
const loading = ref(true)
const filters = ref<{
  projet_id: string | null
  exercice_annee: number | null
  type_revenu: 'ristourne_miniere' | 'redevance_miniere' | 'frais_administration_miniere' | 'quote_part_ristourne' | 'autre' | null
  region_id: string | null
}>({
  projet_id: null,
  exercice_annee: null,
  type_revenu: null,
  region_id: null,
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
})
const sortBy = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')
const stats = ref({
  total: 0,
  ristournes: 0,
  redevances: 0,
  autres: 0,
})

// Delete modal
const showDeleteModal = ref(false)
const revenuToDelete = ref<RevenuMinier | null>(null)
const deleting = ref(false)

// Table columns
const columns = [
  { key: 'projet', label: 'Projet', sortable: true },
  { key: 'commune', label: 'Commune', sortable: true },
  { key: 'exercice', label: 'Exercice', sortable: true, width: '100px' },
  { key: 'type_revenu', label: 'Type', sortable: true, width: '110px' },
  { key: 'montant_recu', label: 'Montant reçu', sortable: true, width: '160px' },
  { key: 'actions', label: '', width: '140px' },
]

// Computed
const currentYear = new Date().getFullYear()

const projetOptions = computed(() => [
  { value: '', label: 'Tous les projets' },
  ...projets.value.map(p => ({ value: p.id, label: p.nom })),
])

const anneeOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: y, label: String(y) })
  }
  return [{ value: '', label: 'Toutes les années' }, ...years]
})

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'ristourne_miniere', label: 'Ristourne minière' },
  { value: 'redevance_miniere', label: 'Redevance minière' },
  { value: 'frais_administration_miniere', label: 'Frais admin.' },
  { value: 'quote_part_ristourne', label: 'Quote-part' },
  { value: 'autre', label: 'Autre' },
]

const regionOptions = computed(() => [
  { value: '', label: 'Toutes les régions' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

const hasActiveFilters = computed(() =>
  filters.value.projet_id !== null ||
  filters.value.exercice_annee !== null ||
  filters.value.type_revenu !== null ||
  filters.value.region_id !== null
)

// Methods
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getTypeRevenuLabel = (type: string) => {
  const labels: Record<string, string> = {
    ristourne_miniere: 'Ristourne',
    redevance_miniere: 'Redevance',
    frais_administration_miniere: 'Frais admin.',
    quote_part_ristourne: 'Quote-part',
    autre: 'Autre',
  }
  return labels[type] || type
}

const getTypeRevenuClass = (type: string) => {
  const classes: Record<string, string> = {
    ristourne_miniere: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    redevance_miniere: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    frais_administration_miniere: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
    quote_part_ristourne: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    autre: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
  }
  return classes[type] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
}

const loadProjets = async () => {
  try {
    const response = await projetsService.getProjets({ limit: 100 })
    projets.value = response.items
  } catch (e) {
    console.error('Erreur chargement projets:', e)
    projets.value = [
      { id: '1', nom: 'Site de Mandena', code: 'QMM-MAN', type_minerai: 'Ilménite', societe_id: 1, societe_exploitante: 'QMM', statut: 'en_cours', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Mine', code: 'AMB-001', type_minerai: 'Nickel', societe_id: 2, societe_exploitante: 'Ambatovy', statut: 'en_cours', created_at: '', updated_at: '' },
    ]
  }
}

const loadRegions = async () => {
  try {
    const response = await geoService.getRegions({ limit: 100 })
    regions.value = response.items
  } catch (e) {
    console.error('Erreur chargement régions:', e)
    regions.value = []
  }
}

const loadRevenus = async () => {
  loading.value = true

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.projet_id) params.projet_id = filters.value.projet_id
    if (filters.value.exercice_annee) params.exercice_annee = filters.value.exercice_annee
    if (filters.value.type_revenu) params.type_revenu = filters.value.type_revenu
    if (filters.value.region_id) params.region_id = filters.value.region_id
    if (sortBy.value) {
      params.sort_by = sortBy.value
      params.sort_order = sortOrder.value
    }

    const response = await projetsService.getRevenus(params)
    revenus.value = response.items
    pagination.value.total = response.total
    pagination.value.pages = response.pages

    // Calculate stats
    calculateStats()
  } catch (e: any) {
    console.error('Erreur chargement revenus:', e)

    // Mock data
    revenus.value = [
      {
        id: '1',
        projet_id: 1,
        commune_id: 1,
        exercice_id: 1,
        exercice_annee: 2024,
        type_revenu: 'ristourne_miniere',
        montant_prevu: 150000000,
        montant_recu: 125000000,
        compte_code: '701',
        compte_administratif_id: 1,
        created_at: '',
        updated_at: '',
        projet: { id: 1, nom: 'Site de Mandena', type_minerai: 'Ilménite' },
        commune: { id: 1, code: 'TFD', nom: 'Fort Dauphin' },
      },
      {
        id: '2',
        projet_id: 1,
        commune_id: 1,
        exercice_id: 1,
        exercice_annee: 2024,
        type_revenu: 'redevance_miniere',
        montant_prevu: 500000000,
        montant_recu: 450000000,
        compte_code: '702',
        compte_administratif_id: 1,
        created_at: '',
        updated_at: '',
        projet: { id: 1, nom: 'Site de Mandena', type_minerai: 'Ilménite' },
        commune: { id: 1, code: 'TFD', nom: 'Fort Dauphin' },
      },
      {
        id: '3',
        projet_id: 2,
        commune_id: 2,
        exercice_id: 1,
        exercice_annee: 2024,
        type_revenu: 'ristourne_miniere',
        montant_prevu: 350000000,
        montant_recu: 320000000,
        compte_code: '701',
        compte_administratif_id: 2,
        created_at: '',
        updated_at: '',
        projet: { id: 2, nom: 'Ambatovy Mine', type_minerai: 'Nickel' },
        commune: { id: 2, code: 'MOR', nom: 'Moramanga' },
      },
      {
        id: '4',
        projet_id: 2,
        commune_id: 3,
        exercice_id: 1,
        exercice_annee: 2024,
        type_revenu: 'autre',
        montant_prevu: 100000000,
        montant_recu: 85000000,
        compte_code: '709',
        compte_administratif_id: 3,
        created_at: '',
        updated_at: '',
        projet: { id: 2, nom: 'Ambatovy Mine', type_minerai: 'Nickel' },
        commune: { id: 3, code: 'TOA', nom: 'Toamasina' },
      },
    ]
    pagination.value.total = revenus.value.length
    pagination.value.pages = 1
    calculateStats()
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  stats.value = {
    total: 0,
    ristournes: 0,
    redevances: 0,
    autres: 0,
  }

  revenus.value.forEach(r => {
    stats.value.total += r.montant_recu
    if (r.type_revenu === 'ristourne_miniere' || r.type_revenu === 'quote_part_ristourne') stats.value.ristournes += r.montant_recu
    else if (r.type_revenu === 'redevance_miniere') stats.value.redevances += r.montant_recu
    else stats.value.autres += r.montant_recu
  })
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadRevenus()
}

const clearFilters = () => {
  filters.value = {
    projet_id: null,
    exercice_annee: null,
    type_revenu: null,
    region_id: null,
  }
  pagination.value.page = 1
  loadRevenus()
}

const handleSort = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  sortBy.value = key
  sortOrder.value = order
  loadRevenus()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadRevenus()
}

const confirmDelete = (revenu: RevenuMinier) => {
  revenuToDelete.value = revenu
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!revenuToDelete.value) return

  deleting.value = true
  try {
    await projetsService.deleteRevenu(revenuToDelete.value.id)
    toast.success('Revenu supprimé avec succès')
    showDeleteModal.value = false
    revenuToDelete.value = null
    await loadRevenus()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

// Load on mount
onMounted(async () => {
  await Promise.all([loadProjets(), loadRegions()])

  // Apply filters from query
  if (route.query.projet_id) {
    filters.value.projet_id = route.query.projet_id as string
  }
  if (route.query.exercice_annee) {
    filters.value.exercice_annee = Number(route.query.exercice_annee)
  }

  await loadRevenus()
})
</script>
