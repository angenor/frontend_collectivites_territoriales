/**
 * Middleware pour protéger les routes admin
 * Vérifie que l'utilisateur est authentifié avant d'accéder aux pages
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // Initialiser l'auth côté client si nécessaire
  const { isAuthenticated, initAuth } = useAuth()

  // S'assurer que l'état est initialisé depuis le localStorage
  if (import.meta.client) {
    initAuth()
  }

  // Routes publiques d'authentification (pas de protection)
  const publicAuthRoutes = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!isAuthenticated.value && to.path.startsWith('/admin')) {
    // Sauvegarder l'URL de destination pour rediriger après connexion
    const redirectTo = to.fullPath !== '/admin' ? to.fullPath : undefined
    return navigateTo({
      path: '/auth/login',
      query: redirectTo ? { redirect: redirectTo } : undefined,
    })
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder aux pages de login
  if (isAuthenticated.value && publicAuthRoutes.includes(to.path)) {
    // Vérifier s'il y a une URL de redirection
    const redirectTo = to.query.redirect as string
    return navigateTo(redirectTo || '/admin')
  }
})
