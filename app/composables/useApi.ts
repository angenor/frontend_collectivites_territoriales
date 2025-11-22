/**
 * Composable pour communiquer avec le backend FastAPI
 */

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'

  /**
   * Fait une requête à l'API avec gestion automatique du token JWT
   */
  const request = async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {}, params } = options

    // Récupérer le token JWT du localStorage
    const token = process.client ? localStorage.getItem('access_token') : null

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Construire l'URL avec les paramètres
    let url = `${baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    try {
      const response = await $fetch<T>(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      return response
    } catch (error: any) {
      // Gestion des erreurs
      if (error.status === 401) {
        // Token expiré ou invalide - rediriger vers login
        if (process.client) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          navigateTo('/auth/login')
        }
      }

      // Relancer l'erreur pour la gestion côté appelant
      throw error
    }
  }

  /**
   * Méthodes raccourcies
   */
  const get = <T = any>(endpoint: string, params?: Record<string, any>) => {
    return request<T>(endpoint, { method: 'GET', params })
  }

  const post = <T = any>(endpoint: string, body: any) => {
    return request<T>(endpoint, { method: 'POST', body })
  }

  const put = <T = any>(endpoint: string, body: any) => {
    return request<T>(endpoint, { method: 'PUT', body })
  }

  const patch = <T = any>(endpoint: string, body: any) => {
    return request<T>(endpoint, { method: 'PATCH', body })
  }

  const del = <T = any>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  }
}
