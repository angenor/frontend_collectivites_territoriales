<template>
  <div>
    <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
      Contenu texte
    </label>
    <p class="text-sm text-[var(--text-muted)] mb-3">
      Éditeur de texte riche pour créer du contenu structuré.
    </p>

    <!-- Editor.js container -->
    <div class="border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)]">
      <!-- Loading state -->
      <div v-if="!isReady" class="p-8 flex items-center justify-center">
        <UiLoadingSpinner size="md" />
        <span class="ml-3 text-[var(--text-muted)]">Chargement de l'éditeur...</span>
      </div>

      <!-- Editor container -->
      <div
        :id="editorId"
        class="editorjs-container min-h-[200px] p-4"
        :class="{ 'opacity-0': !isReady }"
      />
    </div>

    <!-- Help text -->
    <p class="mt-2 text-xs text-[var(--text-muted)]">
      Utilisez <kbd class="px-1 py-0.5 bg-[var(--interactive-hover)] rounded text-xs">Tab</kbd> pour ajouter des blocs.
      Sélectionnez du texte pour afficher les options de formatage.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import { useEditorJS } from '~/composables/useEditorJS'

interface EditorContent {
  blocks: any[]
  time?: number
  version?: string
}

const props = defineProps<{
  modelValue: EditorContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EditorContent]
}>()

// Generate unique ID for editor holder
const editorId = `editorjs-${Math.random().toString(36).substring(2, 9)}`

// Use the composable
const { isReady, save } = useEditorJS({
  holder: editorId,
  data: props.modelValue as OutputData,
  placeholder: 'Commencez à écrire ou appuyez sur Tab pour ajouter un bloc...',
  onChange: (data: OutputData) => {
    emit('update:modelValue', {
      blocks: data.blocks,
      time: data.time,
      version: data.version,
    })
  },
})

// Expose save method for parent components
defineExpose({
  save,
})
</script>

<style scoped>
/* Editor.js styling — éléments internes au conteneur */
.editorjs-container :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
}

.editorjs-container :deep(.ce-toolbar__content) {
  max-width: 100%;
}

/* Paragraph */
.editorjs-container :deep(.ce-paragraph) {
  line-height: 1.6;
  color: var(--text-primary);
}

/* Header */
.editorjs-container :deep(.ce-header) {
  color: var(--text-primary);
  font-weight: 600;
}

.editorjs-container :deep(h1.ce-header) {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.editorjs-container :deep(h2.ce-header) {
  font-size: 1.5rem;
  line-height: 2rem;
}

.editorjs-container :deep(h3.ce-header) {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.editorjs-container :deep(h4.ce-header) {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

/* List */
.editorjs-container :deep(.cdx-list) {
  padding-left: 1.5rem;
}

.editorjs-container :deep(.cdx-list__item) {
  padding: 0.25rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Quote */
.editorjs-container :deep(.cdx-quote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.editorjs-container :deep(.cdx-quote__text) {
  font-style: italic;
  color: var(--text-primary);
  min-height: auto;
}

.editorjs-container :deep(.cdx-quote__caption) {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Delimiter */
.editorjs-container :deep(.ce-delimiter) {
  text-align: center;
  color: var(--text-muted);
}

/* Placeholder */
.editorjs-container :deep([data-placeholder]:empty::before) {
  color: var(--text-muted);
}
</style>

<style>
/*
 * Editor.js — Styles globaux (non-scoped)
 * Les popovers, toolbars et menus flottants d'Editor.js peuvent être rendus
 * en dehors du composant (portés au body), donc les styles scoped :deep()
 * ne les atteignent pas. On utilise des styles globaux ici.
 */

/* Inline toolbar */
.ce-inline-toolbar {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
  box-shadow: var(--shadow-lg) !important;
}

.ce-inline-tool {
  color: var(--text-secondary) !important;
}

.ce-inline-tool:hover {
  background: var(--interactive-hover) !important;
}

.ce-inline-tool--active {
  color: var(--color-primary) !important;
}

/* Block toolbar (+, settings) */
.ce-toolbar__plus,
.ce-toolbar__settings-btn {
  color: var(--text-secondary) !important;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
}

.ce-toolbar__plus:hover,
.ce-toolbar__settings-btn:hover {
  background: var(--interactive-hover) !important;
}

/* Conversion toolbar */
.ce-conversion-toolbar {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
}

.ce-conversion-tool {
  color: var(--text-primary) !important;
}

.ce-conversion-tool:hover {
  background: var(--interactive-hover) !important;
}

/* Settings panel */
.ce-settings {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
  box-shadow: var(--shadow-lg) !important;
}

.cdx-settings-button {
  color: var(--text-secondary) !important;
}

.cdx-settings-button:hover {
  background: var(--interactive-hover) !important;
}

.cdx-settings-button--active {
  color: var(--color-primary) !important;
}

/* Popover (toolbox menu) */
.ce-popover {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
  box-shadow: var(--shadow-xl) !important;
}

.ce-popover__container {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
}

.ce-popover__overlay {
  background: transparent !important;
}

.ce-popover-item {
  color: var(--text-primary) !important;
}

.ce-popover-item:hover,
.ce-popover-item--focused {
  background: var(--interactive-hover) !important;
}

.ce-popover-item__icon {
  color: var(--text-secondary) !important;
  background: var(--interactive-hover) !important;
  border-radius: 0.375rem !important;
}

.ce-popover-item__title {
  color: var(--text-primary) !important;
}

.ce-popover-item__secondary-title {
  color: var(--text-muted) !important;
}

/* Search in popover */
.cdx-search-field {
  background: var(--interactive-hover) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.375rem !important;
}

.cdx-search-field__input {
  color: var(--text-primary) !important;
  background: transparent !important;
}

.cdx-search-field__icon svg {
  color: var(--text-muted) !important;
  fill: var(--text-muted) !important;
}
</style>
