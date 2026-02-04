/**
 * Service pour l'import de données
 */

import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/import'

export interface ImportResult {
  success: boolean
  message?: string
  recettes_imported: number
  recettes_updated: number
  depenses_imported: number
  depenses_updated: number
  total_imported: number
  total_updated: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  column?: string
  message: string
  value?: string
}

export interface ImportOptions {
  commune_id: number
  exercice_id: number
  update_existing?: boolean
}

export const useImportService = () => {
  const api = useApi()

  /**
   * Importe les données d'un fichier Excel (compte administratif complet)
   * Le backend attend commune_id et exercice_id en query params
   */
  const importExcel = async (
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> => {
    const params = new URLSearchParams()
    params.append('commune_id', String(options.commune_id))
    params.append('exercice_id', String(options.exercice_id))
    if (options.update_existing !== undefined) {
      params.append('update_existing', String(options.update_existing))
    }
    return api.upload<ImportResult>(`${BASE_PATH}/excel?${params.toString()}`, file)
  }

  /**
   * Valide un fichier Excel sans importer
   */
  const validateExcel = async (
    file: File,
    options: Pick<ImportOptions, 'commune_id' | 'exercice_id'>
  ): Promise<{ valid: boolean; message: string; errors: ImportError[] }> => {
    const params = new URLSearchParams()
    params.append('commune_id', String(options.commune_id))
    params.append('exercice_id', String(options.exercice_id))
    return api.upload<{ valid: boolean; message: string; errors: ImportError[] }>(
      `${BASE_PATH}/excel/validate?${params.toString()}`,
      file
    )
  }

  /**
   * Récupère les infos sur le format du template attendu
   */
  const getTemplateInfo = async (): Promise<any> => {
    return api.get<any>(`${BASE_PATH}/template`)
  }

  return {
    importExcel,
    validateExcel,
    getTemplateInfo,
  }
}
