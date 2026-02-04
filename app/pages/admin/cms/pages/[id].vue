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

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <template v-else-if="page">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ isEditing ? 'Modifier la page' : (page.titre || `Page ${communeNom} - ${exerciceAnnee}`) }}
            </h1>
            <UiBadge :variant="getStatutVariant(page.statut)">
              {{ getStatutLabel(page.statut) }}
            </UiBadge>
          </div>
          <p v-if="!isEditing" class="text-sm text-[var(--text-secondary)]">
            {{ communeNom }} - Exercice {{ exerciceAnnee }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="!isEditing">
            <UiButton
              v-if="page.statut === 'brouillon'"
              variant="success"
              @click="publierPage"
              :icon="['fas', 'globe']"
            >
              Publier
            </UiButton>
            <UiButton
              v-if="page.statut === 'publie'"
              variant="outline"
              @click="archiverPage"
              :icon="['fas', 'box-archive']"
            >
              Archiver
            </UiButton>
            <UiButton
              v-if="page.statut === 'archive'"
              variant="outline"
              @click="depublierPage"
              :icon="['fas', 'rotate-left']"
            >
              Repasser en brouillon
            </UiButton>
            <UiButton variant="outline" @click="startEditing" :icon="['fas', 'edit']">
              Modifier
            </UiButton>
          </template>
          <template v-else>
            <UiButton variant="outline" @click="cancelEdit">
              Annuler
            </UiButton>
            <UiButton variant="primary" @click="saveChanges" :loading="saving" :icon="['fas', 'floppy-disk']">
              Enregistrer
            </UiButton>
          </template>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="space-y-6">
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations de la page</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UiFormInput
              v-model="form.titre"
              label="Titre de la page"
              placeholder="Titre affiché"
              :error="formErrors.titre"
            />

            <UiFormInput
              v-model="form.sous_titre"
              label="Sous-titre"
              placeholder="Description courte"
            />

            <div class="md:col-span-2">
              <UiFormTextarea
                v-model="form.meta_description"
                label="Meta description (SEO)"
                placeholder="Description pour les moteurs de recherche"
                :rows="2"
              />
            </div>

            <div class="md:col-span-2">
              <UiFormInput
                v-model="form.image_hero_url"
                label="URL de l'image hero"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Options d'affichage</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex items-center gap-3">
              <input
                id="edit_afficher_tableau"
                v-model="form.afficher_tableau_financier"
                type="checkbox"
                class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
              />
              <label for="edit_afficher_tableau" class="text-sm text-[var(--text-primary)] cursor-pointer">
                Afficher le tableau financier
              </label>
            </div>

            <div class="flex items-center gap-3">
              <input
                id="edit_afficher_graphiques"
                v-model="form.afficher_graphiques"
                type="checkbox"
                class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
              />
              <label for="edit_afficher_graphiques" class="text-sm text-[var(--text-primary)] cursor-pointer">
                Afficher les graphiques analytiques
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Page info cards (view mode) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Info card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Informations</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Commune</span>
              <span class="text-[var(--text-primary)]">{{ communeNom }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Exercice</span>
              <span class="text-[var(--text-primary)]">{{ exerciceAnnee }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Créée le</span>
              <span class="text-[var(--text-primary)]">{{ formatDate(page.created_at) }}</span>
            </div>
            <div v-if="page.date_publication" class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Publiée le</span>
              <span class="text-[var(--text-primary)]">{{ formatDate(page.date_publication) }}</span>
            </div>
          </div>
        </div>

        <!-- Options card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Options</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-[var(--text-secondary)]">Tableau financier</span>
              <UiBadge :variant="page.afficher_tableau_financier ? 'success' : 'neutral'" size="sm">
                {{ page.afficher_tableau_financier ? 'Oui' : 'Non' }}
              </UiBadge>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[var(--text-secondary)]">Graphiques</span>
              <UiBadge :variant="page.afficher_graphiques ? 'success' : 'neutral'" size="sm">
                {{ page.afficher_graphiques ? 'Oui' : 'Non' }}
              </UiBadge>
            </div>
            <div v-if="page.meta_description">
              <span class="text-[var(--text-secondary)]">Meta description</span>
              <p class="text-[var(--text-primary)] line-clamp-2 mt-1">{{ page.meta_description }}</p>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Contenu</h3>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="text-[var(--color-primary)] text-xl" />
            </div>
            <div>
              <p class="text-2xl font-bold text-[var(--text-primary)]">{{ sections.length }}</p>
              <p class="text-sm text-[var(--text-muted)]">section(s)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description / sous-titre -->
      <div v-if="!isEditing && page.sous_titre" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
        <p class="text-[var(--text-secondary)]">{{ page.sous_titre }}</p>
      </div>

      <!-- Sections management -->
      <div v-if="!isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]">
        <div class="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">Sections</h2>
          <UiButton variant="primary" size="sm" @click="openAddSectionModal" :icon="['fas', 'plus']">
            Ajouter une section
          </UiButton>
        </div>

        <div v-if="sections.length === 0" class="p-8 text-center">
          <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="text-4xl text-[var(--text-muted)] mb-4" />
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucune section</h3>
          <p class="text-[var(--text-secondary)] mb-4">Ajoutez des sections pour construire le contenu de cette page.</p>
          <UiButton variant="primary" @click="openAddSectionModal" :icon="['fas', 'plus']">
            Ajouter une section
          </UiButton>
        </div>

        <div v-else class="divide-y divide-[var(--border-default)]">
          <div
            v-for="(section, index) in sections"
            :key="section.id"
            class="p-4 flex items-center gap-4 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <!-- Drag handle -->
            <div class="cursor-move text-[var(--text-muted)]">
              <font-awesome-icon :icon="['fas', 'grip-vertical']" />
            </div>

            <!-- Section info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <font-awesome-icon :icon="getSectionIcon(section.type_section)" class="text-[var(--color-primary)]" />
                <span class="font-medium text-[var(--text-primary)]">
                  {{ section.titre || getSectionTypeLabel(section.type_section) }}
                </span>
                <UiBadge v-if="!section.visible" variant="neutral" size="sm">
                  Masquée
                </UiBadge>
                <UiBadge v-if="section.visible_accueil" variant="info" size="sm">
                  Accueil
                </UiBadge>
              </div>
              <p class="text-sm text-[var(--text-muted)]">
                {{ getSectionTypeLabel(section.type_section) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button
                @click="moveSection(index, -1)"
                :disabled="index === 0"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Monter"
              >
                <font-awesome-icon :icon="['fas', 'chevron-up']" />
              </button>
              <button
                @click="moveSection(index, 1)"
                :disabled="index === sections.length - 1"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Descendre"
              >
                <font-awesome-icon :icon="['fas', 'chevron-down']" />
              </button>
              <button
                @click="toggleVisibility(section)"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded cursor-pointer"
                :title="section.visible ? 'Masquer' : 'Afficher'"
              >
                <font-awesome-icon :icon="section.visible ? ['fas', 'eye'] : ['fas', 'eye-slash']" />
              </button>
              <button
                @click="editSection(section)"
                class="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded cursor-pointer"
                title="Modifier"
              >
                <font-awesome-icon :icon="['fas', 'edit']" />
              </button>
              <button
                @click="confirmDeleteSection(section)"
                class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                title="Supprimer"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add section modal -->
    <UiModal v-model="showAddSectionModal" title="Ajouter une section" size="lg">
      <p class="text-[var(--text-secondary)] mb-4">
        Choisissez le type de section à ajouter :
      </p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="type in sectionTypes"
          :key="type.value"
          @click="createSection(type.value)"
          class="p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-left cursor-pointer"
        >
          <font-awesome-icon :icon="getSectionIcon(type.value)" class="text-[var(--color-primary)] text-xl mb-2" />
          <p class="font-medium text-[var(--text-primary)]">{{ type.label }}</p>
          <p class="text-xs text-[var(--text-muted)]">{{ type.description }}</p>
        </button>
      </div>
    </UiModal>

    <!-- Edit section modal -->
    <UiModal v-model="showEditSectionModal" :title="editingSection?.titre || 'Modifier la section'" size="xl">
      <AdminCmsSectionEditor
        v-if="editingSection"
        :section="editingSection"
        @save="saveSectionChanges"
        @cancel="showEditSectionModal = false"
      />
    </UiModal>

    <!-- Delete section confirmation -->
    <UiModal v-model="showDeleteSectionModal" title="Supprimer la section" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer cette section ?
        Cette action est irréversible.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="showDeleteSectionModal = false">
            Annuler
          </UiButton>
          <UiButton variant="danger" @click="deleteSection" :loading="deletingSection">
            Supprimer
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PageCMS, SectionCMS, SectionType, PageCMSUpdateData } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'
import { useGeoService } from '~/services/geo.service'
import { useExercicesService } from '~/services/exercices.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const cmsService = useCMSService()
const geoService = useGeoService()
const exercicesService = useExercicesService()
const toast = useAppToast()

// State
const page = ref<PageCMS | null>(null)
const sections = ref<SectionCMS[]>([])
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)

// Reference data
const communeNom = ref('')
const exerciceAnnee = ref<number | string>('')

// Form
const form = ref<PageCMSUpdateData>({
  titre: '',
  sous_titre: '',
  meta_description: '',
  image_hero_url: '',
  afficher_tableau_financier: true,
  afficher_graphiques: true,
})
const formErrors = ref<Record<string, string>>({})

// Section modals
const showAddSectionModal = ref(false)
const showEditSectionModal = ref(false)
const showDeleteSectionModal = ref(false)
const editingSection = ref<SectionCMS | null>(null)
const sectionToDelete = ref<SectionCMS | null>(null)
const deletingSection = ref(false)

// Section types
const sectionTypes = cmsService.getSectionTypes()

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

const getSectionIcon = (type: SectionType): string[] => {
  const icons: Record<SectionType, string[]> = {
    editorjs: ['fas', 'align-left'],
    bloc_image_gauche: ['fas', 'image'],
    bloc_image_droite: ['fas', 'image'],
    carte_fond_image: ['fas', 'id-card'],
    grille_cartes: ['fas', 'table-cells-large'],
    galerie_photos: ['fas', 'images'],
    liens_utiles: ['fas', 'link'],
    note_informative: ['fas', 'info-circle'],
    tableau_financier: ['fas', 'table'],
    graphiques_analytiques: ['fas', 'chart-bar'],
  }
  return icons[type] || ['fas', 'puzzle-piece']
}

const getSectionTypeLabel = (type: SectionType) => {
  const found = sectionTypes.find(t => t.value === type)
  return found?.label || type
}

const loadPage = async () => {
  loading.value = true
  const pageId = Number(route.params.id)

  try {
    const [pageData, sectionsData] = await Promise.all([
      cmsService.getPage(pageId),
      cmsService.getSections(pageId),
    ])
    page.value = pageData
    sections.value = sectionsData.sort((a, b) => a.ordre - b.ordre)

    // Populate form
    populateForm(pageData)

    // Load commune and exercice names
    await loadReferenceNames(pageData.commune_id, pageData.exercice_id)
  } catch (e) {
    console.error('Erreur chargement page:', e)
    toast.error('Erreur lors du chargement de la page')
  } finally {
    loading.value = false
  }
}

const loadReferenceNames = async (communeId: number, exerciceId: number) => {
  try {
    const [commune, exercice] = await Promise.all([
      geoService.getCommune(communeId),
      exercicesService.getExercice(exerciceId),
    ])
    communeNom.value = commune.nom
    exerciceAnnee.value = exercice.annee
  } catch (e) {
    communeNom.value = `Commune #${communeId}`
    exerciceAnnee.value = exerciceId
  }
}

const populateForm = (pageData: PageCMS) => {
  form.value = {
    titre: pageData.titre || '',
    sous_titre: pageData.sous_titre || '',
    meta_description: pageData.meta_description || '',
    image_hero_url: pageData.image_hero_url || '',
    afficher_tableau_financier: pageData.afficher_tableau_financier,
    afficher_graphiques: pageData.afficher_graphiques,
  }
}

const startEditing = () => {
  if (page.value) {
    populateForm(page.value)
  }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  if (page.value) {
    populateForm(page.value)
  }
}

const saveChanges = async () => {
  formErrors.value = {}

  saving.value = true
  try {
    const updateData: PageCMSUpdateData = {}

    // N'envoyer que les champs modifiés
    if (form.value.titre !== (page.value?.titre || '')) {
      updateData.titre = form.value.titre || undefined
    }
    if (form.value.sous_titre !== (page.value?.sous_titre || '')) {
      updateData.sous_titre = form.value.sous_titre || undefined
    }
    if (form.value.meta_description !== (page.value?.meta_description || '')) {
      updateData.meta_description = form.value.meta_description || undefined
    }
    if (form.value.image_hero_url !== (page.value?.image_hero_url || '')) {
      updateData.image_hero_url = form.value.image_hero_url || undefined
    }
    if (form.value.afficher_tableau_financier !== page.value?.afficher_tableau_financier) {
      updateData.afficher_tableau_financier = form.value.afficher_tableau_financier
    }
    if (form.value.afficher_graphiques !== page.value?.afficher_graphiques) {
      updateData.afficher_graphiques = form.value.afficher_graphiques
    }

    const updated = await cmsService.updatePage(page.value!.id, updateData)
    page.value = updated
    toast.success('Page mise à jour avec succès')
    isEditing.value = false
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const publierPage = async () => {
  try {
    const updated = await cmsService.publierPage(page.value!.id)
    page.value = updated
    toast.success('Page publiée avec succès')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la publication')
  }
}

const archiverPage = async () => {
  try {
    const updated = await cmsService.archiverPage(page.value!.id)
    page.value = updated
    toast.success('Page archivée avec succès')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de l\'archivage')
  }
}

const depublierPage = async () => {
  try {
    const updated = await cmsService.depublierPage(page.value!.id)
    page.value = updated
    toast.success('Page repassée en brouillon')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors du changement de statut')
  }
}

// Section management
const openAddSectionModal = () => {
  showAddSectionModal.value = true
}

const createSection = async (type: SectionType) => {
  try {
    const newSection = await cmsService.createSection({
      page_id: page.value!.id,
      type_section: type,
      ordre: sections.value.length,
      visible: true,
    })
    sections.value.push(newSection)
    showAddSectionModal.value = false
    toast.success('Section ajoutée')
    editSection(newSection)
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la création de la section')
  }
}

const editSection = (section: SectionCMS) => {
  editingSection.value = { ...section }
  showEditSectionModal.value = true
}

const saveSectionChanges = async (updatedData: Partial<SectionCMS>) => {
  if (!editingSection.value) return

  try {
    const updated = await cmsService.updateSection(editingSection.value.id, {
      titre: updatedData.titre,
      visible: updatedData.visible,
      config: updatedData.config,
    })
    const index = sections.value.findIndex(s => s.id === editingSection.value!.id)
    if (index !== -1) {
      sections.value[index] = updated
    }
    showEditSectionModal.value = false
    toast.success('Section mise à jour')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour de la section')
  }
}

const confirmDeleteSection = (section: SectionCMS) => {
  sectionToDelete.value = section
  showDeleteSectionModal.value = true
}

const deleteSection = async () => {
  if (!sectionToDelete.value) return

  deletingSection.value = true
  try {
    await cmsService.deleteSection(sectionToDelete.value.id)
    sections.value = sections.value.filter(s => s.id !== sectionToDelete.value!.id)
    showDeleteSectionModal.value = false
    toast.success('Section supprimée')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deletingSection.value = false
  }
}

const toggleVisibility = async (section: SectionCMS) => {
  try {
    const updated = await cmsService.updateSection(section.id, {
      visible: !section.visible,
    })
    const index = sections.value.findIndex(s => s.id === section.id)
    if (index !== -1) {
      sections.value[index] = updated
    }
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors du changement de visibilité')
  }
}

const moveSection = async (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= sections.value.length) return

  const temp = sections.value[index]
  sections.value[index] = sections.value[newIndex]
  sections.value[newIndex] = temp

  // Update ordre
  sections.value.forEach((s, i) => {
    s.ordre = i
  })

  try {
    await cmsService.reorderSections(
      page.value!.id,
      sections.value.map(s => s.id)
    )
  } catch (e) {
    console.error('Erreur réordonnement:', e)
  }
}

// Load on mount
onMounted(() => {
  loadPage()
})
</script>
