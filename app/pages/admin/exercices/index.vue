<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Exercices Budgétaires
        </h1>
        <p class="mt-2 text-[var(--text-secondary)]">
          Gestion des exercices fiscaux et années budgétaires.
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        <span>Nouvel exercice</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'calendar']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ exercices.length }}</p>
            <p class="text-xs text-[var(--text-muted)]">Total exercices</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="text-[var(--color-success)]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ exercicesOuverts }}</p>
            <p class="text-xs text-[var(--text-muted)]">En cours</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'lock']" class="text-[var(--color-warning)]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ exercicesClotures }}</p>
            <p class="text-xs text-[var(--text-muted)]">Clôturés</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'star']" class="text-[var(--color-info)]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ exerciceActuel?.annee || '-' }}</p>
            <p class="text-xs text-[var(--text-muted)]">Exercice actuel</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Exercices List -->
    <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Année
              </th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Libellé
              </th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Période
              </th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Statut
              </th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Données
              </th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Comptes
              </th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border-default)]">
            <tr
              v-for="exercice in exercices"
              :key="exercice.id"
              class="hover:bg-[var(--interactive-hover)] transition-colors"
            >
              <td class="px-6 py-4">
                <span class="text-lg font-bold text-[var(--text-primary)]">{{ exercice.annee }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-[var(--text-primary)]">{{ exercice.libelle || `Exercice ${exercice.annee}` }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-[var(--text-secondary)]">
                  {{ formatDate(exercice.date_debut) }} - {{ formatDate(exercice.date_fin) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                    exercice.cloture
                      ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                      : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', exercice.cloture ? 'lock' : 'lock-open']" class="text-[10px]" />
                  {{ exercice.cloture ? 'Clôturé' : 'En cours' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-[var(--text-secondary)]">
                  <span class="font-medium text-[var(--text-primary)]">{{ exercice.nb_recettes || 0 }}</span> recettes,
                  <span class="font-medium text-[var(--text-primary)]">{{ exercice.nb_depenses || 0 }}</span> dépenses
                </div>
              </td>
              <td class="px-6 py-4">
                <NuxtLink
                  :to="`/admin/comptes-administratifs?annee=${exercice.annee}`"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="text-[10px]" />
                  {{ exercice.nb_communes }} commune{{ exercice.nb_communes > 1 ? 's' : '' }}
                </NuxtLink>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/comptes-administratifs?annee=${exercice.annee}`"
                    class="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
                    title="Voir les comptes administratifs"
                  >
                    <font-awesome-icon :icon="['fas', 'folder-open']" />
                  </NuxtLink>
                  <button
                    @click="editExercice(exercice)"
                    class="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button
                    v-if="!exercice.cloture"
                    @click="clotureExercice(exercice)"
                    class="p-2 text-[var(--text-secondary)] hover:text-[var(--color-warning)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors cursor-pointer"
                    title="Clôturer"
                  >
                    <font-awesome-icon :icon="['fas', 'lock']" />
                  </button>
                  <button
                    @click="confirmDelete(exercice)"
                    class="p-2 text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="!exercices.length" class="py-12">
        <UiEmptyState
          :icon="['fas', 'calendar-days']"
          title="Aucun exercice"
          description="Créez votre premier exercice budgétaire."
        >
          <template #action>
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
              <span>Créer un exercice</span>
            </button>
          </template>
        </UiEmptyState>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal
      v-model="showModalActive"
      :title="showEditModal ? 'Modifier l\'exercice' : 'Nouvel exercice'"
      size="md"
      @close="closeModals"
    >
      <form @submit.prevent="saveExercice" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Année <span class="text-[var(--color-error)]">*</span>
          </label>
          <input
            v-model.number="form.annee"
            type="number"
            :min="2000"
            :max="2100"
            required
            class="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="2024"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Libellé
          </label>
          <input
            v-model="form.libelle"
            type="text"
            class="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Exercice budgétaire 2024"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Date début <span class="text-[var(--color-error)]">*</span>
            </label>
            <input
              v-model="form.date_debut"
              type="date"
              required
              class="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Date fin <span class="text-[var(--color-error)]">*</span>
            </label>
            <input
              v-model="form.date_fin"
              type="date"
              required
              class="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="form.cloture"
            type="checkbox"
            id="cloture"
            class="w-4 h-4 rounded border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label for="cloture" class="text-sm text-[var(--text-primary)]">
            Exercice clôturé
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <button
            type="button"
            @click="closeModals"
            class="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <UiLoadingSpinner v-if="saving" size="sm" />
            <span>{{ showEditModal ? 'Enregistrer' : 'Créer' }}</span>
          </button>
        </div>
      </form>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer l'exercice <strong class="text-[var(--text-primary)]">{{ selectedExercice?.annee }}</strong> ?
        Cette action est irréversible.
      </p>
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          @click="deleteExercice"
          :disabled="deleting"
          class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-error)] text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <UiLoadingSpinner v-if="deleting" size="sm" />
          <span>Supprimer</span>
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

interface ExerciceEnriched {
  id: number
  annee: number
  libelle?: string
  date_debut: string
  date_fin: string
  cloture: boolean
  nb_recettes: number
  nb_depenses: number
  nb_communes: number
}

const toast = useAppToast()
const exercicesService = useExercicesService()

// State
const exercices = ref<ExerciceEnriched[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedExercice = ref<ExerciceEnriched | null>(null)

const form = ref({
  annee: new Date().getFullYear(),
  libelle: '',
  date_debut: '',
  date_fin: '',
  cloture: false,
})

// Computed
const showModalActive = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (val: boolean) => {
    if (!val) closeModals()
  },
})
const exercicesOuverts = computed(() => exercices.value.filter(e => !e.cloture).length)
const exercicesClotures = computed(() => exercices.value.filter(e => e.cloture).length)
const exerciceActuel = computed(() => exercices.value.find(e => !e.cloture) || exercices.value[0])

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const loadExercices = async () => {
  loading.value = true
  try {
    const list = await exercicesService.getExercices()

    // Enrich each exercice with details (dates) and stats (counts) in parallel
    const enriched = await Promise.all(
      list.map(async (item) => {
        try {
          const [detail, stats] = await Promise.all([
            exercicesService.getExercice(item.id),
            exercicesService.getStatistiques(item.id),
          ])
          return {
            id: item.id,
            annee: item.annee,
            libelle: item.libelle,
            date_debut: detail.date_debut,
            date_fin: detail.date_fin,
            cloture: item.cloture,
            nb_recettes: stats.recettes.total,
            nb_depenses: stats.depenses.total,
            nb_communes: Math.max(stats.communes_avec_recettes, stats.communes_avec_depenses),
          }
        } catch {
          return {
            id: item.id,
            annee: item.annee,
            libelle: item.libelle,
            date_debut: '',
            date_fin: '',
            cloture: item.cloture,
            nb_recettes: 0,
            nb_depenses: 0,
            nb_communes: 0,
          }
        }
      })
    )

    exercices.value = enriched
  } catch (error: any) {
    console.error('Erreur lors du chargement des exercices:', error)
    toast.error(error?.message || 'Erreur lors du chargement des exercices')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  const currentYear = new Date().getFullYear()
  form.value = {
    annee: currentYear,
    libelle: `Exercice budgétaire ${currentYear}`,
    date_debut: `${currentYear}-01-01`,
    date_fin: `${currentYear}-12-31`,
    cloture: false,
  }
}

const editExercice = (exercice: ExerciceEnriched) => {
  selectedExercice.value = exercice
  form.value = {
    annee: exercice.annee,
    libelle: exercice.libelle || '',
    date_debut: exercice.date_debut,
    date_fin: exercice.date_fin,
    cloture: exercice.cloture,
  }
  showEditModal.value = true
}

const saveExercice = async () => {
  saving.value = true
  try {
    if (showEditModal.value && selectedExercice.value) {
      await exercicesService.updateExercice(selectedExercice.value.id, {
        libelle: form.value.libelle || undefined,
        date_debut: form.value.date_debut,
        date_fin: form.value.date_fin,
        cloture: form.value.cloture,
      })
      toast.success('Exercice modifié avec succès')
    } else {
      await exercicesService.createExercice({
        annee: form.value.annee,
        libelle: form.value.libelle || undefined,
        date_debut: form.value.date_debut,
        date_fin: form.value.date_fin,
        cloture: form.value.cloture,
      })
      toast.success('Exercice créé avec succès')
    }
    closeModals()
    await loadExercices()
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde:', error)
    toast.error(error?.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const clotureExercice = async (exercice: ExerciceEnriched) => {
  if (!confirm(`Êtes-vous sûr de vouloir clôturer l'exercice ${exercice.annee} ?`)) return

  try {
    await exercicesService.cloturerExercice(exercice.id)
    toast.success(`Exercice ${exercice.annee} clôturé`)
    await loadExercices()
  } catch (error: any) {
    console.error('Erreur lors de la clôture:', error)
    toast.error(error?.message || 'Erreur lors de la clôture')
  }
}

const confirmDelete = (exercice: ExerciceEnriched) => {
  selectedExercice.value = exercice
  showDeleteModal.value = true
}

const deleteExercice = async () => {
  if (!selectedExercice.value) return

  deleting.value = true
  try {
    await exercicesService.deleteExercice(selectedExercice.value.id)
    toast.success('Exercice supprimé')
    showDeleteModal.value = false
    selectedExercice.value = null
    await loadExercices()
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    toast.error(error?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedExercice.value = null
  resetForm()
}

// Lifecycle
onMounted(() => {
  loadExercices()
  resetForm()
})
</script>
