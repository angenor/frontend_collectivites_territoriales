<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/utilisateurs"
          class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-[var(--text-muted)]" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">Nouvel utilisateur</h1>
          <p class="text-[var(--text-muted)]">Créez un nouveau compte utilisateur</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main form -->
      <div class="lg:col-span-2">
        <form @submit.prevent="createUser" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div class="p-6 space-y-6">
            <!-- Personal info section -->
            <div>
              <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Informations personnelles</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nom -->
                <div>
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Nom *
                  </label>
                  <input
                    v-model="form.nom"
                    type="text"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                    placeholder="Nom de famille"
                    :class="{ 'border-red-500': errors.nom }"
                  />
                  <p v-if="errors.nom" class="mt-1 text-sm text-red-500">{{ errors.nom }}</p>
                </div>

                <!-- Prénom -->
                <div>
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Prénom
                  </label>
                  <input
                    v-model="form.prenom"
                    type="text"
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                    placeholder="Prénom"
                  />
                </div>

                <!-- Email -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Adresse email *
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                    placeholder="email@example.com"
                    :class="{ 'border-red-500': errors.email }"
                  />
                  <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
                </div>
              </div>
            </div>

            <!-- Account section -->
            <div class="pt-6 border-t border-[var(--border-default)]">
              <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Paramètres du compte</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Rôle -->
                <div>
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Rôle *
                  </label>
                  <select
                    v-model="form.role"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    :class="{ 'border-red-500': errors.role }"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option v-for="role in roles" :key="role.code" :value="role.code">
                      {{ role.nom }}
                    </option>
                  </select>
                  <p v-if="errors.role" class="mt-1 text-sm text-red-500">{{ errors.role }}</p>
                  <p v-if="selectedRole" class="mt-2 text-sm text-[var(--text-muted)]">
                    {{ selectedRole.description || getRoleDescription(selectedRole.code) }}
                  </p>
                </div>

                <!-- Commune (si rôle commune) -->
                <div v-if="selectedRole?.code === 'commune'">
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Commune *
                  </label>
                  <div v-if="isLoadingCommunes" class="flex items-center gap-2 py-3 text-[var(--text-muted)]">
                    <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin" />
                    Chargement des communes...
                  </div>
                  <select
                    v-else
                    v-model="form.commune_id"
                    :required="selectedRole?.code === 'commune'"
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                  >
                    <option :value="null">Sélectionner une commune</option>
                    <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                      {{ commune.nom }} <span v-if="commune.region_nom">- {{ commune.region_nom }}</span>
                    </option>
                  </select>
                </div>

                <!-- Active toggle -->
                <div class="md:col-span-2">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="form.actif"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)] relative" />
                    <span class="text-sm font-medium text-[var(--text-primary)]">
                      Activer le compte immédiatement
                    </span>
                  </label>
                  <p class="mt-1 text-sm text-[var(--text-muted)] ml-14">
                    Si désactivé, l'utilisateur ne pourra pas se connecter.
                  </p>
                </div>
              </div>
            </div>

            <!-- Password section -->
            <div class="pt-6 border-t border-[var(--border-default)]">
              <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Mot de passe</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Mot de passe *
                  </label>
                  <div class="relative">
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                      placeholder="Minimum 8 caractères"
                      :class="{ 'border-red-500': errors.password }"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                    </button>
                  </div>
                  <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>

                  <!-- Password strength -->
                  <div v-if="form.password" class="mt-2">
                    <div class="flex gap-1">
                      <div
                        v-for="i in 4"
                        :key="i"
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="i <= passwordStrength ? passwordStrengthColor : 'bg-[var(--bg-tertiary)]'"
                      />
                    </div>
                    <p class="text-xs mt-1" :class="passwordStrengthTextColor">
                      {{ passwordStrengthText }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    v-model="confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                    placeholder="Confirmer le mot de passe"
                    :class="{ 'border-red-500': confirmPassword && confirmPassword !== form.password }"
                  />
                  <p v-if="confirmPassword && confirmPassword !== form.password" class="mt-1 text-sm text-red-500">
                    Les mots de passe ne correspondent pas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Form actions -->
          <div class="px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-default)] flex items-center justify-end gap-4">
            <NuxtLink
              to="/admin/utilisateurs"
              class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
            >
              Annuler
            </NuxtLink>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <font-awesome-icon
                :icon="['fas', isSubmitting ? 'spinner' : 'user-plus']"
                :class="{ 'animate-spin': isSubmitting }"
              />
              {{ isSubmitting ? 'Création...' : 'Créer l\'utilisateur' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Role info card -->
        <div v-if="selectedRole" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Permissions du rôle</h3>
          <div class="space-y-3">
            <div
              v-for="(permission, key) in rolePermissions"
              :key="key"
              class="flex items-center gap-3"
            >
              <font-awesome-icon
                :icon="['fas', permission.allowed ? 'check-circle' : 'times-circle']"
                :class="permission.allowed ? 'text-emerald-500' : 'text-red-500'"
              />
              <span class="text-sm text-[var(--text-secondary)]">{{ permission.label }}</span>
            </div>
          </div>
        </div>

        <!-- Help card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Aide</h3>
          <div class="space-y-4 text-sm text-[var(--text-muted)]">
            <div class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="text-[var(--color-primary)] mt-0.5" />
              <p>Les champs marqués d'un astérisque (*) sont obligatoires.</p>
            </div>
            <div class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'envelope']" class="text-[var(--color-primary)] mt-0.5" />
              <p>L'utilisateur recevra un email de bienvenue avec ses identifiants.</p>
            </div>
            <div class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'shield-alt']" class="text-[var(--color-primary)] mt-0.5" />
              <p>Le mot de passe doit contenir au moins 8 caractères.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/types/auth'
import type { UserFormData } from '~/services/utilisateurs.service'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const utilisateursService = useUtilisateursService()
const api = useApi()

const isSubmitting = ref(false)
const showPassword = ref(false)
const confirmPassword = ref('')
const isLoadingCommunes = ref(false)

const roles = ref<Role[]>([])
const communes = ref<{ id: number; nom: string; region_nom?: string }[]>([])

const form = ref<UserFormData>({
  email: '',
  nom: '',
  prenom: '',
  password: '',
  role: '',
  commune_id: null,
  actif: true,
})

const errors = ref<Partial<Record<keyof UserFormData, string>>>({})

const selectedRole = computed(() => {
  return roles.value.find(r => r.code === form.value.role)
})

const getRoleDescription = (code: string) => {
  switch (code) {
    case 'admin':
      return 'Accès complet à toutes les fonctionnalités et paramètres.'
    case 'editeur':
      return 'Peut créer et modifier des données, sans accès aux paramètres.'
    case 'lecteur':
      return 'Accès en lecture seule aux données.'
    case 'commune':
      return 'Accès limité aux données de sa commune.'
    default:
      return ''
  }
}

const rolePermissions = computed(() => {
  const code = selectedRole.value?.code
  return {
    view_data: { label: 'Consulter les données', allowed: true },
    edit_data: { label: 'Modifier les données', allowed: ['admin', 'editeur'].includes(code || '') },
    manage_users: { label: 'Gérer les utilisateurs', allowed: code === 'admin' },
    manage_settings: { label: 'Gérer les paramètres', allowed: code === 'admin' },
    export_data: { label: 'Exporter les données', allowed: ['admin', 'editeur'].includes(code || '') },
  }
})

const passwordStrength = computed(() => {
  const password = form.value.password || ''
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  return strength
})

const passwordStrengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return 'bg-red-500'
    case 2:
      return 'bg-amber-500'
    case 3:
      return 'bg-emerald-500'
    case 4:
      return 'bg-emerald-500'
    default:
      return 'bg-[var(--bg-tertiary)]'
  }
})

const passwordStrengthTextColor = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return 'text-red-500'
    case 2:
      return 'text-amber-500'
    case 3:
    case 4:
      return 'text-emerald-500'
    default:
      return 'text-[var(--text-muted)]'
  }
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return 'Faible'
    case 2:
      return 'Moyen'
    case 3:
      return 'Fort'
    case 4:
      return 'Très fort'
    default:
      return ''
  }
})

const isFormValid = computed(() => {
  if (!form.value.nom || !form.value.email || !form.value.role) return false
  if (!form.value.password || form.value.password.length < 8) return false
  if (form.value.password !== confirmPassword.value) return false
  if (selectedRole.value?.code === 'commune' && !form.value.commune_id) return false
  return true
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.nom) {
    errors.value.nom = 'Le nom est requis'
  }

  if (!form.value.email) {
    errors.value.email = 'L\'email est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'L\'email n\'est pas valide'
  }

  if (!form.value.role) {
    errors.value.role = 'Le rôle est requis'
  }

  if (!form.value.password) {
    errors.value.password = 'Le mot de passe est requis'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
  }

  return Object.keys(errors.value).length === 0
}

const createUser = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    await utilisateursService.createUtilisateur(form.value)
    router.push('/admin/utilisateurs')
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error?.message) {
      // Afficher l'erreur du backend (ex: email déjà existant)
      if (error.message.toLowerCase().includes('email')) {
        errors.value.email = error.message
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

const loadRoles = () => {
  roles.value = utilisateursService.getRoles()
}

const loadCommunes = async () => {
  isLoadingCommunes.value = true
  try {
    const data = await api.get<Array<{ id: number; nom: string; region_nom?: string }>>('/api/v1/geo/communes', { limit: 500 })
    communes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error loading communes:', error)
    communes.value = []
  } finally {
    isLoadingCommunes.value = false
  }
}

// Charger les communes quand le rôle change à "commune"
watch(() => form.value.role, (newRole) => {
  if (newRole === 'commune' && communes.value.length === 0) {
    loadCommunes()
  }
  if (newRole !== 'commune') {
    form.value.commune_id = null
  }
})

onMounted(() => {
  loadRoles()
})
</script>
