/**
 * Composable d'authentification
 * Gère la connexion, déconnexion, tokens JWT et état utilisateur
 */

import type { User, LoginCredentials, LoginResponse, AuthError } from '~/types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

interface LoginJsonResponse {
  token: {
    access_token: string
    refresh_token: string
    token_type: string
  }
  user: User
}

const TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl as string

  // État réactif global (persisté entre les composants)
  const state = useState<AuthState>('auth', () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
  }))

  // Computed properties
  const isAuthenticated = computed(() => !!state.value.accessToken && !!state.value.user)
  const user = computed(() => state.value.user)
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)
  const isAdmin = computed(() => state.value.user?.role?.code === 'admin')
  const isEditor = computed(() => ['admin', 'editeur'].includes(state.value.user?.role?.code || ''))

  /**
   * Initialise l'état depuis le localStorage (côté client uniquement)
   */
  const initAuth = () => {
    if (import.meta.client) {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)

      if (storedToken && storedUser) {
        state.value.accessToken = storedToken
        state.value.refreshToken = storedRefreshToken
        try {
          state.value.user = JSON.parse(storedUser)
        } catch {
          // Invalid JSON, clear storage
          clearStorage()
        }
      }
    }
  }

  /**
   * Sauvegarde les tokens et l'utilisateur dans le localStorage
   */
  const saveToStorage = (accessToken: string, refreshToken: string | null, user: User) => {
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, accessToken)
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }

  /**
   * Efface le localStorage
   */
  const clearStorage = () => {
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }

  /**
   * Connexion utilisateur
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    state.value.isLoading = true
    state.value.error = null

    try {
      const response = await $fetch<LoginJsonResponse>(`${apiBaseUrl}/api/v1/auth/login/json`, {
        method: 'POST',
        body: { email, password },
      })

      // Sauvegarder les tokens et l'utilisateur
      state.value.accessToken = response.token.access_token
      state.value.refreshToken = response.token.refresh_token
      state.value.user = response.user

      saveToStorage(
        response.token.access_token,
        response.token.refresh_token,
        response.user
      )

      return true
    } catch (err: any) {
      const errorMessage = err?.data?.detail || err?.message || 'Erreur de connexion'
      state.value.error = errorMessage
      return false
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Déconnexion utilisateur
   */
  const logout = async (): Promise<void> => {
    // Tenter de notifier le backend (optionnel, ne pas bloquer si échoue)
    if (state.value.refreshToken) {
      try {
        await $fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.value.accessToken}`,
          },
          body: { refresh_token: state.value.refreshToken },
        })
      } catch {
        // Ignorer les erreurs de logout côté serveur
      }
    }

    // Nettoyer l'état local
    state.value.user = null
    state.value.accessToken = null
    state.value.refreshToken = null
    state.value.error = null
    clearStorage()

    // Rediriger vers la page de login
    await navigateTo('/auth/login')
  }

  /**
   * Rafraîchir le token d'accès
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!state.value.refreshToken) {
      return false
    }

    try {
      const response = await $fetch<{ access_token: string; refresh_token: string }>(`${apiBaseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        body: { refresh_token: state.value.refreshToken },
      })

      state.value.accessToken = response.access_token
      state.value.refreshToken = response.refresh_token

      if (state.value.user) {
        saveToStorage(response.access_token, response.refresh_token, state.value.user)
      }

      return true
    } catch {
      // Token invalide, déconnecter l'utilisateur
      await logout()
      return false
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  const fetchCurrentUser = async (): Promise<User | null> => {
    if (!state.value.accessToken) {
      return null
    }

    try {
      const user = await $fetch<User>(`${apiBaseUrl}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${state.value.accessToken}`,
        },
      })

      state.value.user = user
      if (state.value.accessToken) {
        saveToStorage(state.value.accessToken, state.value.refreshToken, user)
      }

      return user
    } catch {
      // Token invalide
      return null
    }
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    state.value.isLoading = true
    state.value.error = null

    try {
      await $fetch(`${apiBaseUrl}/api/v1/auth/password-reset`, {
        method: 'POST',
        body: { email },
      })
      return true
    } catch (err: any) {
      state.value.error = err?.data?.detail || 'Erreur lors de la demande'
      return false
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Confirmer la réinitialisation du mot de passe
   */
  const confirmPasswordReset = async (token: string, newPassword: string): Promise<boolean> => {
    state.value.isLoading = true
    state.value.error = null

    try {
      await $fetch(`${apiBaseUrl}/api/v1/auth/password-reset/confirm`, {
        method: 'POST',
        body: { token, new_password: newPassword },
      })
      return true
    } catch (err: any) {
      state.value.error = err?.data?.detail || 'Token invalide ou expiré'
      return false
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Changer le mot de passe de l'utilisateur connecté
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!state.value.accessToken) {
      state.value.error = 'Non authentifié'
      return false
    }

    state.value.isLoading = true
    state.value.error = null

    try {
      await $fetch(`${apiBaseUrl}/api/v1/auth/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.value.accessToken}`,
        },
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      })
      return true
    } catch (err: any) {
      state.value.error = err?.data?.detail || 'Erreur lors du changement de mot de passe'
      return false
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Créer un header Authorization pour les requêtes API
   */
  const getAuthHeaders = (): Record<string, string> => {
    if (state.value.accessToken) {
      return { Authorization: `Bearer ${state.value.accessToken}` }
    }
    return {}
  }

  /**
   * Effectuer une requête API authentifiée avec refresh automatique
   */
  const authFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders(),
      },
    }

    try {
      return await $fetch<T>(fullUrl, fetchOptions as any)
    } catch (err: any) {
      // Si erreur 401, tenter de rafraîchir le token
      if (err?.status === 401 && state.value.refreshToken) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          fetchOptions.headers = {
            ...options.headers,
            ...getAuthHeaders(),
          }
          return await $fetch<T>(fullUrl, fetchOptions as any)
        }
      }
      throw err
    }
  }

  /**
   * Effacer l'erreur
   */
  const clearError = () => {
    state.value.error = null
  }

  // Initialiser l'état au montage (côté client)
  if (import.meta.client) {
    initAuth()
  }

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isEditor,

    // Actions
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    requestPasswordReset,
    confirmPasswordReset,
    changePassword,
    clearError,
    initAuth,

    // Utilitaires
    getAuthHeaders,
    authFetch,
  }
}
