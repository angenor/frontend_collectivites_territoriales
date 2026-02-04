<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/revenus"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux revenus
    </NuxtLink>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouveau revenu minier
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Enregistrer un nouveau revenu issu d'un projet minier
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Section: Source du revenu -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Source du revenu</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Projet -->
          <UiFormSelect
            v-model="form.projet_id"
            label="Projet minier"
            :options="projetOptions"
            placeholder="Selectionner un projet"
            required
            :error="formErrors.projet_id"
          />

          <!-- Commune -->
          <UiFormSelect
            v-model="form.commune_id"
            label="Commune beneficiaire"
            :options="communeOptions"
            placeholder="Selectionner une commune"
            required
            :error="formErrors.commune_id"
            hint="Commune qui recoit ce revenu"
          />

          <!-- Type de revenu -->
          <UiFormSelect
            v-model="form.type_revenu"
            label="Type de revenu"
            :options="typeOptions"
            required
            :error="formErrors.type_revenu"
          />

          <!-- Code plan comptable -->
          <UiFormSelect
            v-model="form.compte_code"
            label="Rubrique du plan comptable"
            :options="compteCodeOptions"
            placeholder="Selectionner un code comptable"
            required
            :error="formErrors.compte_code"
            hint="Code du plan comptable (recettes)"
          />
        </div>
      </div>

      <!-- Section: Montants -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Montants</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Montant prevu -->
          <UiFormInput
            v-model.number="form.montant_prevu"
            label="Montant prevu (MGA)"
            type="number"
            placeholder="0"
            required
            :error="formErrors.montant_prevu"
          />

          <!-- Montant recu -->
          <UiFormInput
            v-model.number="form.montant_recu"
            label="Montant recu (MGA)"
            type="number"
            placeholder="0"
            required
            :error="formErrors.montant_recu"
          />
        </div>

        <!-- Ecart indicatif -->
        <div v-if="form.montant_prevu > 0 || form.montant_recu > 0" class="mt-4 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--text-muted)]">Ecart (recu - prevu)</span>
            <span :class="ecart >= 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
              {{ formatMoney(ecart) }}
            </span>
          </div>
          <div v-if="form.montant_prevu > 0" class="flex items-center justify-between text-sm mt-1">
            <span class="text-[var(--text-muted)]">Taux de realisation</span>
            <span class="font-semibold text-[var(--text-primary)]">
              {{ tauxRealisation.toFixed(1) }} %
            </span>
          </div>
        </div>
      </div>

      <!-- Section: Periode et tracabilite -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Periode et tracabilite</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Exercice -->
          <UiFormSelect
            v-model="form.exercice_id"
            label="Exercice budgetaire"
            :options="exerciceOptions"
            placeholder="Selectionner un exercice"
            required
            :error="formErrors.exercice_id"
          />

          <!-- Compte administratif -->
          <UiFormSelect
            v-model="form.compte_administratif_id"
            label="Compte administratif"
            :options="compteAdministratifOptions"
            placeholder="Selectionner un compte administratif"
            required
            :disabled="!form.commune_id || !form.exercice_id"
            :error="formErrors.compte_administratif_id"
            :hint="compteAdminHint"
          />

          <!-- Date de reception -->
          <UiFormInput
            v-model="form.date_reception"
            label="Date de reception"
            type="date"
            :error="formErrors.date_reception"
          />

          <!-- Reference de paiement -->
          <UiFormInput
            v-model="form.reference_paiement"
            label="Reference de paiement"
            type="text"
            placeholder="Ex: ORD-2024-001, cheque n. 12345"
            :error="formErrors.reference_paiement"
          />
        </div>

        <div class="mt-6">
          <UiFormTextarea
            v-model="form.commentaire"
            label="Commentaire"
            placeholder="Notes ou commentaires sur ce revenu"
            :rows="2"
            :error="formErrors.commentaire"
          />
        </div>
      </div>

      <!-- Summary card -->
      <div v-if="selectedProjet" class="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'gem']" class="text-[var(--color-secondary)] text-lg" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-[var(--text-primary)]">{{ selectedProjet.nom }}</p>
            <p class="text-sm text-[var(--text-muted)]">
              {{ selectedProjet.type_minerai }} &#8226; {{ selectedProjet.societe_exploitante }}
            </p>
          </div>
          <div v-if="form.montant_recu > 0" class="text-right">
            <p class="text-sm text-[var(--text-muted)]">Montant recu</p>
            <p class="text-lg font-bold text-[var(--color-primary)]">{{ formatMoney(form.montant_recu) }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/revenus')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Enregistrer le revenu
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinierFormData, ProjetMinierWithStats } from '~/types/projets-miniers'
import type { CommuneWithStats } from '~/types/collectivites'
import type { ExerciceList } from '~/services/exercices.service'
import { useProjetsService } from '~/services/projets.service'
import { useGeoService } from '~/services/geo.service'
import { useExercicesService } from '~/services/exercices.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const projetsService = useProjetsService()
const geoService = useGeoService()
const exercicesService = useExercicesService()
const toast = useAppToast()

// State
const projets = ref<ProjetMinierWithStats[]>([])
const communes = ref<CommuneWithStats[]>([])
const exercices = ref<ExerciceList[]>([])
const planComptableCodes = ref<Array<{ code: string; intitule: string }>>([])
const comptesAdministratifs = ref<Array<{ id: number; commune_id: number; exercice_id: number; commune_nom?: string; annee?: number }>>([])
const loadingComptesAdmin = ref(false)
const saving = ref(false)

// Form
const form = ref<RevenuMinierFormData>({
  projet_id: '',
  commune_id: '',
  exercice_id: '',
  type_revenu: 'ristourne_miniere',
  montant_prevu: 0,
  montant_recu: 0,
  date_reception: null,
  reference_paiement: null,
  compte_code: '',
  compte_administratif_id: null,
  commentaire: null,
})
const formErrors = ref<Record<string, string>>({})

// Computed
const selectedProjet = computed(() =>
  projets.value.find(p => p.id === form.value.projet_id)
)

const ecart = computed(() => form.value.montant_recu - form.value.montant_prevu)

const tauxRealisation = computed(() => {
  if (form.value.montant_prevu <= 0) return 0
  return (form.value.montant_recu / form.value.montant_prevu) * 100
})

const projetOptions = computed(() =>
  projets.value.map(p => ({ value: p.id, label: `${p.nom} (${p.type_minerai})` }))
)

const communeOptions = computed(() =>
  communes.value.map(c => ({ value: c.id, label: c.nom }))
)

const typeOptions = [
  { value: 'ristourne_miniere', label: 'Ristourne miniere' },
  { value: 'redevance_miniere', label: 'Redevance miniere' },
  { value: 'frais_administration_miniere', label: "Frais d'administration miniere" },
  { value: 'quote_part_ristourne', label: 'Quote-part de ristourne' },
  { value: 'autre', label: 'Autre' },
]

const exerciceOptions = computed(() =>
  exercices.value.map(e => ({
    value: e.id,
    label: `${e.annee}${e.cloture ? ' (cloture)' : ''}`,
  }))
)

const compteCodeOptions = computed(() =>
  planComptableCodes.value.map(c => ({
    value: c.code,
    label: `${c.code} - ${c.intitule}`,
  }))
)

const compteAdministratifOptions = computed(() =>
  comptesAdministratifs.value.map(ca => ({
    value: ca.id,
    label: ca.commune_nom
      ? `${ca.commune_nom} - ${ca.annee || ''} (#${ca.id})`
      : `Compte #${ca.id} (exercice ${ca.exercice_id})`,
  }))
)

const compteAdminHint = computed(() => {
  if (!form.value.commune_id || !form.value.exercice_id) {
    return 'Selectionnez d\'abord une commune et un exercice'
  }
  if (loadingComptesAdmin.value) {
    return 'Chargement des comptes administratifs...'
  }
  if (comptesAdministratifs.value.length === 0) {
    return 'Aucun compte administratif trouve pour cette commune et cet exercice'
  }
  return undefined
})

// Watcher: auto-load comptes administratifs when commune_id AND exercice_id change
watch(
  () => [form.value.commune_id, form.value.exercice_id],
  async ([newCommuneId, newExerciceId]) => {
    // Reset selection
    form.value.compte_administratif_id = null
    comptesAdministratifs.value = []

    if (!newCommuneId || !newExerciceId) return

    // Find the annee for the selected exercice
    const selectedExercice = exercices.value.find(e => String(e.id) === String(newExerciceId))
    if (!selectedExercice) return

    loadingComptesAdmin.value = true
    try {
      const results = await projetsService.getComptesAdministratifsForSelect({
        commune_id: newCommuneId as string | number,
        annee: selectedExercice.annee,
      })
      comptesAdministratifs.value = results

      // Auto-select if only one result
      if (results.length === 1) {
        form.value.compte_administratif_id = results[0].id
      }
    } catch (e) {
      console.error('Erreur chargement comptes administratifs:', e)
      comptesAdministratifs.value = []
    } finally {
      loadingComptesAdmin.value = false
    }
  },
  { immediate: false }
)

// Methods
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

const loadReferenceData = async () => {
  // Load each source independently so one failure doesn't block others
  const loadProjets = async () => {
    try {
      const response = await projetsService.getProjets({ limit: 200 })
      projets.value = response.items || []
    } catch (e) {
      console.error('Erreur chargement projets:', e)
      projets.value = []
    }
  }

  const loadCommunes = async () => {
    try {
      const response = await geoService.getCommunes({ limit: 500 })
      communes.value = response.items || []
    } catch (e) {
      console.error('Erreur chargement communes:', e)
      communes.value = []
    }
  }

  const loadExercices = async () => {
    try {
      const data = await exercicesService.getExercices()
      exercices.value = Array.isArray(data) ? data : []
    } catch (e) {
      console.error('Erreur chargement exercices:', e)
      exercices.value = []
    }
  }

  const loadPlanComptable = async () => {
    try {
      const data = await projetsService.getPlanComptableForRevenus()
      planComptableCodes.value = Array.isArray(data) ? data : []
    } catch (e) {
      console.error('Erreur chargement plan comptable:', e)
      planComptableCodes.value = []
    }
  }

  await Promise.all([loadProjets(), loadCommunes(), loadExercices(), loadPlanComptable()])

  // Pre-fill projet if passed via query
  if (route.query.projet_id) {
    form.value.projet_id = route.query.projet_id as string
  }
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.projet_id) {
    formErrors.value.projet_id = 'Le projet minier est requis'
  }

  if (!form.value.commune_id) {
    formErrors.value.commune_id = 'La commune beneficiaire est requise'
  }

  if (!form.value.type_revenu) {
    formErrors.value.type_revenu = 'Le type de revenu est requis'
  }

  if (!form.value.compte_code) {
    formErrors.value.compte_code = 'Le code du plan comptable est requis'
  }

  if (!form.value.exercice_id) {
    formErrors.value.exercice_id = 'L\'exercice budgetaire est requis'
  }

  if (!form.value.compte_administratif_id) {
    formErrors.value.compte_administratif_id = 'Le compte administratif est requis'
  }

  if (form.value.montant_prevu === null || form.value.montant_prevu === undefined || form.value.montant_prevu < 0) {
    formErrors.value.montant_prevu = 'Le montant prevu doit etre superieur ou egal a 0'
  }

  if (form.value.montant_recu === null || form.value.montant_recu === undefined || form.value.montant_recu < 0) {
    formErrors.value.montant_recu = 'Le montant recu doit etre superieur ou egal a 0'
  }

  if (form.value.montant_prevu <= 0 && form.value.montant_recu <= 0) {
    formErrors.value.montant_prevu = 'Au moins un montant doit etre superieur a 0'
    formErrors.value.montant_recu = 'Au moins un montant doit etre superieur a 0'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const newRevenu = await projetsService.createRevenu(form.value)
    toast.success('Revenu enregistre avec succes')
    router.push(`/admin/revenus/${newRevenu.id}`)
  } catch (e: any) {
    console.error('Erreur creation revenu:', e)
    toast.error(e?.message || 'Erreur lors de l\'enregistrement du revenu')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadReferenceData()
})
</script>
