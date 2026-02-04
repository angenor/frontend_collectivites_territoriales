<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Import de Données
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Importez un compte administratif depuis un fichier Excel
      </p>
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column: Upload and configuration -->
      <div class="lg:col-span-2 space-y-6">
        <!-- File dropzone -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            1. Sélectionner un fichier
          </h2>

          <div
            ref="dropzoneRef"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)]'
            ]"
            @click="openFileDialog"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls"
              class="hidden"
              @change="handleFileSelect"
            />

            <template v-if="!selectedFile">
              <font-awesome-icon
                :icon="['fas', 'cloud-upload-alt']"
                class="text-4xl text-[var(--text-muted)] mb-4"
              />
              <p class="text-[var(--text-primary)] font-medium mb-2">
                Glissez-déposez un fichier ici
              </p>
              <p class="text-sm text-[var(--text-muted)]">
                ou cliquez pour sélectionner
              </p>
              <p class="text-xs text-[var(--text-muted)] mt-2">
                Format accepté: Excel (.xlsx, .xls)
              </p>
            </template>

            <template v-else>
              <div class="flex items-center justify-center gap-4">
                <font-awesome-icon
                  :icon="['fas', 'file-excel']"
                  class="text-3xl text-[var(--color-success)]"
                />
                <div class="text-left">
                  <p class="font-medium text-[var(--text-primary)]">
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-sm text-[var(--text-muted)]">
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="['fas', 'times']"
                  class="text-[var(--color-error)]"
                  @click.stop="clearFile"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- Configuration -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            2. Configuration
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Region -->
            <UiFormSelect
              v-model="importConfig.region_id"
              label="Région"
              :options="regionOptions"
              placeholder="Sélectionner une région"
              @update:model-value="handleRegionChange"
            />

            <!-- Commune -->
            <UiFormSelect
              v-model="importConfig.commune_id"
              label="Commune"
              :options="communeOptions"
              placeholder="Sélectionner une commune"
              :disabled="!importConfig.region_id"
              required
            />

            <!-- Exercice -->
            <UiFormSelect
              v-model="importConfig.exercice_id"
              label="Exercice"
              :options="exerciceOptions"
              placeholder="Sélectionner un exercice"
              required
            />
          </div>

          <!-- Options -->
          <div class="mt-4 pt-4 border-t border-[var(--border-light)]">
            <div class="flex items-center gap-4">
              <UiFormCheckbox
                v-model="importConfig.updateExisting"
                label="Mettre à jour les données existantes"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div
          v-if="previewData.length"
          class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6"
        >
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            3. Prévisualisation
          </h2>

          <div v-for="sheet in previewData" :key="sheet.name" class="mb-4 last:mb-0">
            <h3 class="text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Feuille: {{ sheet.name }}
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--border-default)]">
                    <th
                      v-for="(header, index) in sheet.headers"
                      :key="index"
                      class="text-left py-2 px-3 font-medium text-[var(--text-secondary)] whitespace-nowrap"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in sheet.rows.slice(0, 5)"
                    :key="rowIndex"
                    class="border-b border-[var(--border-light)]"
                  >
                    <td
                      v-for="(cell, cellIndex) in row"
                      :key="cellIndex"
                      class="py-2 px-3 text-[var(--text-primary)] whitespace-nowrap"
                    >
                      {{ cell ?? '' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs text-[var(--text-muted)] mt-2">
              Affichage des {{ Math.min(5, sheet.rows.length) }} premières lignes sur {{ sheet.rows.length }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <UiButton
            variant="outline"
            @click="resetForm"
          >
            Réinitialiser
          </UiButton>
          <UiButton
            variant="primary"
            :icon="['fas', 'upload']"
            :loading="isImporting"
            :disabled="!canImport"
            @click="handleImport"
          >
            Importer les données
          </UiButton>
        </div>
      </div>

      <!-- Right column: Template and info -->
      <div class="space-y-6">
        <!-- Template download -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            Modèle
          </h2>

          <div class="space-y-3">
            <button
              class="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)] transition-all cursor-pointer"
              :disabled="isGeneratingTemplate"
              @click="downloadTemplate"
            >
              <div class="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center text-[var(--color-primary)]">
                <font-awesome-icon
                  v-if="!isGeneratingTemplate"
                  :icon="['fas', 'file-excel']"
                />
                <font-awesome-icon
                  v-else
                  :icon="['fas', 'spinner']"
                  class="animate-spin"
                />
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-sm font-medium text-[var(--text-primary)]">
                  Compte administratif
                </p>
                <p class="text-xs text-[var(--text-muted)]">
                  Fichier Excel (.xlsx)
                </p>
              </div>
              <font-awesome-icon
                :icon="['fas', 'download']"
                class="text-[var(--text-muted)]"
              />
            </button>
          </div>

          <p class="text-xs text-[var(--text-muted)] mt-3">
            Le fichier doit contenir une feuille "Recettes" et/ou "Dépenses" avec les colonnes attendues.
          </p>
        </div>

        <!-- Format info -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            Format attendu
          </h2>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-1">Feuille Recettes</h3>
              <p class="text-xs text-[var(--text-muted)]">
                Colonnes: Code, Intitulé, Budget Primitif, Budget Additionnel, Modifications,
                Prévisions Définitives, OR Admis, Recouvrement, Reste à Recouvrer
              </p>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-1">Feuille Dépenses</h3>
              <p class="text-xs text-[var(--text-muted)]">
                Colonnes: Code, Intitulé, Budget Primitif, Budget Additionnel, Modifications,
                Prévisions Définitives, Engagement, Mandat Admis, Paiement, Reste à Payer
              </p>
            </div>

            <div class="pt-2 border-t border-[var(--border-light)]">
              <ul class="text-xs text-[var(--text-muted)] space-y-1">
                <li>Les codes comptables doivent correspondre au plan comptable</li>
                <li>Les lignes avec un code vide sont ignorées</li>
                <li>Max 10 Mo par fichier</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import result modal -->
    <UiModal
      v-model="showResultModal"
      :title="importResult?.success ? 'Import réussi' : 'Résultat de l\'import'"
      size="md"
    >
      <div v-if="importResult">
        <div
          :class="[
            'p-4 rounded-lg mb-4',
            importResult.success ? 'bg-[var(--color-success-light)]' : 'bg-[var(--color-warning-light)]'
          ]"
        >
          <div class="flex items-center gap-3">
            <font-awesome-icon
              :icon="['fas', importResult.success ? 'check-circle' : 'exclamation-triangle']"
              :class="importResult.success ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'"
              class="text-xl"
            />
            <div>
              <p class="font-medium text-[var(--text-primary)]">
                {{ importResult.success ? 'Import terminé avec succès' : 'Import terminé avec des erreurs' }}
              </p>
              <p class="text-sm text-[var(--text-secondary)]">
                {{ importResult.total_imported }} lignes importées, {{ importResult.total_updated }} mises à jour
              </p>
              <p v-if="importResult.recettes_imported || importResult.recettes_updated" class="text-xs text-[var(--text-muted)]">
                Recettes: {{ importResult.recettes_imported }} importées, {{ importResult.recettes_updated }} mises à jour
              </p>
              <p v-if="importResult.depenses_imported || importResult.depenses_updated" class="text-xs text-[var(--text-muted)]">
                Dépenses: {{ importResult.depenses_imported }} importées, {{ importResult.depenses_updated }} mises à jour
              </p>
            </div>
          </div>
        </div>

        <!-- Errors list -->
        <div v-if="importResult.errors?.length" class="mb-4">
          <h4 class="font-medium text-[var(--text-primary)] mb-2">
            Erreurs ({{ importResult.errors.length }})
          </h4>
          <div class="max-h-48 overflow-y-auto space-y-2">
            <div
              v-for="(error, index) in importResult.errors"
              :key="index"
              class="p-2 rounded bg-[var(--color-error-light)] text-sm"
            >
              <span class="font-mono text-[var(--color-error)]">
                {{ error.row ? `Ligne ${error.row}` : 'Général' }}{{ error.column ? ` (col ${error.column})` : '' }}:
              </span>
              <span class="text-[var(--text-primary)] ml-2">{{ error.message }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <UiButton
            variant="primary"
            @click="showResultModal = false"
          >
            Fermer
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import ExcelJS from 'exceljs'
import type { ImportResult } from '~/services/import.service'

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()
const importService = useImportService()
const geoService = useGeoService()
const exercicesService = useExercicesService()

// ============================================================================
// STATE
// ============================================================================

const dropzoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const isGeneratingTemplate = ref(false)

const importConfig = reactive({
  region_id: null as number | null,
  commune_id: null as number | null,
  exercice_id: null as number | null,
  updateExisting: true,
})

const previewData = ref<Array<{
  name: string
  headers: string[]
  rows: any[][]
}>>([])

const showResultModal = ref(false)
const importResult = ref<ImportResult | null>(null)

// Geography & exercice data
const regions = ref<Array<{ id: number; nom: string }>>([])
const communes = ref<Array<{ id: number; nom: string; region_id?: number }>>([])
const exercices = ref<Array<{ id: number; annee: number; cloture: boolean }>>([])

// ============================================================================
// COMPUTED
// ============================================================================

const regionOptions = computed(() => [
  { value: '', label: 'Sélectionner une région' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

const communeOptions = computed(() => {
  const filtered = importConfig.region_id
    ? communes.value.filter(c => c.region_id === importConfig.region_id)
    : communes.value
  return [
    { value: '', label: 'Sélectionner une commune' },
    ...filtered.map(c => ({ value: c.id, label: c.nom })),
  ]
})

const exerciceOptions = computed(() => {
  const openExercices = exercices.value.filter(e => !e.cloture)
  if (openExercices.length === 0) {
    return [{ value: '', label: 'Aucun exercice ouvert' }]
  }
  return [
    { value: '', label: 'Sélectionner un exercice' },
    ...openExercices.map(e => ({ value: e.id, label: String(e.annee) })),
  ]
})

const canImport = computed(() => {
  return selectedFile.value && importConfig.commune_id && importConfig.exercice_id
})

// ============================================================================
// METHODS
// ============================================================================

const openFileDialog = () => {
  fileInputRef.value?.click()
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    processFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    processFile(input.files[0])
  }
}

const processFile = async (file: File) => {
  const validExtensions = ['.xlsx', '.xls']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!validExtensions.includes(extension)) {
    toast.error('Format de fichier non supporté. Utilisez un fichier Excel (.xlsx, .xls).')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('Le fichier est trop volumineux (max 10 Mo).')
    return
  }

  selectedFile.value = file

  // Client-side preview using ExcelJS
  try {
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheets: typeof previewData.value = []

    workbook.eachSheet((worksheet) => {
      const headers: string[] = []
      const rows: any[][] = []
      let headerRow: number | null = null

      // Find the header or first data row
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 20) return // Don't scan too far

        const values = row.values as any[]
        // Skip the first element (ExcelJS 1-indexed)
        const cells = values.slice(1)

        if (!headerRow) {
          // Look for a row that starts with "Code" or similar header
          const firstCell = String(cells[0] || '').toLowerCase().trim()
          if (firstCell === 'code' || firstCell === 'compte') {
            headerRow = rowNumber
            cells.forEach(c => headers.push(String(c || '')))
            return
          }
          // Or a row that starts with a numeric code (data row)
          if (cells[0] && String(cells[0]).trim().match(/^\d+$/)) {
            // No header found, use default headers
            headerRow = rowNumber
            if (worksheet.name.toLowerCase().includes('recette')) {
              headers.push('Code', 'Intitulé', 'Budget Primitif', 'Budget Add.', 'Modifications', 'Prév. Déf.', 'OR Admis', 'Recouvrement', 'Reste à Rec.')
            } else {
              headers.push('Code', 'Intitulé', 'Budget Primitif', 'Budget Add.', 'Modifications', 'Prév. Déf.', 'Engagement', 'Mandat Admis', 'Paiement', 'Reste à Payer')
            }
            rows.push(cells.map(c => c ?? ''))
            return
          }
        } else if (rows.length < 10) {
          rows.push(cells.map(c => c ?? ''))
        }
      })

      if (headers.length > 0) {
        sheets.push({ name: worksheet.name, headers, rows })
      }
    })

    previewData.value = sheets
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error)
    previewData.value = []
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewData.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleRegionChange = () => {
  importConfig.commune_id = null
}

const handleImport = async () => {
  if (!selectedFile.value || !canImport.value) return

  isImporting.value = true
  try {
    const result = await importService.importExcel(selectedFile.value, {
      commune_id: importConfig.commune_id!,
      exercice_id: importConfig.exercice_id!,
      update_existing: importConfig.updateExisting,
    })

    importResult.value = result
    showResultModal.value = true

    if (result.success) {
      toast.success(`Import réussi: ${result.total_imported} importées, ${result.total_updated} mises à jour`)
      clearFile()
    }
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'import')
  } finally {
    isImporting.value = false
  }
}

const resetForm = () => {
  clearFile()
  importConfig.region_id = null
  importConfig.commune_id = null
  importConfig.exercice_id = null
  importConfig.updateExisting = true
}

const downloadTemplate = async () => {
  isGeneratingTemplate.value = true
  try {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Plateforme TI Madagascar'
    workbook.created = new Date()

    // --- Feuille Recettes ---
    const recSheet = workbook.addWorksheet('Recettes', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    })

    const recHeaders = [
      'Code', 'Intitulé', 'Budget Primitif', 'Budget Additionnel',
      'Modifications', 'Prévisions Définitives', 'OR Admis',
      'Recouvrement', 'Reste à Recouvrer',
    ]

    recSheet.columns = [
      { header: recHeaders[0], key: 'code', width: 10 },
      { header: recHeaders[1], key: 'intitule', width: 40 },
      { header: recHeaders[2], key: 'budget_primitif', width: 16 },
      { header: recHeaders[3], key: 'budget_additionnel', width: 16 },
      { header: recHeaders[4], key: 'modifications', width: 16 },
      { header: recHeaders[5], key: 'previsions_definitives', width: 18 },
      { header: recHeaders[6], key: 'or_admis', width: 16 },
      { header: recHeaders[7], key: 'recouvrement', width: 16 },
      { header: recHeaders[8], key: 'reste_a_recouvrer', width: 16 },
    ]

    // Style header row
    const recHeaderRow = recSheet.getRow(1)
    recHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    recHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3695D8' } }
    recHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    recHeaderRow.height = 25

    // Example row
    recSheet.addRow({
      code: '70',
      intitule: 'IMPOTS SUR LES REVENUS (exemple)',
      budget_primitif: 5000000,
      budget_additionnel: 500000,
      modifications: 0,
      previsions_definitives: 5500000,
      or_admis: 4800000,
      recouvrement: 4500000,
      reste_a_recouvrer: 300000,
    })

    // Number format for numeric columns
    for (let col = 3; col <= 9; col++) {
      recSheet.getColumn(col).numFmt = '#,##0'
    }

    // --- Feuille Dépenses ---
    const depSheet = workbook.addWorksheet('Dépenses', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    })

    const depHeaders = [
      'Code', 'Intitulé', 'Budget Primitif', 'Budget Additionnel',
      'Modifications', 'Prévisions Définitives', 'Engagement',
      'Mandat Admis', 'Paiement', 'Reste à Payer',
    ]

    depSheet.columns = [
      { header: depHeaders[0], key: 'code', width: 10 },
      { header: depHeaders[1], key: 'intitule', width: 40 },
      { header: depHeaders[2], key: 'budget_primitif', width: 16 },
      { header: depHeaders[3], key: 'budget_additionnel', width: 16 },
      { header: depHeaders[4], key: 'modifications', width: 16 },
      { header: depHeaders[5], key: 'previsions_definitives', width: 18 },
      { header: depHeaders[6], key: 'engagement', width: 16 },
      { header: depHeaders[7], key: 'mandat_admis', width: 16 },
      { header: depHeaders[8], key: 'paiement', width: 16 },
      { header: depHeaders[9], key: 'reste_a_payer', width: 16 },
    ]

    const depHeaderRow = depSheet.getRow(1)
    depHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    depHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3695D8' } }
    depHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    depHeaderRow.height = 25

    // Example row
    depSheet.addRow({
      code: '60',
      intitule: 'CHARGES DE PERSONNEL (exemple)',
      budget_primitif: 6000000,
      budget_additionnel: 500000,
      modifications: 0,
      previsions_definitives: 6500000,
      engagement: 6500000,
      mandat_admis: 6000000,
      paiement: 5800000,
      reste_a_payer: 200000,
    })

    for (let col = 3; col <= 10; col++) {
      depSheet.getColumn(col).numFmt = '#,##0'
    }

    // Download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Modele_Compte_Administratif.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Modèle téléchargé')
  } catch (error) {
    console.error('Erreur génération template:', error)
    toast.error('Erreur lors de la génération du modèle')
  } finally {
    isGeneratingTemplate.value = false
  }
}

const loadGeography = async () => {
  try {
    const regionsData = await geoService.getRegions()
    regions.value = regionsData.map((r: any) => ({ id: r.id, nom: r.nom }))
  } catch (error) {
    console.error('Erreur chargement régions:', error)
  }

  try {
    const communesData = await geoService.getCommunes({ limit: 2000 })
    communes.value = (communesData.items || communesData).map((c: any) => ({
      id: c.id,
      nom: c.nom,
      region_id: c.region_id,
    }))
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const loadExercices = async () => {
  try {
    const data = await exercicesService.getExercices()
    exercices.value = data.map((e: any) => ({
      id: e.id,
      annee: e.annee,
      cloture: e.cloture,
    }))
  } catch (error) {
    console.error('Erreur chargement exercices:', error)
  }
}

// Helpers
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadGeography()
  loadExercices()
})
</script>
