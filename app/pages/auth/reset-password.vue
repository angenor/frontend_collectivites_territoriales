<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-page)]">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img
          src="/images/logos/logo_fond_noire_texte_bleu.jpeg"
          alt="TI Madagascar"
          class="h-16 w-auto rounded-lg"
        />
      </div>

      <!-- Contenu principal -->
      <div class="bg-[var(--bg-card)] rounded-xl shadow-lg p-8 border border-[var(--border-light)]">
        <!-- État : Token invalide -->
        <template v-if="!token">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-error-light)] text-[var(--color-error)] mb-4">
              <font-awesome-icon :icon="['fas', 'link-slash']" class="text-2xl" />
            </div>
            <h2 class="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Lien invalide
            </h2>
            <p class="text-[var(--text-secondary)] text-sm mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <NuxtLink
              to="/auth/forgot-password"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'rotate-right']" />
              <span>Demander un nouveau lien</span>
            </NuxtLink>
          </div>
        </template>

        <!-- État : Formulaire -->
        <template v-else-if="!resetSuccess">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] mb-4">
              <font-awesome-icon :icon="['fas', 'lock-open']" class="text-2xl" />
            </div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Nouveau mot de passe
            </h1>
            <p class="text-[var(--text-secondary)] text-sm">
              Choisissez un nouveau mot de passe sécurisé.
            </p>
          </div>

          <!-- Message d'erreur -->
          <div
            v-if="error"
            class="mb-6 p-4 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)] text-[var(--color-error-dark)] text-sm flex items-start gap-3"
          >
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="mt-0.5 flex-shrink-0" />
            <span>{{ error }}</span>
          </div>

          <!-- Formulaire -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Nouveau mot de passe -->
            <div>
              <label for="password" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Nouveau mot de passe
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <font-awesome-icon :icon="['fas', 'lock']" />
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Minimum 8 caractères"
                  class="w-full pl-11 pr-12 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                </button>
              </div>

              <!-- Indicateur de force -->
              <div class="mt-2">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-colors"
                    :class="[
                      i <= passwordStrength.level
                        ? passwordStrength.color
                        : 'bg-[var(--color-gray-200)]'
                    ]"
                  />
                </div>
                <p v-if="form.password" class="text-xs mt-1" :class="passwordStrength.textColor">
                  {{ passwordStrength.label }}
                </p>
              </div>
            </div>

            <!-- Confirmation -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Confirmer le mot de passe
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <font-awesome-icon :icon="['fas', 'check-double']" />
                </div>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  placeholder="Répétez le mot de passe"
                  class="w-full pl-11 pr-12 py-3 rounded-lg border transition-all"
                  :class="[
                    passwordsMatch || !form.confirmPassword
                      ? 'border-[var(--border-default)] focus:ring-[var(--color-primary)]'
                      : 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
                    'bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:border-transparent'
                  ]"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  <font-awesome-icon :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']" />
                </button>
              </div>
              <p v-if="form.confirmPassword && !passwordsMatch" class="text-xs mt-1 text-[var(--color-error)]">
                Les mots de passe ne correspondent pas
              </p>
            </div>

            <!-- Bouton -->
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <font-awesome-icon
                v-if="isLoading"
                :icon="['fas', 'spinner']"
                class="animate-spin"
              />
              <span>{{ isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
            </button>
          </form>
        </template>

        <!-- État : Succès -->
        <template v-else>
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success-light)] text-[var(--color-success)] mb-4">
              <font-awesome-icon :icon="['fas', 'circle-check']" class="text-2xl" />
            </div>
            <h2 class="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Mot de passe réinitialisé
            </h2>
            <p class="text-[var(--text-secondary)] text-sm mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <NuxtLink
              to="/auth/login"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] transition-colors font-semibold"
            >
              <font-awesome-icon :icon="['fas', 'right-to-bracket']" />
              <span>Se connecter</span>
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- Retour à la connexion -->
      <div v-if="!resetSuccess" class="mt-6 text-center">
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          <span>Retour à la connexion</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const { confirmPasswordReset, isLoading, error, clearError } = useAuth()

// Récupérer le token depuis l'URL
const token = computed(() => route.query.token as string | undefined)

const form = ref({
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const resetSuccess = ref(false)

// Vérification de la force du mot de passe
const passwordStrength = computed(() => {
  const password = form.value.password
  let level = 0

  if (password.length >= 8) level++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) level++
  if (/\d/.test(password)) level++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) level++

  const strengths = [
    { level: 0, label: '', color: '', textColor: '' },
    { level: 1, label: 'Faible', color: 'bg-[var(--color-error)]', textColor: 'text-[var(--color-error)]' },
    { level: 2, label: 'Moyen', color: 'bg-[var(--color-orange)]', textColor: 'text-[var(--color-orange-dark)]' },
    { level: 3, label: 'Bon', color: 'bg-[var(--color-lime)]', textColor: 'text-[var(--color-lime-dark)]' },
    { level: 4, label: 'Excellent', color: 'bg-[var(--color-success)]', textColor: 'text-[var(--color-success)]' },
  ]

  return strengths[level] || strengths[0]
})

const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword
})

const isFormValid = computed(() => {
  return (
    form.value.password.length >= 8 &&
    passwordsMatch.value &&
    passwordStrength.value.level >= 2
  )
})

// Effacer l'erreur quand l'utilisateur modifie le formulaire
watch(form, () => {
  if (error.value) {
    clearError()
  }
}, { deep: true })

const handleSubmit = async () => {
  if (!isFormValid.value || !token.value) return

  const success = await confirmPasswordReset(token.value, form.value.password)

  if (success) {
    resetSuccess.value = true
  }
}
</script>
