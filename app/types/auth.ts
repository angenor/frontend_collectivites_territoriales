/**
 * Types TypeScript pour l'authentification
 */

export interface User {
  id: string
  email: string
  nom: string
  prenom?: string
  role: Role
  commune_id?: string
  actif: boolean
  email_verifie: boolean
  derniere_connexion?: string
  created_at: string
  updated_at: string
  nom_complet?: string
  is_admin?: boolean
  is_editor?: boolean
}

export interface Role {
  id: string
  code: 'admin' | 'editeur' | 'lecteur' | 'commune'
  nom: string
  description?: string
  permissions?: Record<string, boolean>
  actif: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  nom: string
  prenom?: string
  password: string
  role_code?: string
  commune_id?: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginResponse {
  token: Token
  user: User
}

export interface AuthError {
  detail: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
}

export interface Session {
  id: string
  ip_address?: string
  user_agent?: string
  created_at: string
  is_current: boolean
}
