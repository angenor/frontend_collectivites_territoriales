<template>
  <footer class="bg-gray-800 dark:bg-gray-950 text-white mt-16 print:hidden transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid md:grid-cols-3 gap-8">
        <div>
          <h3 class="font-bold text-lg mb-3">À propos</h3>
          <p class="text-gray-300 dark:text-gray-400 text-sm">
            Projet "Minerais critiques : justice fiscale et redistribution de revenus"
            mené par PCQVP Madagascar et TI Madagascar.
          </p>
        </div>
        <div>
          <h3 class="font-bold text-lg mb-3">Contact</h3>
          <p class="text-gray-300 dark:text-gray-400 text-sm">
            Email: vramaherison@transparency.mg<br>
            Transparency International - Initiative Madagascar
          </p>
        </div>
        <div>
          <h3 class="font-bold text-lg mb-3">Ressources</h3>
          <p class="text-gray-300 dark:text-gray-400 text-sm">
            Plateforme de suivi des revenus miniers<br>
            Collectivités Territoriales de Madagascar
          </p>
        </div>
      </div>
      <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-400 dark:text-gray-500 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.</p>
        <p class="mt-3 text-gray-500 dark:text-gray-600">
          Plateforme développée par
          <a
            href="https://www.linkedin.com/company/herhero-forchange/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-400 hover:text-blue-300 dark:text-blue-500 dark:hover:text-blue-400 transition font-medium"
          >
            HerHero
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
