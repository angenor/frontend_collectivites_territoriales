# 🚀 Démarrage Rapide - Frontend Nuxt

## ✅ Problème Résolu

L'erreur Supabase a été **corrigée** en supprimant :
- Les packages `@nuxtjs/supabase`, `@supabase/supabase-js`, `@prisma/client`, `prisma`
- Le dossier `server/api/` qui contenait des API Nuxt utilisant Supabase
- Le module Supabase dans la configuration Nuxt

**Nous utilisons maintenant uniquement FastAPI pour le backend.**

---

## 🛠️ Prérequis

- **Node.js 18+**
- **pnpm** (gestionnaire de paquets)
- **Backend FastAPI** en cours d'exécution sur `http://localhost:8000`

---

## 📦 Installation

```bash
cd frontend_collectivites_territoriales

# Installer les dépendances
pnpm install

# Vérifier que le fichier .env existe
cat .env
# Doit contenir : NUXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

---

## 🚀 Démarrer le Serveur

```bash
# Lancer le serveur de développement
pnpm dev

# Le serveur démarrera sur http://localhost:3000
# (ou http://localhost:3001 si le port 3000 est occupé)
```

**Résultat attendu** :
```
✔ Nuxt 4.1.3 ready
➜ Local:    http://localhost:3000/
➜ DevTools: press Shift + Option + D in the browser
```

---

## 🌐 Routes Disponibles

### Pages Publiques
- **Accueil** : http://localhost:3000/
- **Login** : http://localhost:3000/auth/login
- **Register** : http://localhost:3000/auth/register

### Back-Office (Protégé)
- **Dashboard** : http://localhost:3000/admin
- **Utilisateurs** : http://localhost:3000/admin/utilisateurs
- **Régions** : http://localhost:3000/admin/collectivites/regions
- **Communes** : http://localhost:3000/admin/collectivites/communes
- **Rubriques** ⭐ : http://localhost:3000/admin/rubriques
- **Saisie Revenus** ⭐ : http://localhost:3000/admin/revenus/saisie

---

## 🔗 Connexion au Backend

Le frontend communique avec le backend FastAPI via :

```typescript
// app/composables/useApi.ts
const baseURL = 'http://localhost:8000' // Configurable via .env
```

### Endpoints Backend Requis

Pour que le frontend fonctionne, le backend doit exposer :

```
POST   /api/v1/auth/login           # Authentification
POST   /api/v1/auth/register        # Inscription
GET    /api/v1/utilisateurs/me      # Profil utilisateur
GET    /api/v1/utilisateurs         # Liste utilisateurs
GET    /api/v1/geographie/regions   # Liste régions
GET    /api/v1/geographie/communes  # Liste communes
GET    /api/v1/rubriques            # Liste rubriques
POST   /api/v1/revenus              # Créer revenus
```

---

## 🧪 Test sans Backend

Les pages utilisent actuellement des **données mock** (simulées).
Vous pouvez tester l'interface **sans avoir le backend** en cours d'exécution :

1. Allez sur http://localhost:3000/auth/login
2. Le design est visible mais la connexion ne fonctionnera pas
3. Toutes les pages du back-office sont accessibles en mode mock

---

## 📝 Configuration

### Fichier .env

```bash
# Backend FastAPI Configuration
NUXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

### Configuration Nuxt

La configuration se trouve dans [nuxt.config.ts](nuxt.config.ts) :
- Module Supabase **désactivé**
- API base URL configurée
- Dark mode activé
- Tailwind CSS v4

---

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Nettoyer les fichiers générés
rm -rf .nuxt .output

# Réinstaller les dépendances
rm -rf node_modules
pnpm install

# Relancer
pnpm dev
```

### Erreur "Port already in use"

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 pnpm dev
```

### Erreur CORS lors des appels API

Vérifier que le backend autorise le frontend :

```python
# backend/.env
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

---

## 📚 Documentation Complète

- **Plan Phase 1** : [PHASE1_IMPLEMENTATION.md](PHASE1_IMPLEMENTATION.md)
- **Plan Back-Office** : [bank/plans/back-office-plan.md](bank/plans/back-office-plan.md)
- **Cahier des charges** : [bank/cahier_des_charges/PCQVP_Plateforme_Revenus_Miniers.md](bank/cahier_des_charges/PCQVP_Plateforme_Revenus_Miniers.md)

---

## 🎯 Prochaines Étapes

1. ✅ **Tester l'interface** (frontend seul en mode mock)
2. ⏳ **Lancer le backend** FastAPI
3. ⏳ **Tester l'intégration** complète (frontend + backend)
4. ⏳ **Implémenter Phase 2** (Documents, Projets Miniers, etc.)

---

## 📞 Support

**Organisation** : Transparency International Madagascar
**Email** : vramaherison@transparency.mg
**Date** : 22 Novembre 2025

---

**Le frontend est maintenant prêt à être utilisé !** 🎉
