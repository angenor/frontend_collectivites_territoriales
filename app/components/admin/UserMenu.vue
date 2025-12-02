<template>
  <div class="relative" ref="menuRef">
    <!-- Trigger button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
    >
      <!-- Avatar -->
      <div class="relative">
        <div class="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-sm">
          {{ userInitials }}
        </div>
        <!-- Online indicator -->
        <span class="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-success)] border-2 border-[var(--bg-header)] rounded-full" />
      </div>

      <!-- User info (desktop only) -->
      <div class="hidden xl:block text-left">
        <p class="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]">
          {{ user?.nom_complet || user?.nom || 'Utilisateur' }}
        </p>
        <p class="text-xs text-[var(--text-muted)] truncate max-w-[120px]">
          {{ roleLabel }}
        </p>
      </div>

      <!-- Chevron -->
      <font-awesome-icon
        :icon="['fas', 'chevron-down']"
        :class="[
          'hidden xl:block w-3 h-3 text-[var(--text-muted)] transition-transform',
          isOpen ? 'rotate-180' : ''
        ]"
      />
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg py-1 z-[var(--z-dropdown)]"
      >
        <!-- User header -->
        <div class="px-4 py-3 border-b border-[var(--border-light)]">
          <p class="text-sm font-medium text-[var(--text-primary)]">
            {{ user?.nom_complet || user?.nom || 'Utilisateur' }}
          </p>
          <p class="text-xs text-[var(--text-muted)] truncate">
            {{ user?.email }}
          </p>
        </div>

        <!-- Menu items -->
        <div class="py-1">
          <NuxtLink
            to="/admin/profil"
            class="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
            @click="isOpen = false"
          >
            <font-awesome-icon :icon="['fas', 'user']" class="w-4 h-4" />
            <span>Mon profil</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/parametres"
            class="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
            @click="isOpen = false"
          >
            <font-awesome-icon :icon="['fas', 'gear']" class="w-4 h-4" />
            <span>Paramètres</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            target="_blank"
            class="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
            @click="isOpen = false"
          >
            <font-awesome-icon :icon="['fas', 'external-link-alt']" class="w-4 h-4" />
            <span>Voir le site</span>
          </NuxtLink>
        </div>

        <!-- Logout -->
        <div class="border-t border-[var(--border-light)] py-1">
          <button
            @click="handleLogout"
            class="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// User initials for avatar
const userInitials = computed(() => {
  if (!user.value) return '?'

  const nom = user.value.nom || ''
  const prenom = user.value.prenom || ''

  if (prenom && nom) {
    return `${prenom[0]}${nom[0]}`.toUpperCase()
  }

  return nom.substring(0, 2).toUpperCase() || 'U'
})

// Role label
const roleLabel = computed(() => {
  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    editeur: 'Éditeur',
    lecteur: 'Lecteur',
    commune: 'Gestionnaire Commune',
  }

  return roleLabels[user.value?.role?.code || ''] || 'Utilisateur'
})

// Handle logout
const handleLogout = async () => {
  isOpen.value = false
  await logout()
}

// Close menu on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Close on escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>
