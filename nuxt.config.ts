// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    'animate.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Configuration des transitions de pages et polices
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
    head: {
      link: [
        // Google Fonts - Barlow Condensed (équivalent Folio BdCn BT pour les titres)
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  modules: [
    '@nuxt/image',
    // '@nuxt/content',
    '@nuxt/test-utils',
    '@nuxt/ui',
    // '@nuxtjs/supabase' // Désactivé - on utilise FastAPI directement
  ],

  // Auto-import des services
  imports: {
    dirs: ['services'],
  },

  // Configuration des variables d'environnement
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    }
  },

  // Configuration Nitro pour la production
  nitro: {
    compressPublicAssets: true,
    // Prerendering désactivé car les routes API nécessitent la DB
    // qui n'est pas disponible pendant le build Docker
    prerender: {
      crawlLinks: false,
      routes: []
    }
  }
})