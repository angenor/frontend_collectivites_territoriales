<script setup lang="ts">
// Navigation principale de l'application
</script>

<template>
  <nav class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo et titre -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span class="font-bold text-lg text-gray-800 dark:text-white">Revenus Miniers</span>
          </NuxtLink>
        </div>

        <!-- Liens de navigation et ThemeToggle -->
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
          >
            Accueil
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
          >
            À propos
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
          >
            Contact
          </NuxtLink>

          <!-- Bouton de bascule du thème -->
          <ThemeToggle />
        </div>
      </div>
    </div>
  </nav>
</template>
