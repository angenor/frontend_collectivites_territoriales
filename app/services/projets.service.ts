/**
 * Service pour la gestion des projets miniers
 * Projets, Sociétés, Revenus miniers
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type {
  ProjetMinier,
  ProjetMinierFormData,
  ProjetMinierWithStats,
  RevenuMinier,
  RevenuMinierFormData,
  RevenuMinierStats,
} from '~/types/projets-miniers'

const BASE_PATH = '/api/v1/projets'
const REVENUS_PATH = '/api/v1/revenus'

// Types pour les sociétés
export interface Societe {
  id: string
  nom: string
  code?: string
  description?: string
  site_web?: string
  email?: string
  telephone?: string
  adresse?: string
  pays?: string
  created_at: string
  updated_at: string
  nombre_projets?: number
}

export interface SocieteFormData {
  nom: string
  code?: string
  description?: string
  site_web?: string
  email?: string
  telephone?: string
  adresse?: string
  pays?: string
}

export const useProjetsService = () => {
  const api = useApi()

  // ============================================================================
  // SOCIÉTÉS MINIÈRES
  // ============================================================================

  const getSocietes = async (
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedResponse<Societe>> => {
    const result = await api.get<any>(`${BASE_PATH}/societes`, params)
    if (Array.isArray(result)) {
      return { items: result, total: result.length, page: 1, limit: params?.limit || 100, pages: 1 }
    }
    return result
  }

  const getSociete = async (id: string): Promise<Societe> => {
    return api.get<Societe>(`${BASE_PATH}/societes/${id}`)
  }

  const createSociete = async (data: SocieteFormData): Promise<Societe> => {
    return api.post<Societe>(`${BASE_PATH}/societes`, data)
  }

  const updateSociete = async (id: string, data: Partial<SocieteFormData>): Promise<Societe> => {
    return api.put<Societe>(`${BASE_PATH}/societes/${id}`, data)
  }

  const deleteSociete = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/societes/${id}`)
  }

  const getAllSocietes = async (): Promise<Societe[]> => {
    const result = await api.get<any>(`${BASE_PATH}/societes`, { limit: 500 })
    return Array.isArray(result) ? result : (result.items || [])
  }

  // ============================================================================
  // PROJETS MINIERS
  // ============================================================================

  const getProjets = async (
    params?: PaginationParams & {
      societe_id?: string
      region_id?: string
      district_id?: string
      commune_id?: string
      statut?: 'en_cours' | 'suspendu' | 'termine' | 'planifie'
      type_minerai?: string
      search?: string
    }
  ): Promise<PaginatedResponse<ProjetMinierWithStats>> => {
    const result = await api.get<any>(BASE_PATH, params)
    // Backend returns a direct list, wrap as PaginatedResponse
    if (Array.isArray(result)) {
      return { items: result, total: result.length, page: 1, limit: params?.limit || 100, pages: 1 }
    }
    return result
  }

  const getProjet = async (id: string): Promise<ProjetMinier> => {
    return api.get<ProjetMinier>(`${BASE_PATH}/${id}`)
  }

  const createProjet = async (data: ProjetMinierFormData): Promise<ProjetMinier> => {
    return api.post<ProjetMinier>(BASE_PATH, data)
  }

  const updateProjet = async (id: string, data: Partial<ProjetMinierFormData>): Promise<ProjetMinier> => {
    return api.put<ProjetMinier>(`${BASE_PATH}/${id}`, data)
  }

  const deleteProjet = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const getProjetsByCommune = async (communeId: string): Promise<ProjetMinier[]> => {
    return api.get<ProjetMinier[]>(`${BASE_PATH}/by-commune/${communeId}`)
  }

  const getTypesMinerai = async (): Promise<string[]> => {
    return api.get<string[]>(`${BASE_PATH}/types-minerai`)
  }

  // ============================================================================
  // REVENUS MINIERS
  // ============================================================================

  const getRevenus = async (
    params?: PaginationParams & {
      projet_id?: string
      commune_id?: string
      exercice_annee?: number
      type_revenu?: string
      region_id?: string
    }
  ): Promise<PaginatedResponse<RevenuMinier>> => {
    const result = await api.get<any>(REVENUS_PATH, params)
    if (Array.isArray(result)) {
      return { items: result, total: result.length, page: 1, limit: params?.limit || 100, pages: 1 }
    }
    return result
  }

  const getRevenu = async (id: string): Promise<RevenuMinier> => {
    return api.get<RevenuMinier>(`${REVENUS_PATH}/${id}`)
  }

  const createRevenu = async (data: RevenuMinierFormData): Promise<RevenuMinier> => {
    return api.post<RevenuMinier>(REVENUS_PATH, data)
  }

  const updateRevenu = async (id: string, data: Partial<RevenuMinierFormData>): Promise<RevenuMinier> => {
    return api.put<RevenuMinier>(`${REVENUS_PATH}/${id}`, data)
  }

  const deleteRevenu = async (id: string): Promise<void> => {
    return api.delete<void>(`${REVENUS_PATH}/${id}`)
  }

  const getRevenusByProjet = async (projetId: string): Promise<RevenuMinier[]> => {
    return api.get<RevenuMinier[]>(`${BASE_PATH}/${projetId}/revenus`)
  }

  const getRevenusStats = async (
    params?: { annee?: number; region_id?: string }
  ): Promise<RevenuMinierStats[]> => {
    return api.get<RevenuMinierStats[]>(`${REVENUS_PATH}/statistiques/global`, params)
  }

  // ============================================================================
  // DONNÉES DE RÉFÉRENCE POUR REVENUS
  // ============================================================================

  const getPlanComptableForRevenus = async (): Promise<Array<{ code: string; intitule: string }>> => {
    const result = await api.get<any>('/api/v1/admin/plan-comptable', {
      type_mouvement: 'recette',
      niveau: 3,
      actif: true,
      limit: 500,
    })
    return result.items || result
  }

  const getComptesAdministratifsForSelect = async (
    params?: { commune_id?: string | number; annee?: number }
  ): Promise<Array<{ id: number; commune_id: number; exercice_id: number; commune_nom?: string; annee?: number }>> => {
    return api.get<any>('/api/v1/admin/comptes-administratifs', {
      ...params,
      limit: 100,
    }).then((r: any) => r.items || r)
  }

  const getExercices = async (): Promise<Array<{ id: number; annee: number; cloture: boolean }>> => {
    return api.get<Array<{ id: number; annee: number; cloture: boolean }>>('/api/v1/exercices', {
      limit: 50,
    }).then((r: any) => r.items || r)
  }

  return {
    // Sociétés
    getSocietes,
    getSociete,
    createSociete,
    updateSociete,
    deleteSociete,
    getAllSocietes,

    // Projets
    getProjets,
    getProjet,
    createProjet,
    updateProjet,
    deleteProjet,
    getProjetsByCommune,
    getTypesMinerai,

    // Revenus
    getRevenus,
    getRevenu,
    createRevenu,
    updateRevenu,
    deleteRevenu,
    getRevenusByProjet,
    getRevenusStats,

    // Données de référence
    getPlanComptableForRevenus,
    getComptesAdministratifsForSelect,
    getExercices,
  }
}
