/**
 * Types TypeScript pour l'authentification
 */

export interface User {
  id: string
  email: string
  username: string
  nom: string
  prenom?: string
  role: Role
  commune_id?: string
  telephone?: string
  actif: boolean
  email_verifie: boolean
  dernier_login?: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  code: string
  nom: string
  description?: string
  permissions?: any
  actif: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  nom: string
  prenom?: string
  password: string
  telephone?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface AuthError {
  detail: string
}
