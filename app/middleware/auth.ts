/**
 * Middleware pour protéger les routes admin
 * Vérifie que l'utilisateur est authentifié avant d'accéder aux pages
 */

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!isAuthenticated.value && to.path.startsWith('/admin')) {
    // Rediriger vers la page de login
    return navigateTo('/auth/login')
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder à login/register
  if (isAuthenticated.value && (to.path === '/auth/login' || to.path === '/auth/register')) {
    // Rediriger vers le dashboard
    return navigateTo('/admin')
  }
})
