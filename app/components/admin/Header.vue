<template>
  <header
    :class="[
      'fixed top-0 right-0 z-[var(--z-sticky)] h-16 bg-[var(--bg-header)] border-b border-[var(--border-default)] flex items-center justify-between px-4 lg:px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'
    ]"
  >
    <!-- Left section -->
    <div class="flex items-center gap-4">
      <!-- Mobile menu button -->
      <button
        @click="$emit('toggle-mobile-sidebar')"
        class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
      </button>

      <!-- Breadcrumb -->
      <AdminBreadcrumb />
    </div>

    <!-- Right section -->
    <div class="flex items-center gap-2">
      <!-- Search button (mobile) -->
      <button
        class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </button>

      <!-- Search bar (desktop) -->
      <div class="hidden lg:flex items-center">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-sm" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            class="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd class="hidden xl:inline-flex px-2 py-0.5 text-xs font-mono text-[var(--text-muted)] bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="hidden lg:block h-6 w-px bg-[var(--border-default)] mx-2" />

      <!-- Notifications -->
      <button
        class="relative flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'bell']" />
        <!-- Notification badge -->
        <span
          v-if="notificationCount > 0"
          class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-[var(--color-error)] rounded-full"
        >
          {{ notificationCount > 99 ? '99+' : notificationCount }}
        </span>
      </button>

      <!-- Theme toggle -->
      <button
        @click="toggleDarkMode"
        class="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
        :title="isDark ? 'Mode clair' : 'Mode sombre'"
      >
        <font-awesome-icon :icon="['fas', isDark ? 'sun' : 'moon']" />
      </button>

      <!-- User menu -->
      <AdminUserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  sidebarCollapsed: boolean
}>()

defineEmits<{
  'toggle-mobile-sidebar': []
}>()

const { isDark, toggleDarkMode } = useDarkMode()

// TODO: Replace with real notification count from API
const notificationCount = ref(3)
</script>
