/**
 * Service pour la gestion des utilisateurs
 * Aligné sur les endpoints backend FastAPI :
 * - GET/POST /api/v1/admin/utilisateurs
 * - GET/PUT/DELETE /api/v1/admin/utilisateurs/{id}
 * - PUT /api/v1/admin/utilisateurs/{id}/activate?actif=true|false
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type { User, Role, Session } from '~/types/auth'

const BASE_PATH = '/api/v1/admin/utilisateurs'

export interface UserFormData {
  email: string
  nom: string
  prenom?: string
  password?: string
  role: string
  commune_id?: number | null
  actif?: boolean
}

export interface UserWithStats extends User {
  nombre_connexions?: number
  derniere_activite?: string
  commune_nom?: string
  commune_code?: string
}

export const useUtilisateursService = () => {
  const api = useApi()

  // ============================================================================
  // UTILISATEURS
  // ============================================================================

  const getUtilisateurs = async (
    params?: PaginationParams & {
      role_code?: string
      commune_id?: number
      actif?: boolean
      search?: string
    }
  ): Promise<PaginatedResponse<UserWithStats>> => {
    return api.get<PaginatedResponse<UserWithStats>>(BASE_PATH, params)
  }

  const getUtilisateur = async (id: string): Promise<UserWithStats> => {
    return api.get<UserWithStats>(`${BASE_PATH}/${id}`)
  }

  const createUtilisateur = async (data: UserFormData): Promise<User> => {
    const payload: Record<string, any> = {
      email: data.email,
      nom: data.nom,
      password: data.password,
      role: data.role,
    }
    if (data.prenom) payload.prenom = data.prenom
    if (data.commune_id) payload.commune_id = Number(data.commune_id)
    return api.post<User>(BASE_PATH, payload)
  }

  const updateUtilisateur = async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const payload: Record<string, any> = {}
    if (data.email !== undefined) payload.email = data.email
    if (data.nom !== undefined) payload.nom = data.nom
    if (data.prenom !== undefined) payload.prenom = data.prenom
    if (data.role !== undefined) payload.role = data.role
    if (data.commune_id !== undefined) {
      payload.commune_id = data.commune_id ? Number(data.commune_id) : null
    }
    if (data.actif !== undefined) payload.actif = data.actif
    return api.put<User>(`${BASE_PATH}/${id}`, payload)
  }

  const deleteUtilisateur = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const activerUtilisateur = async (id: string): Promise<User> => {
    return api.put<User>(`${BASE_PATH}/${id}/activate`, undefined, { params: { actif: true } })
  }

  const desactiverUtilisateur = async (id: string): Promise<User> => {
    return api.put<User>(`${BASE_PATH}/${id}/activate`, undefined, { params: { actif: false } })
  }

  const resetPassword = async (id: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`${BASE_PATH}/${id}/reset-password`)
  }

  const setPassword = async (id: string, password: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`${BASE_PATH}/${id}/set-password`, { password })
  }

  // ============================================================================
  // SESSIONS
  // ============================================================================

  const getSessions = async (userId: string): Promise<Session[]> => {
    return api.get<Session[]>(`${BASE_PATH}/${userId}/sessions`)
  }

  const revokeSession = async (userId: string, sessionId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${userId}/sessions/${sessionId}`)
  }

  const revokeAllSessions = async (userId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${userId}/sessions`)
  }

  // ============================================================================
  // RÔLES (statiques - basés sur l'enum RoleUtilisateur du backend)
  // ============================================================================

  const getRoles = (): Role[] => {
    return [
      { id: 'admin', code: 'admin', nom: 'Administrateur', actif: true },
      { id: 'editeur', code: 'editeur', nom: 'Éditeur', actif: true },
      { id: 'lecteur', code: 'lecteur', nom: 'Lecteur', actif: true },
      { id: 'commune', code: 'commune', nom: 'Commune', actif: true },
    ]
  }

  // ============================================================================
  // PROFIL (utilisateur connecté)
  // ============================================================================

  const getMonProfil = async (): Promise<User> => {
    return api.get<User>('/api/v1/auth/me')
  }

  const updateMonProfil = async (data: Partial<UserFormData>): Promise<User> => {
    return api.put<User>('/api/v1/auth/me', data)
  }

  const getMesSessions = async (): Promise<Session[]> => {
    return api.get<Session[]>('/api/v1/auth/sessions')
  }

  const revokerMaSession = async (sessionId: string): Promise<void> => {
    return api.delete<void>(`/api/v1/auth/sessions/${sessionId}`)
  }

  return {
    // Utilisateurs
    getUtilisateurs,
    getUtilisateur,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    activerUtilisateur,
    desactiverUtilisateur,
    resetPassword,
    setPassword,

    // Sessions
    getSessions,
    revokeSession,
    revokeAllSessions,

    // Rôles
    getRoles,

    // Profil
    getMonProfil,
    updateMonProfil,
    getMesSessions,
    revokerMaSession,
  }
}
