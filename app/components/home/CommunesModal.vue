<script setup lang="ts">
import type { RegionWithStats, CommuneWithStats } from '~/types/collectivites'

const props = defineProps<{
  show: boolean
  region: RegionWithStats | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select-commune': [commune: CommuneWithStats]
}>()

const geoService = useGeoService()
const communes = ref<CommuneWithStats[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// Charger les communes quand la région change
watch(() => props.region, async (region) => {
  if (region && props.show) {
    await loadCommunes(region.id)
  }
})

watch(() => props.show, async (show) => {
  if (show && props.region) {
    await loadCommunes(props.region.id)
  } else {
    searchQuery.value = ''
  }
})

const loadCommunes = async (regionId: number) => {
  isLoading.value = true
  communes.value = []
  try {
    communes.value = await geoService.getRegionCommunes(regionId)
  } catch (err: any) {
    console.error('Erreur lors du chargement des communes:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredCommunes = computed(() => {
  if (!searchQuery.value) return communes.value
  const q = searchQuery.value.toLowerCase()
  return communes.value.filter(c => c.nom.toLowerCase().includes(q))
})

const close = () => {
  emit('update:show', false)
}

const selectCommune = (commune: CommuneWithStats) => {
  emit('select-commune', commune)
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        ></div>

        <!-- Modal content -->
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
          <!-- Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'map-location-dot']" class="text-blue-600 dark:text-blue-400" />
                  {{ region?.nom || 'Région' }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ region?.province_nom || '' }} &middot; {{ region?.nb_communes || 0 }} communes
                </p>
              </div>
              <button
                @click="close"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
              </button>
            </div>

            <!-- Recherche -->
            <div class="relative">
              <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une commune..."
                class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <!-- Liste des communes -->
          <div class="p-4 overflow-y-auto max-h-[55vh]">
            <!-- Loading -->
            <div v-if="isLoading" class="flex flex-col items-center gap-3 py-8">
              <font-awesome-icon icon="spinner" class="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              <span class="text-sm text-gray-500 dark:text-gray-400">Chargement des communes...</span>
            </div>

            <!-- Aucun résultat -->
            <div v-else-if="filteredCommunes.length === 0" class="text-center py-8">
              <font-awesome-icon :icon="['fas', 'city']" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ searchQuery ? 'Aucune commune trouvée' : 'Aucune commune dans cette région' }}
              </p>
            </div>

            <!-- Liste -->
            <div v-else class="space-y-1.5">
              <button
                v-for="commune in filteredCommunes"
                :key="commune.id"
                @click="commune.nb_comptes_administratifs ? selectCommune(commune) : undefined"
                :disabled="!commune.nb_comptes_administratifs"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-transparent transition group"
                :class="commune.nb_comptes_administratifs
                  ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center"
                    :class="commune.nb_comptes_administratifs
                      ? (commune.type_commune === 'urbaine'
                        ? 'bg-purple-100 dark:bg-purple-900/50'
                        : 'bg-green-100 dark:bg-green-900/50')
                      : 'bg-gray-100 dark:bg-gray-700'"
                  >
                    <font-awesome-icon
                      :icon="['fas', commune.type_commune === 'urbaine' ? 'building' : 'tree']"
                      class="w-4 h-4"
                      :class="commune.nb_comptes_administratifs
                        ? (commune.type_commune === 'urbaine'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-green-600 dark:text-green-400')
                        : 'text-gray-400 dark:text-gray-500'"
                    />
                  </div>
                  <div class="text-left">
                    <p class="font-medium text-sm"
                      :class="commune.nb_comptes_administratifs
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'"
                    >
                      {{ commune.nom }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ commune.type_commune === 'urbaine' ? 'Urbaine' : 'Rurale' }}
                      <span v-if="commune.nb_comptes_administratifs" class="ml-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        &middot; {{ commune.nb_comptes_administratifs }} compte(s)
                      </span>
                      <span v-else class="ml-1.5 text-orange-500 dark:text-orange-400 font-medium">
                        &middot; aucune donnée
                      </span>
                    </p>
                  </div>
                </div>
                <font-awesome-icon
                  v-if="commune.nb_comptes_administratifs"
                  :icon="['fas', 'chevron-right']"
                  class="text-gray-300 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400 transition w-3 h-3"
                />
                <font-awesome-icon
                  v-else
                  :icon="['fas', 'ban']"
                  class="text-gray-300 dark:text-gray-600 w-3 h-3"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              @click="close"
              class="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: all 0.3s ease;
}
</style>
