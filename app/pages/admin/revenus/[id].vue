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

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <UiSkeleton class="h-8 w-64 mb-4" />
        <UiSkeleton class="h-4 w-48 mb-2" />
        <UiSkeleton class="h-4 w-32" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadRevenu"
    />

    <!-- Content -->
    <template v-else-if="revenu">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Revenu minier
            </h1>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getTypeRevenuClass(revenu.type_revenu)
              ]"
            >
              {{ getTypeRevenuLabel(revenu.type_revenu) }}
            </span>
          </div>
          <p class="text-sm text-[var(--text-muted)]">
            Exercice {{ revenu.exercice_annee || revenu.exercice_id }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="!isEditing"
            variant="primary"
            :icon="['fas', 'edit']"
            @click="startEditing"
          >
            Modifier
          </UiButton>
          <template v-else>
            <UiButton variant="outline" @click="cancelEditing">
              Annuler
            </UiButton>
            <UiButton
              variant="primary"
              :loading="saving"
              @click="saveChanges"
            >
              Enregistrer
            </UiButton>
          </template>
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Montants card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Montants</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--text-muted)]">Prevu</span>
              <span class="font-semibold text-[var(--text-primary)]">{{ formatMoney(revenu.montant_prevu) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--text-muted)]">Recu</span>
              <span class="text-xl font-bold text-[var(--color-primary)]">{{ formatMoney(revenu.montant_recu) }}</span>
            </div>
            <div class="pt-2 border-t border-[var(--border-light)] flex items-center justify-between">
              <span class="text-sm text-[var(--text-muted)]">Ecart</span>
              <span
                :class="[
                  'font-semibold text-sm',
                  viewEcart >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ formatMoney(viewEcart) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Projet card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Projet minier</h3>
          <NuxtLink
            v-if="revenu.projet"
            :to="`/admin/projets/${revenu.projet_id}`"
            class="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'gem']" class="text-[var(--color-secondary)]" />
            <div>
              <p class="font-medium">{{ revenu.projet.nom }}</p>
              <p class="text-xs text-[var(--text-muted)]">{{ revenu.projet.type_minerai }}</p>
            </div>
          </NuxtLink>
          <p v-else class="font-medium text-[var(--text-primary)]">
            {{ revenu.projet_nom || `Projet #${revenu.projet_id}` }}
          </p>
        </div>

        <!-- Commune card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Commune beneficiaire</h3>
          <NuxtLink
            v-if="revenu.commune"
            :to="`/admin/geo/communes/${revenu.commune_id}`"
            class="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--color-primary)]" />
            <p class="font-medium">{{ revenu.commune.nom }}</p>
          </NuxtLink>
          <p v-else class="font-medium text-[var(--text-primary)]">
            {{ revenu.commune_nom || `Commune #${revenu.commune_id}` }}
          </p>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="space-y-6">
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
              <span :class="formEcart >= 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                {{ formatMoney(formEcart) }}
              </span>
            </div>
            <div v-if="form.montant_prevu > 0" class="flex items-center justify-between text-sm mt-1">
              <span class="text-[var(--text-muted)]">Taux de realisation</span>
              <span class="font-semibold text-[var(--text-primary)]">
                {{ formTauxRealisation.toFixed(1) }} %
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
      </div>

      <!-- View mode details -->
      <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Details</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p class="text-sm text-[var(--text-muted)]">Type</p>
            <p class="text-[var(--text-primary)]">{{ getTypeRevenuLabel(revenu.type_revenu) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Montant prevu</p>
            <p class="font-mono text-[var(--text-primary)] font-semibold">{{ formatMoney(revenu.montant_prevu) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Montant recu</p>
            <p class="font-mono text-[var(--color-primary)] font-semibold">{{ formatMoney(revenu.montant_recu) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Ecart</p>
            <p
              :class="[
                'font-mono font-semibold',
                viewEcart >= 0 ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ formatMoney(viewEcart) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Taux de realisation</p>
            <p class="text-[var(--text-primary)] font-semibold">
              {{ revenu.montant_prevu > 0 ? ((revenu.montant_recu / revenu.montant_prevu) * 100).toFixed(1) : '0.0' }} %
            </p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Exercice</p>
            <p class="text-[var(--text-primary)]">{{ revenu.exercice_annee || revenu.exercice_id }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Compte comptable</p>
            <p class="text-[var(--text-primary)]">
              {{ revenu.compte_code }}{{ revenu.compte_intitule ? ` - ${revenu.compte_intitule}` : '' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Compte administratif</p>
            <p class="text-[var(--text-primary)]">
              {{ revenu.compte_administratif_label || `#${revenu.compte_administratif_id}` }}
            </p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Date de reception</p>
            <p class="text-[var(--text-primary)]">{{ revenu.date_reception ? formatDate(revenu.date_reception) : '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Reference de paiement</p>
            <p class="text-[var(--text-primary)]">{{ revenu.reference_paiement || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-[var(--text-muted)]">Commentaire</p>
            <p class="text-[var(--text-primary)]">{{ revenu.commentaire || '-' }}</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-[var(--text-muted)]">Cree le</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(revenu.created_at) }}</p>
          </div>
          <div>
            <p class="text-[var(--text-muted)]">Derniere modification</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(revenu.updated_at) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinier, RevenuMinierFormData, ProjetMinierWithStats } from '~/types/projets-miniers'
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
const projetsService = useProjetsService()
const geoService = useGeoService()
const exercicesService = useExercicesService()
const toast = useAppToast()

// State
const revenu = ref<RevenuMinier | null>(null)
const projets = ref<ProjetMinierWithStats[]>([])
const communes = ref<CommuneWithStats[]>([])
const exercices = ref<ExerciceList[]>([])
const planComptableCodes = ref<Array<{ code: string; intitule: string }>>([])
const comptesAdministratifs = ref<Array<{ id: number; commune_id: number; exercice_id: number; commune_nom?: string; annee?: number }>>([])
const loadingComptesAdmin = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
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

// Computed - view mode
const viewEcart = computed(() => {
  if (!revenu.value) return 0
  return revenu.value.montant_recu - revenu.value.montant_prevu
})

// Computed - form mode
const formEcart = computed(() => form.value.montant_recu - form.value.montant_prevu)

const formTauxRealisation = computed(() => {
  if (form.value.montant_prevu <= 0) return 0
  return (form.value.montant_recu / form.value.montant_prevu) * 100
})

// Options
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

// Type labels for view mode
const typeRevenuLabels: Record<string, string> = {
  ristourne_miniere: 'Ristourne miniere',
  redevance_miniere: 'Redevance miniere',
  frais_administration_miniere: 'Frais d\'administration miniere',
  quote_part_ristourne: 'Quote-part de ristourne',
  autre: 'Autre',
}

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
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getTypeRevenuLabel = (type: string) => {
  return typeRevenuLabels[type] || type
}

const getTypeRevenuClass = (type: string) => {
  const classes: Record<string, string> = {
    ristourne_miniere: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    redevance_miniere: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    frais_administration_miniere: 'bg-amber-500/10 text-amber-600',
    quote_part_ristourne: 'bg-blue-500/10 text-blue-600',
    autre: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
  }
  return classes[type] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
}

const loadReferenceData = async () => {
  try {
    const [projetsData, communesData, exercicesData, planComptableData] = await Promise.all([
      projetsService.getProjets({ limit: 100 }),
      geoService.getCommunes({ limit: 500 }),
      exercicesService.getExercices(),
      projetsService.getPlanComptableForRevenus(),
    ])
    projets.value = projetsData.items
    communes.value = communesData.items
    exercices.value = Array.isArray(exercicesData) ? exercicesData : []
    planComptableCodes.value = Array.isArray(planComptableData) ? planComptableData : []
  } catch (e) {
    console.error('Erreur chargement donnees de reference:', e)
    projets.value = [
      { id: '1', nom: 'Site de Mandena', code: 'QMM-MAN', type_minerai: 'Ilmenite', societe_id: 1, societe_exploitante: 'QMM', statut: 'en_cours', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Mine', code: 'AMB-001', type_minerai: 'Nickel', societe_id: 2, societe_exploitante: 'Ambatovy', statut: 'en_cours', created_at: '', updated_at: '' },
    ]
    communes.value = []
    exercices.value = []
    planComptableCodes.value = []
  }
}

const loadRevenu = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'ID de revenu invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    revenu.value = await projetsService.getRevenu(id)
  } catch (e: any) {
    console.error('Erreur chargement revenu:', e)
    error.value = e?.message || 'Erreur lors du chargement du revenu'

    // Mock data
    revenu.value = {
      id,
      projet_id: 1,
      commune_id: 1,
      exercice_id: 1,
      type_revenu: 'ristourne_miniere',
      montant_prevu: 150000000,
      montant_recu: 125000000,
      date_reception: '2024-09-30',
      reference_paiement: 'ORD-2024-003',
      compte_code: '721',
      compte_administratif_id: 1,
      commentaire: 'Ristourne issue des activites du site de Mandena',
      created_at: '2024-10-01T10:30:00Z',
      updated_at: '2024-10-15T14:45:00Z',
      projet: { id: 1, nom: 'Site de Mandena', type_minerai: 'Ilmenite' },
      commune: { id: 1, code: 'TFD', nom: 'Fort Dauphin' },
      compte_intitule: 'Ristournes minieres',
      compte_administratif_label: 'Fort Dauphin - 2024 (#1)',
      exercice_annee: 2024,
      projet_nom: 'Site de Mandena',
      commune_nom: 'Fort Dauphin',
    }
    error.value = null
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  if (!revenu.value) return

  form.value = {
    projet_id: String(revenu.value.projet_id),
    commune_id: String(revenu.value.commune_id),
    exercice_id: String(revenu.value.exercice_id),
    type_revenu: revenu.value.type_revenu,
    montant_prevu: revenu.value.montant_prevu,
    montant_recu: revenu.value.montant_recu,
    date_reception: revenu.value.date_reception || null,
    reference_paiement: revenu.value.reference_paiement || null,
    compte_code: revenu.value.compte_code,
    compte_administratif_id: revenu.value.compte_administratif_id,
    commentaire: revenu.value.commentaire || null,
  }
  formErrors.value = {}
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  formErrors.value = {}
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

const saveChanges = async () => {
  if (!validateForm() || !revenu.value) return

  saving.value = true
  try {
    await projetsService.updateRevenu(revenu.value.id, form.value)
    toast.success('Revenu mis a jour avec succes')
    isEditing.value = false
    await loadRevenu()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise a jour')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(async () => {
  await loadReferenceData()
  await loadRevenu()

  // Start editing if query param is set
  if (route.query.edit === 'true' && revenu.value) {
    startEditing()
  }
})

// Watch for edit query param
watch(() => route.query.edit, (edit) => {
  if (edit === 'true' && revenu.value) {
    startEditing()
  }
})
</script>
