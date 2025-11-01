# Guide d'utilisation de Font Awesome dans le projet

## Configuration

Font Awesome a été installé et configuré pour ce projet Nuxt 4.

### Packages installés
- `@fortawesome/fontawesome-svg-core` - Bibliothèque principale
- `@fortawesome/free-solid-svg-icons` - Icônes solides gratuites
- `@fortawesome/free-regular-svg-icons` - Icônes régulières gratuites
- `@fortawesome/free-brands-svg-icons` - Icônes de marques gratuites
- `@fortawesome/vue-fontawesome` - Composant Vue pour Font Awesome

## Utilisation dans les composants

### Syntaxe de base

```vue
<template>
  <div>
    <!-- Icône simple -->
    <font-awesome-icon icon="home" />

    <!-- Icône avec taille -->
    <font-awesome-icon icon="user" size="2x" />

    <!-- Icône régulière (far) -->
    <font-awesome-icon :icon="['far', 'heart']" />

    <!-- Icône de marque -->
    <font-awesome-icon :icon="['fab', 'github']" />

    <!-- Icône avec classes Tailwind -->
    <font-awesome-icon icon="search" class="text-blue-600 w-6 h-6" />
  </div>
</template>
```

### Exemples d'utilisation

#### Bouton avec icône
```vue
<button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
  <font-awesome-icon icon="download" />
  <span>Télécharger</span>
</button>
```

#### Icône animée
```vue
<!-- Icône qui tourne (spinner) -->
<font-awesome-icon icon="spinner" spin />

<!-- Icône qui pulse -->
<font-awesome-icon icon="heart" beat />
```

#### Icône avec couleur et taille
```vue
<font-awesome-icon
  icon="check-circle"
  class="text-green-500 dark:text-green-400"
  size="3x"
/>
```

#### Navigation avec icônes
```vue
<nav class="flex gap-4">
  <a href="/" class="flex items-center gap-2">
    <font-awesome-icon icon="home" />
    <span>Accueil</span>
  </a>
  <a href="/search" class="flex items-center gap-2">
    <font-awesome-icon icon="search" />
    <span>Rechercher</span>
  </a>
  <a href="/profile" class="flex items-center gap-2">
    <font-awesome-icon icon="user" />
    <span>Profil</span>
  </a>
</nav>
```

## Tailles disponibles

- `xs` - Extra petit
- `sm` - Petit
- `lg` - Grand
- `2x`, `3x`, `4x`, `5x`, etc. - Multiples

```vue
<font-awesome-icon icon="home" size="xs" />
<font-awesome-icon icon="home" size="sm" />
<font-awesome-icon icon="home" size="lg" />
<font-awesome-icon icon="home" size="2x" />
```

## Animations

```vue
<!-- Rotation -->
<font-awesome-icon icon="sync" spin />

<!-- Pulse -->
<font-awesome-icon icon="heart" beat />

<!-- Bounce -->
<font-awesome-icon icon="arrow-up" bounce />

<!-- Fade -->
<font-awesome-icon icon="circle" fade />
```

## Icônes disponibles

### Icônes courantes déjà importées

**Navigation & Interface**
- `home`, `search`, `bars`, `times`, `cog`
- `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`
- `arrow-left`, `arrow-up`

**Fichiers & Documents**
- `file-alt`, `file-pdf`, `file-excel`, `file-word`
- `download`, `print`, `table`

**Utilisateur & Social**
- `user`, `users`, `envelope`, `phone`
- `facebook`, `twitter`, `linkedin`, `github`, `youtube`, `instagram`

**UI Elements**
- `sun`, `moon` (pour dark mode)
- `eye`, `eye-slash`
- `edit`, `trash`, `plus`, `minus`
- `spinner` (loading)

**Business & Finance**
- `chart-bar`, `money-bill-wave`, `building`, `industry`, `landmark`

**Status & Feedback**
- `check-circle`, `info-circle`, `exclamation-triangle`, `times-circle`

**Media**
- `image`, `camera`, `globe`, `link`, `external-link-alt`

**Calendar & Time**
- `calendar`

**Misc**
- `heart`, `star`, `circle`, `square`, `map-marker-alt`

## Ajouter de nouvelles icônes

Pour ajouter de nouvelles icônes, modifiez le fichier `app/plugins/fontawesome.ts` :

1. Importez l'icône :
```typescript
import { faNewIcon } from '@fortawesome/free-solid-svg-icons'
```

2. Ajoutez-la à la bibliothèque :
```typescript
library.add(
  // ... autres icônes
  faNewIcon
)
```

3. Utilisez-la dans vos composants :
```vue
<font-awesome-icon icon="new-icon" />
```

## Styles avec Tailwind CSS

Font Awesome fonctionne parfaitement avec Tailwind :

```vue
<!-- Couleur -->
<font-awesome-icon icon="home" class="text-blue-600 dark:text-blue-400" />

<!-- Taille avec Tailwind -->
<font-awesome-icon icon="user" class="w-8 h-8" />

<!-- Hover effects -->
<font-awesome-icon
  icon="heart"
  class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
/>
```

## Ressources

- [Documentation Font Awesome](https://fontawesome.com/docs)
- [Vue Font Awesome](https://github.com/FortAwesome/vue-fontawesome)
- [Recherche d'icônes](https://fontawesome.com/icons)
