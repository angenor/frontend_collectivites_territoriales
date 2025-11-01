# Hero Section - Documentation

## Nouvelle Hero Section Implémentée

Une **hero section moderne et immersive** a été créée avec image de fond, logos et formulaire de recherche intégré.

## 🎨 Design Features

### Image de Fond
- **Source** : `/public/images/hero_background.jpg` (site minier)
- **Overlay** : Gradient bleu pour lisibilité
- **Pattern** : Texture subtile en overlay
- **Responsive** : S'adapte à toutes les tailles d'écran

### Logos
Deux logos affichés en haut avec effet glassmorphism :
- Logo TI Madagascar (fond noir, texte blanc)
- Logo PCQVP Madagascar (fond noir, texte bleu)
- Effet hover avec scale et glow

### Formulaire de Recherche
- Design moderne en **glassmorphism** (fond blanc translucide avec blur)
- 4 champs alignés en grille responsive :
  1. **Région** (menu déroulant)
  2. **District** (filtré par région)
  3. **Commune** (filtrée par district)
  4. **Année** (2020-2024)
- Bouton de recherche avec icônes et animation hover
- Info-box montrant la sélection actuelle

### Indicateurs Clés (en bas)
3 cartes avec statistiques :
- 📊 **22 Régions**
- 👥 **119 Communes**
- 📄 **Année active : 2024**

### Badges de Valeurs
3 badges circulaires avec icônes :
- ✅ Transparence
- ✅ Redevabilité
- ✅ Accessibilité

## 🎬 Animations

### Au Chargement
- **Logos** : Fade in (1s)
- **Titre** : Slide up (0.8s + 0.2s delay)
- **Formulaire** : Fade in up (1s + 0.4s delay)
- **Indicateurs** : Slide up (1s + 0.6s delay)

### Interactions
- **Hover logos** : Scale 1.05 + glow
- **Hover bouton** : Scale 1.05 + shadow
- **Scroll indicator** : Bounce animation
- **Transitions** : Smooth sur tous les éléments

## 📁 Structure des Fichiers

```
public/
└── images/
    ├── hero_background.jpg  (283 KB)
    └── logos/
        ├── logo_fond_noire_texte_blanc.jpeg
        ├── logo_fond_noire_texte_bleu.jpeg
        └── logo_fond_bleu_texte_blanc.jpeg

app/
└── components/
    ├── HeroSection.vue       (NOUVEAU - 420 lignes)
    ├── PlatformHeader.vue    (Remplacé par HeroSection)
    └── SelectionCollectivite.vue  (Intégré dans HeroSection)
```

## 🔧 Changements dans index.vue

### Avant
```vue
<PlatformHeader />
<SelectionCollectivite @search="handleSearch" />
```

### Après
```vue
<HeroSection @search="handleSearch" />
```

La hero section combine désormais :
- En-tête de la plateforme
- Formulaire de sélection
- Informations contextuelles
- Design immersif

## 📱 Responsive Design

### Mobile (< 640px)
- Logos empilés verticalement
- Formulaire en 1 colonne
- Texte réduit
- Indicateurs en 1 colonne

### Tablet (640px - 1024px)
- Formulaire en 2 colonnes
- Logos côte à côte
- Indicateurs en grille

### Desktop (> 1024px)
- Formulaire en 4 colonnes
- Tous les éléments visibles
- Hero height : 700px

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Overlay gradient** : `from-blue-900/95 via-blue-800/90 to-blue-900/85`
- **Texte** : Blanc (`text-white`)
- **Accents** : Bleu clair (`text-blue-100`, `text-blue-50`)
- **Badges** : Vert pour les check marks (`text-green-400`)

### Glassmorphism
- **Background** : `bg-white/95` ou `bg-white/10`
- **Backdrop blur** : `backdrop-blur-lg` / `backdrop-blur-md`
- **Bordures** : `border-white/20`

## 🚀 Fonctionnalités

### Sélection en Cascade ✅
1. Choisir **région** → active le district
2. Choisir **district** → active la commune
3. Choisir **commune** → active le bouton rechercher
4. Cliquer **rechercher** → émet l'événement `@search`

### Validation ✅
- Bouton désactivé si aucune commune sélectionnée
- Style grisé avec `disabled:` classes
- Message d'alerte si recherche sans commune

### Info-box ✅
- Apparaît quand une commune est sélectionnée
- Affiche le chemin complet : Région → District → Commune (Année)
- Icône info avec fond bleu clair
- Animation fade in/out

### Scroll Indicator ✅
- Flèche animée en bas
- Bounce effect
- Indique qu'il y a du contenu en dessous

## 📊 Statistiques Mock

Les nombres affichés sont des estimations pour Madagascar :
- **22 Régions** (nombre réel)
- **119 Communes** (estimation, à ajuster avec données réelles)
- **2024** (année active par défaut)

## 🎯 SEO et Performance

### Image Optimization
- Format JPEG optimisé (283 KB)
- Chargement lazy possible
- Alt text descriptif

### CSS
- Animations CSS natives (performant)
- Tailwind classes (optimisé en production)
- Backdrop-filter avec fallback

### Accessibilité
- Labels pour tous les selects
- Alt text sur images
- Aria-label sur boutons
- Contraste texte/fond suffisant

## 🔮 Améliorations Futures

### Phase 1
- [ ] Lazy loading pour l'image de fond
- [ ] Optimisation WebP + fallback JPEG
- [ ] Animation au scroll (parallax subtil)

### Phase 2
- [ ] Stats en temps réel depuis Supabase
- [ ] Autocomplete sur les champs
- [ ] Historique des recherches (localStorage)

### Phase 3
- [ ] Multi-langues (FR/MG/EN)
- [ ] Dark mode support
- [ ] Vidéo de fond (optionnel)

## 🐛 Dépannage

### Image ne s'affiche pas
- Vérifier que le fichier existe : `/public/images/hero_background.jpg`
- Vérifier les permissions du fichier
- Essayer en dev : `pnpm dev` puis F5

### Logos ne s'affichent pas
- Vérifier `/public/images/logos/*.jpeg`
- Vérifier les chemins dans le code
- Console browser pour erreurs 404

### Formulaire ne fonctionne pas
- Vérifier que `useMockData()` est disponible
- Vérifier la console pour erreurs JS
- Tester avec données mock d'abord

## 💡 Conseils de Personnalisation

### Changer l'image de fond
Remplacer `/public/images/hero_background.jpg` par votre image :
- Taille recommandée : 1920x1080px
- Format : JPEG ou WebP
- Poids : < 500 KB

### Changer les couleurs
Modifier les classes Tailwind dans `HeroSection.vue` :
```vue
<!-- Remplacer blue-900 par votre couleur -->
<div class="bg-gradient-to-r from-blue-900/95 ...">
```

### Ajuster la hauteur
```vue
<!-- Dans HeroSection.vue -->
<section class="min-h-[600px] lg:min-h-[700px]">
```

### Modifier les stats
Éditer les valeurs hardcodées en bas de `HeroSection.vue` :
```vue
<p class="text-3xl font-bold text-white">22</p>  <!-- Changer ici -->
<p class="text-sm text-blue-100">Régions</p>
```

## 📚 Ressources

### Images Sources
- Image de fond : `/bank/cahier_des_charges/images/hero_background.jpg`
- Logos : `/bank/cahier_des_charges/images/logos/`
- Exemple : `/bank/cahier_des_charges/images/exemples/hero_accueil.png`

### Documentation
- Tailwind CSS : https://tailwindcss.com/docs
- Vue 3 Composition API : https://vuejs.org/guide/
- Nuxt 3 : https://nuxt.com/docs

## ✅ Checklist de Vérification

Avant de déployer en production :

- [x] Images copiées dans `/public/images/`
- [x] Composant `HeroSection.vue` créé
- [x] Intégration dans `index.vue`
- [x] Formulaire fonctionnel
- [x] Animations fluides
- [x] Responsive testé
- [ ] Tests sur navigateurs (Chrome, Firefox, Safari, Edge)
- [ ] Tests mobile réel
- [ ] Optimisation images (WebP)
- [ ] Accessibilité validée (WCAG 2.1)
- [ ] Performance mesurée (Lighthouse > 90)

---

**Créé le** : 01 Novembre 2024
**Version** : 1.0.0
**Développeur** : Claude Code
**Client** : PCQVP Madagascar / TI Madagascar
