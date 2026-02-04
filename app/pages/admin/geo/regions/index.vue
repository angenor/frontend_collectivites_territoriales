<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Régions
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Les 22 régions de Madagascar
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Province filter -->
        <div class="w-48">
          <UiFormSelect
            v-model="filters.province_id"
            label="Province"
            :options="provinceOptions"
            placeholder="Toutes les provinces"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher une région..."
            :icon="['fas', 'magnifying-glass']"
            @update:model-value="debouncedSearch"
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

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="i in 8"
        :key="i"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5"
      >
        <UiSkeleton class="h-5 w-32 mb-2" />
        <UiSkeleton class="h-3 w-20 mb-3" />
        <UiSkeleton class="h-4 w-24" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadRegions"
    />

    <!-- Empty state -->
    <UiEmptyState
      v-else-if="!regions.length"
      title="Aucune région trouvée"
      description="Aucune région ne correspond à vos critères de recherche."
      icon="location-dot"
    />

    <!-- Regions grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="region in regions"
        :key="region.id"
        :to="`/admin/geo/regions/${region.id}`"
        class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {{ region.nom }}
            </h3>
            <span class="text-xs text-[var(--text-muted)] font-mono">
              {{ region.code }}
            </span>
          </div>
          <div class="p-2 rounded-lg bg-[var(--color-primary)]/10">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="text-[var(--color-primary)] text-sm" />
          </div>
        </div>

        <!-- Province badge -->
        <div class="mb-3">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <font-awesome-icon :icon="['fas', 'map']" class="mr-1 text-xs" />
            {{ region.province_nom || 'Province' }}
          </span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--text-muted)] text-xs" />
            <span class="text-sm text-[var(--text-secondary)]">
              {{ region.nb_communes || 0 }} communes
            </span>
          </div>
          <font-awesome-icon
            :icon="['fas', 'chevron-right']"
            class="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] text-xs transition-colors"
          />
        </div>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && !error && pagination.total > pagination.limit"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-[var(--text-muted)]">
        Affichage {{ ((pagination.page - 1) * pagination.limit) + 1 }} -
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        sur {{ pagination.total }} régions
      </p>
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="goToPage(pagination.page - 1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </UiButton>
        <span class="text-sm text-[var(--text-secondary)]">
          Page {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.pages"
          @click="goToPage(pagination.page + 1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegionWithStats, ProvinceWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const geoService = useGeoService()

// State
const regions = ref<RegionWithStats[]>([])
const provinces = ref<ProvinceWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filters = ref<{
  province_id: number | null
}>({
  province_id: null,
})
const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  pages: 1,
})

// Computed
const provinceOptions = computed(() => [
  { value: '', label: 'Toutes les provinces' },
  ...provinces.value.map(p => ({ value: p.id, label: p.nom })),
])

const hasActiveFilters = computed(() =>
  filters.value.province_id !== null || searchQuery.value !== ''
)

// Methods
const loadProvinces = async () => {
  try {
    provinces.value = await geoService.getProvinces()
  } catch (e) {
    console.error('Erreur chargement provinces:', e)
    // Mock data
    provinces.value = [
      { id: 1, code: 'ANT', nom: 'Antananarivo', nb_regions: 4, nb_communes: 180, created_at: '', updated_at: '' },
      { id: 2, code: 'ANS', nom: 'Antsiranana', nb_regions: 3, nb_communes: 82, created_at: '', updated_at: '' },
      { id: 3, code: 'FIA', nom: 'Fianarantsoa', nb_regions: 4, nb_communes: 200, created_at: '', updated_at: '' },
      { id: 4, code: 'MAH', nom: 'Mahajanga', nb_regions: 4, nb_communes: 125, created_at: '', updated_at: '' },
      { id: 5, code: 'TOA', nom: 'Toamasina', nb_regions: 3, nb_communes: 110, created_at: '', updated_at: '' },
      { id: 6, code: 'TOL', nom: 'Toliara', nb_regions: 4, nb_communes: 153, created_at: '', updated_at: '' },
    ]
  }
}

const loadRegions = async () => {
  loading.value = true
  error.value = null

  try {
    const params: any = {}

    if (filters.value.province_id) {
      params.province_id = filters.value.province_id
    }

    // Backend returns a plain array, handle filtering/pagination client-side
    let allRegions = await geoService.getRegions(params)

    // Client-side search filter (backend doesn't support search param)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      allRegions = allRegions.filter(r =>
        r.nom.toLowerCase().includes(query) || r.code.toLowerCase().includes(query)
      )
    }

    pagination.value.total = allRegions.length
    pagination.value.pages = Math.ceil(allRegions.length / pagination.value.limit)

    // Client-side pagination
    const start = (pagination.value.page - 1) * pagination.value.limit
    regions.value = allRegions.slice(start, start + pagination.value.limit)
  } catch (e: any) {
    console.error('Erreur chargement régions:', e)
    error.value = e?.message || 'Erreur lors du chargement des régions'
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadRegions()
}

const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  loadRegions()
}, 300)

const clearFilters = () => {
  filters.value.province_id = null
  searchQuery.value = ''
  pagination.value.page = 1
  loadRegions()
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadRegions()
}

// Load on mount
onMounted(async () => {
  await loadProvinces()
  await loadRegions()
})
</script>
