/**
 * Service pour la gestion des exercices budgétaires
 */

import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/exercices'

// Types
export interface ExerciceList {
  id: number
  annee: number
  libelle?: string
  cloture: boolean
}

export interface ExerciceRead {
  id: number
  annee: number
  libelle?: string
  date_debut: string
  date_fin: string
  cloture: boolean
  created_at: string
  updated_at: string
}

export interface ExerciceCreate {
  annee: number
  libelle?: string
  date_debut: string
  date_fin: string
  cloture: boolean
}

export interface ExerciceUpdate {
  libelle?: string
  date_debut?: string
  date_fin?: string
  cloture?: boolean
}

export interface ExerciceStats {
  exercice_id: number
  annee: number
  cloture: boolean
  recettes: {
    total: number
    validees: number
    non_validees: number
    taux_validation: number
  }
  depenses: {
    total: number
    validees: number
    non_validees: number
    taux_validation: number
  }
  communes_avec_recettes: number
  communes_avec_depenses: number
}

export const useExercicesService = () => {
  const api = useApi()

  const getExercices = async (
    params?: { cloture?: boolean; limit?: number }
  ): Promise<ExerciceList[]> => {
    return api.get<ExerciceList[]>(BASE_PATH, params)
  }

  const getExercice = async (id: number): Promise<ExerciceRead> => {
    return api.get<ExerciceRead>(`${BASE_PATH}/${id}`)
  }

  const createExercice = async (data: ExerciceCreate): Promise<ExerciceRead> => {
    return api.post<ExerciceRead>(BASE_PATH, data)
  }

  const updateExercice = async (id: number, data: ExerciceUpdate): Promise<ExerciceRead> => {
    return api.put<ExerciceRead>(`${BASE_PATH}/${id}`, data)
  }

  const cloturerExercice = async (id: number, force: boolean = false): Promise<ExerciceRead> => {
    return api.put<ExerciceRead>(`${BASE_PATH}/${id}/cloturer`, undefined, { params: { force } })
  }

  const rouvrirExercice = async (id: number): Promise<ExerciceRead> => {
    return api.put<ExerciceRead>(`${BASE_PATH}/${id}/rouvrir`)
  }

  const deleteExercice = async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${BASE_PATH}/${id}`)
  }

  const getStatistiques = async (id: number): Promise<ExerciceStats> => {
    return api.get<ExerciceStats>(`${BASE_PATH}/${id}/statistiques`)
  }

  return {
    getExercices,
    getExercice,
    createExercice,
    updateExercice,
    cloturerExercice,
    rouvrirExercice,
    deleteExercice,
    getStatistiques,
  }
}
