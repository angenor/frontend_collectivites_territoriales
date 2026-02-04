<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/cms/pages"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux pages
    </NuxtLink>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouvelle page CMS
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Créer une nouvelle page pour un compte administratif
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Association commune / exercice -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Association commune / exercice</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Commune -->
          <UiFormSelect
            v-model="form.commune_id"
            label="Commune"
            :options="communeOptions"
            placeholder="Sélectionner une commune"
            required
            :error="formErrors.commune_id"
            hint="La page sera associée à cette commune"
          />

          <!-- Exercice -->
          <UiFormSelect
            v-model="form.exercice_id"
            label="Exercice budgétaire"
            :options="exerciceOptions"
            placeholder="Sélectionner un exercice"
            required
            :error="formErrors.exercice_id"
            hint="Année de l'exercice budgétaire"
          />
        </div>
      </div>

      <!-- Informations de la page -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations de la page</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre -->
          <UiFormInput
            v-model="form.titre"
            label="Titre de la page"
            placeholder="Ex: Compte Administratif 2024 - Antananarivo"
            :error="formErrors.titre"
            hint="Optionnel. Si vide, un titre sera généré automatiquement."
          />

          <!-- Sous-titre -->
          <UiFormInput
            v-model="form.sous_titre"
            label="Sous-titre"
            placeholder="Description courte de la page"
          />

          <!-- Meta description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.meta_description"
              label="Meta description (SEO)"
              placeholder="Description pour les moteurs de recherche"
              :rows="2"
            />
          </div>

          <!-- Image hero -->
          <div class="md:col-span-2">
            <UiFormInput
              v-model="form.image_hero_url"
              label="URL de l'image hero"
              placeholder="https://..."
              hint="Image d'en-tête de la page (optionnel)"
            />
          </div>
        </div>
      </div>

      <!-- Options d'affichage -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Options d'affichage</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Statut initial -->
          <UiFormSelect
            v-model="form.statut"
            label="Statut initial"
            :options="statutOptions"
          />

          <!-- Spacer -->
          <div></div>

          <!-- Afficher tableau financier -->
          <div class="flex items-center gap-3">
            <input
              id="afficher_tableau"
              v-model="form.afficher_tableau_financier"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
            />
            <label for="afficher_tableau" class="text-sm text-[var(--text-primary)] cursor-pointer">
              Afficher le tableau financier
            </label>
          </div>

          <!-- Afficher graphiques -->
          <div class="flex items-center gap-3">
            <input
              id="afficher_graphiques"
              v-model="form.afficher_graphiques"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
            />
            <label for="afficher_graphiques" class="text-sm text-[var(--text-primary)] cursor-pointer">
              Afficher les graphiques analytiques
            </label>
          </div>
        </div>
      </div>

      <!-- Preview card -->
      <div v-if="selectedCommune && selectedExercice" class="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'file-lines']" class="text-[var(--color-primary)] text-lg" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-[var(--text-primary)]">
              {{ form.titre || `Compte Administratif ${selectedExercice.annee} - ${selectedCommune.nom}` }}
            </p>
            <p class="text-sm text-[var(--text-muted)]">
              {{ selectedCommune.nom }} - Exercice {{ selectedExercice.annee }}
            </p>
          </div>
          <div class="text-right">
            <UiBadge :variant="form.statut === 'brouillon' ? 'warning' : form.statut === 'publie' ? 'success' : 'neutral'">
              {{ form.statut === 'brouillon' ? 'Brouillon' : form.statut === 'publie' ? 'Publiée' : 'Archivée' }}
            </UiBadge>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/cms/pages')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Créer la page
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { PageCMSFormData } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'
import { useGeoService } from '~/services/geo.service'
import { useExercicesService, type ExerciceList } from '~/services/exercices.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const cmsService = useCMSService()
const geoService = useGeoService()
const exercicesService = useExercicesService()
const toast = useAppToast()

// State
const communes = ref<Array<{ id: number; nom: string }>>([])
const exercices = ref<ExerciceList[]>([])
const saving = ref(false)

// Form
const form = ref<PageCMSFormData>({
  commune_id: '',
  exercice_id: '',
  titre: '',
  sous_titre: '',
  meta_description: '',
  image_hero_url: '',
  statut: 'brouillon',
  afficher_tableau_financier: true,
  afficher_graphiques: true,
})
const formErrors = ref<Record<string, string>>({})

// Computed
const selectedCommune = computed(() =>
  communes.value.find(c => c.id === Number(form.value.commune_id))
)

const selectedExercice = computed(() =>
  exercices.value.find(e => e.id === Number(form.value.exercice_id))
)

const communeOptions = computed(() =>
  communes.value.map(c => ({
    value: String(c.id),
    label: c.nom,
  }))
)

const exerciceOptions = computed(() =>
  exercices.value.map(e => ({
    value: String(e.id),
    label: `${e.annee}${e.cloture ? ' (clôturé)' : ''}`,
  }))
)

const statutOptions = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publie', label: 'Publiée' },
]

// Methods
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

  // Pre-fill si passé via query
  if (route.query.commune_id) {
    form.value.commune_id = Number(route.query.commune_id)
  }
  if (route.query.exercice_id) {
    form.value.exercice_id = Number(route.query.exercice_id)
  }
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.commune_id) {
    formErrors.value.commune_id = 'La commune est requise'
  }

  if (!form.value.exercice_id) {
    formErrors.value.exercice_id = 'L\'exercice est requis'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload: PageCMSFormData = {
      commune_id: Number(form.value.commune_id),
      exercice_id: Number(form.value.exercice_id),
      statut: form.value.statut,
      afficher_tableau_financier: form.value.afficher_tableau_financier,
      afficher_graphiques: form.value.afficher_graphiques,
    }

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (form.value.titre?.trim()) payload.titre = form.value.titre.trim()
    if (form.value.sous_titre?.trim()) payload.sous_titre = form.value.sous_titre.trim()
    if (form.value.meta_description?.trim()) payload.meta_description = form.value.meta_description.trim()
    if (form.value.image_hero_url?.trim()) payload.image_hero_url = form.value.image_hero_url.trim()

    const newPage = await cmsService.createPage(payload)
    toast.success('Page créée avec succès')
    router.push(`/admin/cms/pages/${newPage.id}`)
  } catch (e: any) {
    console.error('Erreur création page:', e)
    toast.error(e?.message || 'Erreur lors de la création de la page')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadReferenceData()
})
</script>
