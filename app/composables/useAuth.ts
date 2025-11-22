/**
 * Composable pour gérer l'authentification avec le backend FastAPI
 */

interface User {
  id: string
  email: string
  username: string
  nom: string
  prenom?: string
  role: {
    id: string
    code: string
    nom: string
    permissions?: any
  }
  commune_id?: string
  actif: boolean
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  nom: string
  prenom?: string
  password: string
  role_id?: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}

export const useAuth = () => {
  const api = useApi()
  const router = useRouter()

  // État réactif de l'utilisateur
  const user = useState<User | null>('auth_user', () => {
    if (process.client) {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Connexion avec username et password
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      // Format FormData pour OAuth2PasswordBearer (FastAPI standard)
      const formData = new URLSearchParams()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await $fetch<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.apiBaseUrl || 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      // Stocker le token
      if (process.client) {
        localStorage.setItem('access_token', response.access_token)
      }

      // Récupérer les informations de l'utilisateur
      await fetchCurrentUser()

      return { success: true }
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      return {
        success: false,
        error: error.data?.detail || 'Identifiants incorrects',
      }
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  const fetchCurrentUser = async () => {
    try {
      const userData = await api.get<User>('/api/v1/auth/me')
      user.value = userData

      // Stocker dans localStorage
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(userData))
      }

      return userData
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      throw error
    }
  }

  /**
   * Récupère le rôle par défaut (LECTEUR) pour l'inscription
   */
  const getDefaultRoleId = async (): Promise<string | null> => {
    try {
      // Récupérer tous les rôles
      const roles = await api.get<any[]>('/api/v1/roles')
      // Trouver le rôle LECTEUR (lecture seule)
      const lecteurRole = roles.find((r: any) => r.code === 'LECTEUR')
      return lecteurRole?.id || null
    } catch (error) {
      console.error('Erreur récupération rôle par défaut:', error)
      return null
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (data: RegisterData) => {
    try {
      // Récupérer le rôle par défaut si non fourni
      let roleId = data.role_id
      if (!roleId) {
        roleId = await getDefaultRoleId()
        if (!roleId) {
          return {
            success: false,
            error: 'Impossible de récupérer le rôle par défaut',
          }
        }
      }

      // Ajouter le role_id aux données
      const registerData = {
        ...data,
        role_id: roleId,
      }

      const response = await api.post<User>('/api/v1/auth/register', registerData)
      return { success: true, user: response }
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      return {
        success: false,
        error: error.data?.detail || 'Erreur lors de l\'inscription',
      }
    }
  }

  /**
   * Déconnexion
   */
  const logout = async () => {
    // Supprimer le token et les infos utilisateur
    if (process.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }

    user.value = null

    // Rediriger vers la page de login
    await router.push('/auth/login')
  }

  /**
   * Vérifier si l'utilisateur a une permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user.value || !user.value.role.permissions) {
      return false
    }
    // Logique de vérification des permissions
    // À adapter selon la structure des permissions du backend
    return user.value.role.permissions.includes(permission)
  }

  /**
   * Vérifier si l'utilisateur a un rôle
   */
  const hasRole = (roleCode: string): boolean => {
    if (!user.value) {
      return false
    }
    return user.value.role.code === roleCode
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  const isAdmin = computed(() => {
    return hasRole('admin') || hasRole('super_admin')
  })

  /**
   * Initialiser l'authentification au chargement
   */
  const init = async () => {
    if (process.client) {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          await fetchCurrentUser()
        } catch (error) {
          // Token invalide, nettoyer
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          user.value = null
        }
      }
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchCurrentUser,
    hasPermission,
    hasRole,
    init,
  }
}
