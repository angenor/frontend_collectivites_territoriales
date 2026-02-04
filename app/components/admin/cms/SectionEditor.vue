<template>
  <div class="space-y-6">
    <!-- Section title -->
    <UiFormInput
      v-model="localSection.titre"
      label="Titre de la section"
      placeholder="Titre affiché (optionnel)"
    />

    <!-- Visibility toggles -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <input
          id="section_visible"
          v-model="localSection.visible"
          type="checkbox"
          class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
        />
        <label for="section_visible" class="text-sm text-[var(--text-primary)] cursor-pointer">
          Section visible sur la page
        </label>
      </div>
      <div class="flex items-center gap-3">
        <input
          id="section_visible_accueil"
          v-model="localSection.visible_accueil"
          type="checkbox"
          class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary)] cursor-pointer"
        />
        <label for="section_visible_accueil" class="text-sm text-[var(--text-muted)] cursor-pointer">
          Visible sur la page d'accueil
        </label>
      </div>
    </div>

    <hr class="border-[var(--border-default)]" />

    <!-- Content editor based on type -->
    <div class="min-h-[200px]">
      <!-- EditorJS / Texte riche -->
      <template v-if="localSection.type_section === 'editorjs'">
        <AdminCmsEditorJSBlock v-model="localConfig" />
      </template>

      <!-- Bloc image gauche/droite -->
      <template v-else-if="localSection.type_section === 'bloc_image_gauche' || localSection.type_section === 'bloc_image_droite'">
        <AdminCmsImageTextBlock
          v-model="localConfig"
          :image-position="localSection.type_section === 'bloc_image_gauche' ? 'left' : 'right'"
        />
      </template>

      <!-- Carte avec fond -->
      <template v-else-if="localSection.type_section === 'carte_fond_image'">
        <AdminCmsCardBackgroundEditor v-model="localConfig" />
      </template>

      <!-- Grille de cartes -->
      <template v-else-if="localSection.type_section === 'grille_cartes'">
        <AdminCmsCardsGridEditor v-model="localConfig" />
      </template>

      <!-- Galerie photos -->
      <template v-else-if="localSection.type_section === 'galerie_photos'">
        <AdminCmsGalleryEditor v-model="localConfig" />
      </template>

      <!-- Liens utiles -->
      <template v-else-if="localSection.type_section === 'liens_utiles'">
        <AdminCmsLinksEditor v-model="localConfig" />
      </template>

      <!-- Note informative -->
      <template v-else-if="localSection.type_section === 'note_informative'">
        <AdminCmsNoteEditor v-model="localConfig" />
      </template>

      <!-- Tableau financier -->
      <template v-else-if="localSection.type_section === 'tableau_financier'">
        <AdminCmsFinancialTableEditor v-model="localConfig" />
      </template>

      <!-- Graphiques -->
      <template v-else-if="localSection.type_section === 'graphiques_analytiques'">
        <AdminCmsChartEditor v-model="localConfig" />
      </template>

      <!-- Fallback -->
      <template v-else>
        <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p class="text-amber-800 dark:text-amber-200">
            Type de section non pris en charge : {{ localSection.type_section }}
          </p>
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
      <UiButton variant="outline" @click="$emit('cancel')">
        Annuler
      </UiButton>
      <UiButton variant="primary" @click="save" :icon="['fas', 'floppy-disk']">
        Enregistrer
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionCMS } from '~/services/cms.service'

interface Props {
  section: SectionCMS
}

const props = defineProps<Props>()
const emit = defineEmits<{
  save: [section: Partial<SectionCMS>]
  cancel: []
}>()

// Local copy of section to edit
const localSection = ref({
  ...props.section,
})

// Config is the JSONB config field for type-specific options
const localConfig = ref({ ...(props.section.config || {}) })

const save = () => {
  emit('save', {
    titre: localSection.value.titre,
    visible: localSection.value.visible,
    visible_accueil: localSection.value.visible_accueil,
    config: localConfig.value,
  })
}
</script>
