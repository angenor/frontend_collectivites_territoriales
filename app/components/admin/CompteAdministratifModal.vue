<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div @click="close" class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/75 z-0"></div>

      <!-- Modal -->
      <div class="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier le compte administratif' : 'Nouveau compte administratif' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- Validation ERROR Message -->
            <div v-if="validationError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-400 text-sm">
              {{ validationError }}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Année d'exercice <span class="text-red-500">*</span>
              </label>
              <input v-model.number="form.annee" type="number" required min="2000" max="2100" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de collectivité <span class="text-red-500">*</span>
              </label>
              <select v-model="collectiviteType" @change="onCollectiviteTypeChange" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner le type</option>
                <option value="region">Région</option>
                <option value="district">District</option>
                <option value="commune">Commune</option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Un compte administratif ne peut être lié qu'à UNE SEULE collectivité
              </p>
            </div>

            <div v-if="collectiviteType === 'region'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région <span class="text-red-500">*</span>
              </label>
              <select v-model="form.region_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner une région</option>
                <option v-for="region in regions" :key="region.id" :value="region.id">
                  {{ region.code }} - {{ region.nom }}
                </option>
              </select>
            </div>

            <div v-if="collectiviteType === 'district'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                District <span class="text-red-500">*</span>
              </label>
              <select v-model="form.district_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner un district</option>
                <option v-for="district in districts" :key="district.id" :value="district.id">
                  {{ district.code }} - {{ district.nom }}
                </option>
              </select>
            </div>

            <div v-if="collectiviteType === 'commune'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commune <span class="text-red-500">*</span>
              </label>
              <select v-model="form.commune_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner une commune</option>
                <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                  {{ commune.code }} - {{ commune.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut <span class="text-red-500">*</span>
              </label>
              <select v-model="form.statut" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="brouillon">Brouillon</option>
                <option value="valide">Validé</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes / Observations
              </label>
              <textarea v-model="form.notes" rows="3" placeholder="Ajoutez des observations ou des notes..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button type="button" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ saving ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratif, CompteAdministratifFormData } from '~/types/comptes-administratifs'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

const props = defineProps<{
  isOpen: boolean
  compte?: CompteAdministratif | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const { communes, fetchCommunes } = useCommunes()
const saving = ref(false)
const validationError = ref('')
const collectiviteType = ref('')

const isEditing = computed(() => !!props.compte)

const form = ref<CompteAdministratifFormData>({
  annee: new Date().getFullYear(),
  commune_id: null,
  district_id: null,
  region_id: null,
  statut: 'brouillon',
  notes: null
})

onMounted(async () => {
  await Promise.all([fetchRegions(), fetchDistricts(), fetchCommunes()])
})

watch(() => props.compte, (newCompte) => {
  if (newCompte) {
    // Determine collectivite_type from the data
    if (newCompte.commune_id) collectiviteType.value = 'commune'
    else if (newCompte.district_id) collectiviteType.value = 'district'
    else if (newCompte.region_id) collectiviteType.value = 'region'
    else collectiviteType.value = ''

    form.value = {
      annee: newCompte.annee,
      commune_id: newCompte.commune_id,
      district_id: newCompte.district_id,
      region_id: newCompte.region_id,
      statut: newCompte.statut,
      notes: newCompte.notes
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function onCollectiviteTypeChange() {
  // Reset all collectivite IDs when type changes (ENFORCE CHECK CONSTRAINT)
  form.value.region_id = null
  form.value.district_id = null
  form.value.commune_id = null
  validationError.value = ''
}

function resetForm() {
  form.value = {
    annee: new Date().getFullYear(),
    commune_id: null,
    district_id: null,
    region_id: null,
    statut: 'brouillon',
    notes: null
  }
  collectiviteType.value = ''
  validationError.value = ''
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  // VALIDATE CHECK CONSTRAINT: Only ONE collectivite must be selected
  const hasCommune = form.value.commune_id !== null
  const hasDistrict = form.value.district_id !== null
  const hasRegion = form.value.region_id !== null

  const countSelected = [hasCommune, hasDistrict, hasRegion].filter(Boolean).length

  if (countSelected === 0) {
    validationError.value = 'Vous devez sélectionner une collectivité (Région, District ou Commune)'
    return
  }

  if (countSelected > 1) {
    validationError.value = 'Un compte administratif ne peut être lié qu\'à UNE SEULE collectivité. Veuillez n\'en sélectionner qu\'une.'
    return
  }

  validationError.value = ''
  saving.value = true

  try {
    const dataToSave = { ...form.value }

    if (isEditing.value && props.compte) {
      // Update
      const { error } = await supabase
        .from('comptes_administratifs')
        .update(dataToSave)
        .eq('id', props.compte.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('comptes_administratifs')
        .insert([dataToSave])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err: any) {
    console.error('Erreur lors de l\'enregistrement:', err)
    validationError.value = err.message || 'Erreur lors de l\'enregistrement du compte administratif'
  } finally {
    saving.value = false
  }
}
</script>
