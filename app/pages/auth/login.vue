<template>
  <div class="min-h-screen flex">
    <!-- Panneau gauche - Image/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-[var(--color-primary)] relative overflow-hidden">
      <!-- Pattern de fond -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
      </div>

      <!-- Contenu -->
      <div class="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
        <!-- Logo -->
        <div class="mb-8">
          <img
            src="/images/logos/logo_fond_bleu_texte_blanc.jpeg"
            alt="TI Madagascar"
            class="h-24 w-auto rounded-lg shadow-lg"
          />
        </div>

        <!-- Titre -->
        <h1 class="font-heading text-4xl font-bold text-center mb-4 uppercase tracking-wide">
          Plateforme de Suivi
        </h1>
        <h2 class="font-heading text-2xl font-semibold text-center mb-8 uppercase tracking-wide opacity-90">
          Revenus Miniers des Collectivités
        </h2>

        <!-- Description -->
        <p class="text-center text-lg opacity-80 max-w-md leading-relaxed">
          Espace d'administration pour la gestion et le suivi des revenus miniers
          des collectivités territoriales de Madagascar.
        </p>

        <!-- Footer -->
        <div class="absolute bottom-8 text-center opacity-70 text-sm">
          <p>Transparency International - Initiative Madagascar</p>
          <p class="mt-1">PCQVP Madagascar</p>
        </div>
      </div>
    </div>

    <!-- Panneau droit - Formulaire -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg-page)]">
      <div class="w-full max-w-md">
        <!-- Logo mobile -->
        <div class="lg:hidden flex justify-center mb-8">
          <img
            src="/images/logos/logo_fond_noire_texte_bleu.jpeg"
            alt="TI Madagascar"
            class="h-16 w-auto rounded-lg"
          />
        </div>

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-heading text-3xl font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
            Connexion
          </h1>
          <p class="text-[var(--text-secondary)]">
            Accédez à votre espace d'administration
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Message d'erreur -->
          <div
            v-if="error"
            class="p-4 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)] text-[var(--color-error-dark)] text-sm flex items-start gap-3"
          >
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="mt-0.5 flex-shrink-0" />
            <span>{{ error }}</span>
          </div>

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
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="votre@email.com"
                class="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Mot de passe
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
                autocomplete="current-password"
                placeholder="Votre mot de passe"
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
          </div>

          <!-- Lien mot de passe oublié -->
          <div class="flex justify-end">
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              Mot de passe oublié ?
            </NuxtLink>
          </div>

          <!-- Bouton de connexion -->
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
            <span>{{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}</span>
          </button>
        </form>

        <!-- Retour à l'accueil -->
        <div class="mt-8 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
            <span>Retour au site public</span>
          </NuxtLink>
        </div>

        <!-- Footer mobile -->
        <div class="lg:hidden mt-12 text-center text-xs text-[var(--text-muted)]">
          <p>Transparency International - Initiative Madagascar</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
})

const { login, isLoading, error, clearError } = useAuth()
const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
})

// Get redirect URL from query params
const redirectTo = computed(() => route.query.redirect as string || '/admin')

const showPassword = ref(false)

const isFormValid = computed(() => {
  return form.value.email.trim() !== '' && form.value.password.trim() !== ''
})

// Effacer l'erreur quand l'utilisateur modifie le formulaire
watch(form, () => {
  if (error.value) {
    clearError()
  }
}, { deep: true })

const handleSubmit = async () => {
  if (!isFormValid.value) return

  const success = await login(form.value.email, form.value.password)

  if (success) {
    // Rediriger vers la page demandée ou le dashboard admin
    await router.push(redirectTo.value)
  }
}
</script>
