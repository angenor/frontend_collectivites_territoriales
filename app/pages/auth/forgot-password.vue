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
        <!-- État : Formulaire -->
        <template v-if="!emailSent">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] mb-4">
              <font-awesome-icon :icon="['fas', 'key']" class="text-2xl" />
            </div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Mot de passe oublié
            </h1>
            <p class="text-[var(--text-secondary)] text-sm">
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
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
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Adresse email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="votre@email.com"
                  class="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- Bouton -->
            <button
              type="submit"
              :disabled="isLoading || !email.trim()"
              class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <font-awesome-icon
                v-if="isLoading"
                :icon="['fas', 'spinner']"
                class="animate-spin"
              />
              <span>{{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien' }}</span>
            </button>
          </form>
        </template>

        <!-- État : Email envoyé -->
        <template v-else>
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success-light)] text-[var(--color-success)] mb-4">
              <font-awesome-icon :icon="['fas', 'envelope-circle-check']" class="text-2xl" />
            </div>
            <h2 class="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Email envoyé
            </h2>
            <p class="text-[var(--text-secondary)] text-sm mb-6">
              Si un compte existe avec l'adresse <strong class="text-[var(--text-primary)]">{{ email }}</strong>,
              vous recevrez un email avec les instructions de réinitialisation.
            </p>
            <p class="text-[var(--text-muted)] text-xs mb-6">
              Pensez à vérifier vos spams si vous ne recevez pas l'email.
            </p>

            <button
              @click="resetForm"
              class="text-[var(--color-primary)] hover:text-[var(--color-primary-700)] font-medium transition-colors cursor-pointer"
            >
              Renvoyer un email
            </button>
          </div>
        </template>
      </div>

      <!-- Retour à la connexion -->
      <div class="mt-6 text-center">
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

const { requestPasswordReset, isLoading, error, clearError } = useAuth()

const email = ref('')
const emailSent = ref(false)

// Effacer l'erreur quand l'utilisateur modifie le formulaire
watch(email, () => {
  if (error.value) {
    clearError()
  }
})

const handleSubmit = async () => {
  if (!email.value.trim()) return

  const success = await requestPasswordReset(email.value)

  if (success) {
    emailSent.value = true
  }
}

const resetForm = () => {
  emailSent.value = false
  email.value = ''
  clearError()
}
</script>
