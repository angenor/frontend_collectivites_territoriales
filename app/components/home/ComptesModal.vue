<script setup lang="ts">
import type { CompteAdministratifWithStats } from '~/types/comptes-administratifs'

const props = defineProps<{
  show: boolean
  comptes: CompteAdministratifWithStats[]
  location: { label: string; latitude: number; longitude: number } | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select-compte': [compte: CompteAdministratifWithStats, locationLabel?: string]
}>()

const close = () => {
  emit('update:show', false)
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
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="text-blue-600 dark:text-blue-400" />
                Comptes Administratifs
              </h3>
              <p v-if="location" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ location.label }}
              </p>
            </div>
            <button
              @click="close"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
            </button>
          </div>

          <!-- Liste des comptes -->
          <div class="p-4 overflow-y-auto max-h-[60vh]">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sélectionnez un compte administratif pour voir les détails :
            </p>

            <div class="space-y-2">
              <button
                v-for="compte in comptes"
                :key="compte.id"
                @click="emit('select-compte', compte, location?.label)"
                class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ compte.collectivite_nom || compte.commune?.nom || compte.region?.nom || 'Collectivité' }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Exercice {{ compte.annee }}
                      <span v-if="compte.statut" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': compte.statut === 'publie',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': compte.statut === 'valide',
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': compte.statut === 'brouillon',
                        }">
                        {{ compte.statut }}
                      </span>
                    </p>
                  </div>
                </div>
                <font-awesome-icon
                  :icon="['fas', 'chevron-right']"
                  class="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
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
