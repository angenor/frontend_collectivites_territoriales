/**
 * Service pour les tableaux financiers (Compte Administratif)
 * Endpoints /api/v1/tableaux
 */

import { useApi } from './api'
import type {
  TableauComplet,
  TableauRecettes,
  TableauDepenses,
  TableauEquilibre,
  ResumeFinancier,
  ComparaisonExercices,
  StatistiquesRegion,
} from '~/types/tableaux'

const BASE_PATH = '/api/v1/tableaux'

export const useTableauxService = () => {
  const api = useApi()

  /**
   * Récupère le tableau complet (recettes + dépenses + équilibre)
   */
  const getTableauComplet = async (
    communeId: number,
    exerciceAnnee: number
  ): Promise<TableauComplet> => {
    return api.get<TableauComplet>(BASE_PATH, {
      commune_id: communeId,
      exercice_annee: exerciceAnnee,
    })
  }

  /**
   * Récupère uniquement le tableau des recettes
   */
  const getTableauRecettes = async (
    communeId: number,
    exerciceAnnee: number
  ): Promise<TableauRecettes> => {
    return api.get<TableauRecettes>(`${BASE_PATH}/recettes`, {
      commune_id: communeId,
      exercice_annee: exerciceAnnee,
    })
  }

  /**
   * Récupère uniquement le tableau des dépenses
   */
  const getTableauDepenses = async (
    communeId: number,
    exerciceAnnee: number
  ): Promise<TableauDepenses> => {
    return api.get<TableauDepenses>(`${BASE_PATH}/depenses`, {
      commune_id: communeId,
      exercice_annee: exerciceAnnee,
    })
  }

  /**
   * Récupère uniquement le tableau d'équilibre
   */
  const getTableauEquilibre = async (
    communeId: number,
    exerciceAnnee: number
  ): Promise<TableauEquilibre> => {
    return api.get<TableauEquilibre>(`${BASE_PATH}/equilibre`, {
      commune_id: communeId,
      exercice_annee: exerciceAnnee,
    })
  }

  /**
   * Récupère le résumé financier simplifié
   */
  const getResumeFinancier = async (
    communeId: number,
    exerciceAnnee: number
  ): Promise<ResumeFinancier> => {
    return api.get<ResumeFinancier>(`${BASE_PATH}/resume`, {
      commune_id: communeId,
      exercice_annee: exerciceAnnee,
    })
  }

  /**
   * Compare les données financières entre deux exercices
   */
  const getComparaisonExercices = async (
    communeId: number,
    annee1: number,
    annee2: number
  ): Promise<ComparaisonExercices> => {
    return api.get<ComparaisonExercices>(`${BASE_PATH}/comparaison`, {
      commune_id: communeId,
      annee_1: annee1,
      annee_2: annee2,
    })
  }

  /**
   * Récupère les statistiques agrégées pour une région
   */
  const getStatistiquesRegion = async (
    regionId: number,
    exerciceAnnee: number
  ): Promise<StatistiquesRegion> => {
    return api.get<StatistiquesRegion>(`${BASE_PATH}/statistiques/region/${regionId}`, {
      exercice_annee: exerciceAnnee,
    })
  }

  return {
    getTableauComplet,
    getTableauRecettes,
    getTableauDepenses,
    getTableauEquilibre,
    getResumeFinancier,
    getComparaisonExercices,
    getStatistiquesRegion,
  }
}
