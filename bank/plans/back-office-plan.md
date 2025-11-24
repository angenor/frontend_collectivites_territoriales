# PLAN D'IMPL�MENTATION DU BACK-OFFICE
## Plateforme de Suivi des Revenus Miniers - TI Madagascar

---

## <� OBJECTIFS DU BACK-OFFICE

- Interface d'administration s�curis�e et intuitive
- Gestion compl�te du contenu sans intervention technique
- Suivi en temps r�el des activit�s et statistiques
- Gestion des utilisateurs avec contr�le d'acc�s par r�les
- Outils de communication (newsletter, messagerie s�curis�e)
- Tableaux de bord analytiques pour la prise de d�cision

---

## = 1. AUTHENTIFICATION & S�CURIT�

### 1.1 Syst�me d'authentification
- **Login s�curis�** avec email/mot de passe
- **Authentification JWT** (JSON Web Token)
- **Sessions utilisateur** avec timeout automatique
- **Double authentification (2FA)** optionnelle pour administrateurs
- **Gestion des mots de passe**
  - R�initialisation par email
  - Politique de complexit�
  - Expiration p�riodique
  - Historique des mots de passe

### 1.2 Gestion des r�les et permissions
- **R�les pr�d�finis** :
  - Super Administrateur (acc�s total)
  - Administrateur (gestion contenu + utilisateurs)
  - �diteur (gestion contenu uniquement)
  - Gestionnaire Commune (acc�s limit� � sa commune)
  - Visualiseur (lecture seule)

- **Permissions granulaires** :
  - CRUD sur chaque module
  - Export de donn�es
  - Validation de donn�es
  - Gestion des utilisateurs
  - Acc�s aux statistiques
  - Configuration syst�me

---

## =e 2. GESTION DES UTILISATEURS

### 2.1 Module Utilisateurs
- **Liste des utilisateurs** avec filtres et recherche
  - Filtres : r�le, statut (actif/inactif), commune, date cr�ation
  - Recherche : nom, email, username
  - Tri : alphab�tique, date cr�ation, dernier login

- **Cr�ation/Modification d'utilisateur**
  - Informations personnelles (nom, pr�nom, email, t�l�phone)
  - Attribution de r�le
  - Rattachement � une commune (optionnel)
  - Activation/D�sactivation du compte
  - Envoi automatique d'email de bienvenue

- **Gestion des r�les**
  - Cr�ation de r�les personnalis�s
  - Configuration des permissions par r�le
  - Affectation de permissions sp�cifiques

- **Historique des connexions**
  - Date/heure du dernier login
  - Adresse IP
  - Appareil utilis�
  - Tentatives de connexion �chou�es

---

## =� 3. GESTION DES DONN�ES G�OGRAPHIQUES

### 3.1 Module R�gions
- **Liste des r�gions** de Madagascar
- **CRUD R�gions** :
  - Code r�gion (unique)
  - Nom
  - Description
  - Statut (actif/inactif)
- **Statistiques par r�gion** :
  - Nombre de d�partements
  - Nombre de communes
  - Total des revenus miniers

### 3.2 Module D�partements
- **Liste des d�partements** avec filtrage par r�gion
- **CRUD D�partements** :
  - Code d�partement
  - Nom
  - R�gion de rattachement
  - Description
  - Statut
- **Statistiques par d�partement** :
  - Nombre de communes
  - Projets miniers actifs
  - Revenus collect�s

### 3.3 Module Communes
- **Liste des communes** avec filtres multiples
  - Par r�gion
  - Par d�partement
  - Par statut
  - Par pr�sence de projets miniers

- **CRUD Communes** :
  - Code commune
  - Nom
  - D�partement de rattachement
  - R�gion de rattachement
  - Population
  - Superficie
  - Description
  - Statut

- **Tableau de bord par commune** :
  - Projets miniers associ�s
  - Revenus par ann�e
  - �volution des revenus (graphiques)
  - Documents associ�s
  - Utilisateurs rattach�s

---

## � 4. GESTION DES PROJETS MINIERS

### 4.1 Module Types de Minerais
- **Liste des types de minerais** (or, nickel, cobalt, chrome, etc.)
- **CRUD Types de minerais** :
  - Code unique
  - Nom
  - Description
  - Statut

### 4.2 Module Soci�t�s Mini�res
- **Liste des soci�t�s mini�res**
- **CRUD Soci�t�s** :
  - Code unique
  - Nom commercial
  - Raison sociale
  - NIF (Num�ro d'Identification Fiscale)
  - STAT (num�ro statistique)
  - Adresse
  - T�l�phone
  - Email
  - Statut

- **Fiche d�taill�e soci�t�** :
  - Projets miniers actifs
  - Historique des projets
  - Revenus g�n�r�s par projet
  - Documents l�gaux

### 4.3 Module Projets Miniers
- **Liste des projets** avec filtres :
  - Par soci�t� mini�re
  - Par type de minerai
  - Par commune/r�gion
  - Par statut (actif, suspendu, termin�)
  - Par p�riode

- **CRUD Projets miniers** :
  - Code unique
  - Nom du projet
  - Soci�t� mini�re
  - Type de minerai
  - Commune d'implantation
  - Date de d�but
  - Date de fin
  - Statut
  - Description

- **Tableau de bord projet** :
  - Revenus g�n�r�s par p�riode
  - Communes b�n�ficiaires
  - �volution temporelle
  - Documents associ�s

---

## =� 5. GESTION DES REVENUS MINIERS (MODULE CENTRAL)

### 5.1 Module Exercices Fiscaux
- **Liste des exercices** (ann�es fiscales)
- **CRUD Exercices** :
  - Ann�e
  - Date de d�but
  - Date de fin
  - Statut (ouvert/cl�tur�)

- **Cl�ture d'exercice** :
  - Validation des donn�es
  - Verrouillage des modifications
  - G�n�ration de rapports annuels

### 5.2 Module P�riodes
- **Gestion des p�riodes** par exercice
  - Mensuel, Trimestriel, Semestriel, Annuel
- **CRUD P�riodes** :
  - Code
  - Nom
  - Exercice de rattachement
  - Date d�but/fin
  - Type de p�riode
  - Ordre d'affichage

### 5.3 Module Cat�gories de Rubriques
- **Gestion des cat�gories** pour organiser les rubriques
- **CRUD Cat�gories** :
  - Code unique
  - Nom
  - Description
  - Ordre d'affichage

### 5.4 Module Rubriques (FONCTIONNALIT� CL�)
**Interface "sans code" pour g�rer les lignes du tableau**

- **Arborescence des rubriques** (structure hi�rarchique)
  - Rubriques principales (niveau 1)
  - Sous-rubriques (niveaux 2, 3, etc.)
  - Glisser-d�poser pour r�organiser
  - Indentation visuelle

- **CRUD Rubriques** :
  - Code unique
  - Nom de la rubrique
  - Cat�gorie
  - Rubrique parent (pour hi�rarchie)
  - Niveau dans la hi�rarchie
  - Ordre d'affichage
  - Type (recette, d�pense, solde, autre)
  - Formule de calcul (si rubrique calcul�e)
  - Afficher total (oui/non)
  - Description
  - Statut

- **Formules de calcul** :
  - Interface visuelle pour cr�er des formules
  - R�f�rencement d'autres rubriques
  - Op�rateurs : +, -, *, /, ()
  - Pr�visualisation du r�sultat
  - Validation de formule

- **Pr�visualisation** :
  - Voir le tableau tel qu'il appara�tra en front-office
  - Tester l'affichage avec donn�es r�elles

### 5.5 Module Colonnes Personnalis�es
**Ajout de colonnes dynamiques sans coder**

- **Liste des colonnes personnalis�es**
- **CRUD Colonnes** :
  - Code unique
  - Nom de la colonne
  - Type de donn�es (texte, nombre, date, bool�en, JSON)
  - Ordre d'affichage
  - Obligatoire (oui/non)
  - Visible (oui/non)
  - �ditable (oui/non)
  - Valeur par d�faut

- **Aper�u tableau dynamique** :
  - Visualisation des colonnes personnalis�es
  - R�organisation par glisser-d�poser
  - Masquer/Afficher colonnes

### 5.6 Module Saisie des Revenus
**Interface de saisie des donn�es financi�res**

- **Tableau de saisie interactif** :
  - S�lection : Commune + P�riode + Exercice
  - Affichage automatique des rubriques configur�es
  - Saisie en ligne (inline editing)
  - Auto-sauvegarde
  - Calcul automatique des rubriques calcul�es
  - Validation des donn�es

- **Formulaire de saisie d�taill�** :
  - Commune
  - Rubrique
  - P�riode
  - Projet minier (optionnel)
  - Montant r�alis�
  - Montant pr�vu (budget)
  - �cart (auto-calcul�)
  - Taux de r�alisation (auto-calcul�)
  - Observations
  - Documents justificatifs (upload)

- **Import de donn�es** :
  - Upload fichier Excel
  - Mapping colonnes Excel � Rubriques
  - Pr�visualisation avant import
  - Validation des donn�es
  - Import en masse

- **Validation des revenus** :
  - Workflow de validation (brouillon � valid�)
  - Historique des validations
  - Commentaires de validation

### 5.7 Tableaux de Bord Revenus
- **Vue d'ensemble** :
  - Total revenus par exercice
  - �volution ann�e par ann�e
  - Top 10 communes b�n�ficiaires
  - R�partition par type de minerai
  - R�partition par r�gion

- **Graphiques interactifs** :
  - �volution temporelle (courbes)
  - Comparaison communes (barres)
  - R�partition (camemberts)
  - Carte g�ographique (heatmap)

- **Filtres avanc�s** :
  - Par commune/d�partement/r�gion
  - Par exercice/p�riode
  - Par projet minier
  - Par rubrique
  - Par statut de validation

---

## =� 6. GESTION DES DOCUMENTS

### 6.1 Module Types de Documents
- **Configuration des types** accept�s
- **CRUD Types de documents** :
  - Code unique
  - Nom
  - Description
  - Extensions autoris�es (.pdf, .xlsx, .docx, etc.)
  - Taille maximale (Mo)

### 6.2 Module Documents
- **Biblioth�que de documents** :
  - Liste avec miniatures/ic�nes
  - Filtres : type, commune, exercice, tags
  - Recherche plein texte dans les documents
  - Vue liste / Vue grille

- **Upload de documents** :
  - Upload multiple (drag & drop)
  - Barre de progression
  - Association automatique (commune, exercice, revenu)
  - Indexation automatique du contenu

- **CRUD Documents** :
  - Titre
  - Type de document
  - Commune associ�e
  - Exercice associ�
  - Revenu associ�
  - Description
  - Tags (mots-cl�s)
  - Fichier

- **Pr�visualisation** :
  - Lecteur PDF int�gr�
  - Pr�visualisation Office (si possible)
  - T�l�chargement

- **Moteur de recherche** :
  - Recherche full-text dans le contenu extrait
  - Recherche par tags
  - Recherche par m�tadonn�es
  - Filtres combin�s
  - R�sultats avec pertinence

### 6.3 Indexation automatique
- **Extraction de texte** :
  - PDF � texte
  - Word � texte
  - Excel � texte
  - Stockage dans `contenu_texte`

- **R�indexation** :
  - R�indexer un document
  - R�indexation en masse

---

## =� 7. GESTION DE LA NEWSLETTER

### 7.1 Module Abonn�s
- **Liste des abonn�s** :
  - Filtres : statut (actif/inactif, confirm�/non confirm�)
  - Recherche : email, nom
  - Export CSV/Excel

- **CRUD Abonn�s** :
  - Email
  - Nom
  - Pr�nom
  - Statut
  - Date de confirmation
  - Date d'inscription

- **Actions en masse** :
  - Activer/D�sactiver
  - Supprimer
  - Exporter

- **Validation des abonnements** :
  - Email de confirmation automatique
  - Lien de d�sabonnement

### 7.2 Module Campagnes Newsletter
- **Liste des campagnes** :
  - Filtres : statut (brouillon, programm�e, envoy�e)
  - Tri : date cr�ation, date envoi

- **Cr�ation de campagne** :
  - Titre
  - Sujet de l'email
  - �diteur WYSIWYG pour le contenu
  - Aper�u email
  - Choix des destinataires (tous, s�lection)
  - Programmation d'envoi

- **Statistiques campagne** :
  - Nombre de destinataires
  - Nombre d'envoy�s
  - Taux d'ouverture
  - Nombre de clics
  - Graphiques d'engagement

- **Templates d'email** :
  - Mod�les pr�d�finis
  - Personnalisation (logo, couleurs)
  - Variables dynamiques (nom, commune, etc.)

---

## =� 8. MESSAGERIE S�CURIS�E

### 8.1 Module Messages S�curis�s
- **Bo�te de r�ception** :
  - Messages re�us
  - Messages envoy�s
  - Messages archiv�s
  - Filtres : lu/non lu, priorit�, commune

- **Cr�ation de message** :
  - Destinataire (utilisateur)
  - Sujet
  - Contenu (�diteur riche)
  - Commune associ�e
  - Priorit� (basse, normale, haute, urgente)
  - Fichiers joints

- **Notifications** :
  - Badge de nouveaux messages
  - Email de notification (optionnel)
  - Notification push (si impl�ment�)

- **S�curit�** :
  - Chiffrement des messages
  - Audit trail (qui a lu, quand)
  - Possibilit� de suppression c�t� destinataire

### 8.2 Int�gration GlobalLeaks (optionnel)
- **Configuration GlobalLeaks** :
  - URL du serveur GlobalLeaks
  - Cl�s d'API
  - Mapping des cat�gories

- **R�ception de d�nonciations** :
  - Synchronisation automatique
  - Affichage dans le back-office
  - Workflow de traitement
  - Anonymat pr�serv�

---

## =� 9. STATISTIQUES ET LOGS

### 9.1 Tableau de bord Statistiques
- **Statistiques de visites** :
  - Visites par jour/semaine/mois
  - Pages les plus consult�es
  - Dur�e moyenne de session
  - G�olocalisation des visiteurs (si disponible)
  - Graphiques d'�volution

- **Statistiques de t�l�chargements** :
  - Nombre de t�l�chargements par jour/semaine/mois
  - Types d'exports les plus utilis�s (Excel, Word, PDF)
  - Documents les plus t�l�charg�s
  - T�l�chargements par commune/r�gion
  - Graphiques de tendance

- **Statistiques utilisateurs** :
  - Utilisateurs actifs vs inactifs
  - Connexions par jour
  - Utilisateurs par r�le
  - Utilisateurs par commune

### 9.2 Logs de Visites
- **Consultation des logs** :
  - Liste des visites
  - Filtres : page, utilisateur, date, IP
  - Export CSV

- **D�tails d'une visite** :
  - Page visit�e
  - Utilisateur (si connect�)
  - Adresse IP
  - User Agent (navigateur)
  - Session ID
  - Dur�e

### 9.3 Logs de T�l�chargements
- **Liste des t�l�chargements** :
  - Filtres : type d'export, document, commune, exercice, utilisateur, date
  - Export CSV

- **D�tails** :
  - Document/export t�l�charg�
  - Type d'export
  - Commune/exercice concern�
  - Utilisateur
  - IP
  - Date/heure

### 9.4 Logs d'Activit�s Syst�me
- **Journal d'audit** :
  - Toutes les actions CRUD
  - Connexions/d�connexions
  - Filtres : utilisateur, action, entit�, date
  - Recherche

- **D�tails d'une activit�** :
  - Utilisateur
  - Action (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
  - Entit� concern�e (table)
  - ID de l'entit�
  - Anciennes valeurs (JSON)
  - Nouvelles valeurs (JSON)
  - IP
  - User Agent
  - Date/heure

- **Analyse comportementale** :
  - Activit�s suspectes
  - Tentatives d'acc�s non autoris�es
  - Modifications sensibles

---

## � 10. CONFIGURATION SYST�ME

### 10.1 Param�tres G�n�raux
- **Informations site** :
  - Nom du site
  - Logo
  - Favicon
  - Description
  - Email de contact

- **Configuration email** :
  - Serveur SMTP
  - Port
  - Email exp�diteur
  - Nom exp�diteur
  - Authentification

- **Maintenance** :
  - Mode maintenance (activer/d�sactiver)
  - Message de maintenance
  - IPs autoris�es en mode maintenance

### 10.2 S�curit�
- **Politique de mot de passe** :
  - Longueur minimale
  - Complexit� requise
  - Expiration (jours)
  - R�utilisation interdite

- **Tentatives de connexion** :
  - Nombre max de tentatives
  - Dur�e de blocage
  - IP blacklist/whitelist

- **Sessions** :
  - Dur�e de session
  - Timeout d'inactivit�

### 10.3 Sauvegardes
- **Configuration backups** :
  - Fr�quence automatique
  - R�tention (nombre de backups)
  - Emplacement de stockage

- **Actions manuelles** :
  - Cr�er backup maintenant
  - Restaurer un backup
  - T�l�charger backup
  - Liste des backups

### 10.4 Mise � jour et Maintenance
- **V�rification des mises � jour** :
  - Framework
  - D�pendances
  - Alertes de s�curit�

- **Historique des mises � jour** :
  - Version
  - Date
  - Changelog

- **Outils de diagnostic** :
  - �tat de sant� du syst�me
  - Connexion base de donn�es
  - Espace disque
  - Performance

---

## =� 11. INTERFACE UTILISATEUR DU BACK-OFFICE

### 11.1 Navigation et Layout
- **Sidebar (menu lat�ral)** avec sections :
  - <� Tableau de bord (Dashboard)
  - =e Utilisateurs & R�les
  - =� G�ographie (R�gions/D�partements/Communes)
  - � Projets Miniers
  - =� Revenus Miniers
  - =� Rubriques & Tableaux
  - =� Documents
  - =� Newsletter
  - =� Messages S�curis�s
  - =� Statistiques & Logs
  - � Configuration

- **Top bar (barre sup�rieure)** :
  - Logo + Nom de l'organisation
  - Notifications (badge)
  - Messages non lus (badge)
  - Profil utilisateur (dropdown)
  - D�connexion

- **Breadcrumbs** (fil d'Ariane)
  - Navigation contextuelle

### 11.2 Composants R�utilisables
- **DataTables** :
  - Tri multi-colonnes
  - Filtres par colonne
  - Recherche globale
  - Pagination
  - Export (CSV, Excel, PDF)
  - Actions en masse (s�lection multiple)
  - Actions par ligne (�diter, supprimer, voir)

- **Formulaires** :
  - Validation en temps r�el
  - Messages d'erreur clairs
  - Champs requis marqu�s
  - Auto-sauvegarde (brouillon)
  - Boutons : Enregistrer, Annuler, Supprimer

- **Modals/Dialogs** :
  - Confirmation de suppression
  - Alertes
  - Pr�visualisation
  - �dition rapide

- **Charts/Graphiques** :
  - Courbes d'�volution
  - Barres comparatives
  - Camemberts/Donut
  - Cartes g�ographiques
  - Interactifs (zoom, filtres)

- **Notifications/Toasts** :
  - Succ�s (vert)
  - Erreur (rouge)
  - Avertissement (orange)
  - Information (bleu)
  - Position : top-right
  - Auto-dismiss

### 11.3 Responsive Design
- **Tablette** :
  - Sidebar repliable
  - Tableaux avec scroll horizontal

- **Mobile** :
  - Menu burger
  - Cartes au lieu de tableaux
  - Actions swipe
  - Optimisation tactile

### 11.4 Accessibilit�
- **Normes WCAG 2.1** :
  - Navigation au clavier
  - Lecteur d'�cran compatible
  - Contraste suffisant
  - Textes alternatifs

- **Mode sombre** :
  - Toggle light/dark mode
  - Pr�f�rence sauvegard�e

---

## = 12. FONCTIONNALIT�S TRANSVERSALES

### 12.1 Recherche Globale
- **Barre de recherche** dans le top bar
- **Recherche dans** :
  - Communes
  - Projets miniers
  - Documents
  - Revenus
  - Utilisateurs
  - Rubriques

- **R�sultats group�s** par type
- **Suggestions automatiques** (autocomplete)
- **Acc�s rapide** au r�sultat

### 12.2 Export de Donn�es
- **Formats disponibles** :
  - Excel (.xlsx)
  - CSV
  - PDF
  - Word (.docx) pour rapports

- **Options d'export** :
  - S�lection visible
  - S�lection compl�te
  - Filtres appliqu�s
  - Tout

- **Personnalisation** :
  - Choix des colonnes
  - Ordre des colonnes
  - Format de date
  - Logo/En-t�te

### 12.3 Import de Donn�es
- **Import Excel/CSV** :
  - Upload fichier
  - D�tection automatique des colonnes
  - Mapping manuel si n�cessaire
  - Validation des donn�es
  - Rapport d'erreurs
  - Aper�u avant import
  - Import ou Annuler

### 12.4 Gestion des Erreurs
- **Messages d'erreur** clairs et actionnables
- **Validation c�t� client** (temps r�el)
- **Validation c�t� serveur** (s�curit�)
- **Retry automatique** pour erreurs r�seau
- **Mode offline** (si pertinent)

### 12.5 Aide Contextuelle
- **Tooltips** sur les champs
- **Guide utilisateur** int�gr�
- **FAQ** par module
- **Vid�os tutoriels** (si disponible)
- **Support contact**

---

## <� 13. CHARTE GRAPHIQUE

### 13.1 Identit� Visuelle
- **Charte graphique** fournie par TI MG
- **Couleurs principales** :
  - Couleur primaire (TI MG)
  - Couleur secondaire
  - Couleur accent
  - Couleurs de statut (succ�s, erreur, warning, info)

- **Typographie** :
  - Police principale (titres)
  - Police secondaire (corps de texte)
  - Tailles d�finies

### 13.2 Composants UI
- **Boutons** :
  - Primaire (action principale)
  - Secondaire (actions secondaires)
  - Tertiaire (actions l�g�res)
  - Danger (actions destructives)
  - Ic�nes + texte

- **Cartes (Cards)** :
  - Bordures subtiles
  - Ombres l�g�res
  - Espacement coh�rent

- **Badges/Pills** :
  - Statuts (actif, inactif, valid�, etc.)
  - Compteurs

---

## =� 14. WORKFLOW ET PROCESSUS M�TIER

### 14.1 Workflow Saisie de Revenus
1. **Cr�ation brouillon** :
   - �diteur saisit les donn�es
   - Auto-sauvegarde
   - Validation formelle

2. **Soumission pour validation** :
   - V�rification compl�tude
   - Notification au validateur

3. **Validation** :
   - Administrateur/Gestionnaire valide
   - Ajout de commentaires si n�cessaire
   - Donn�es verrouill�es apr�s validation

4. **Publication** :
   - Donn�es visibles en front-office
   - G�n�ration automatique de rapports

### 14.2 Workflow Gestion des Documents
1. **Upload** :
   - Utilisateur upload document
   - Extraction automatique du contenu (indexation)
   - Attribution m�tadonn�es

2. **Mod�ration** (optionnel) :
   - V�rification par administrateur
   - Validation/Rejet

3. **Publication** :
   - Document disponible en recherche
   - T�l�chargeable selon permissions

### 14.3 Workflow Newsletter
1. **Cr�ation campagne** :
   - R�daction contenu
   - S�lection destinataires
   - Pr�visualisation

2. **Programmation** :
   - Date/heure d'envoi
   - Validation finale

3. **Envoi** :
   - Envoi automatique
   - Tracking des ouvertures/clics

4. **Analyse** :
   - Statistiques de campagne
   - Optimisation futures campagnes

---

## =� 15. PERFORMANCE ET OPTIMISATION

### 15.1 Optimisations Frontend
- **Lazy loading** des composants
- **Pagination** des listes longues
- **Debouncing** des recherches
- **Mise en cache** des donn�es fr�quentes
- **Compression** des assets

### 15.2 Optimisations Backend
- **Indexation** des tables critiques (d�j� dans schema.sql)
- **Requ�tes optimis�es** (�viter N+1)
- **Pagination** c�t� serveur
- **Cache** Redis (si n�cessaire)
- **Compression** des r�ponses

### 15.3 Monitoring
- **Temps de r�ponse** des endpoints
- **Utilisation m�moire**
- **Utilisation CPU**
- **Espace disque**
- **Alertes** si seuils d�pass�s

---

## >� 16. TESTING ET QUALIT�

### 16.1 Tests Fonctionnels
- **Tests manuels** :
  - Checklist par module
  - Sc�narios utilisateurs
  - Tests de non-r�gression

- **Tests automatis�s** (si ressources disponibles) :
  - Tests unitaires
  - Tests d'int�gration
  - Tests end-to-end

### 16.2 Assurance Qualit�
- **Validation des donn�es** � tous les niveaux
- **Gestion des droits** stricte
- **Logs complets** pour audit
- **Rollback** en cas d'erreur critique

---

## =� 17. DOCUMENTATION ET FORMATION

### 17.1 Documentation Technique
- **Documentation du code** :
  - Commentaires clairs
  - README par module
  - Architecture globale

- **API Documentation** :
  - Swagger/OpenAPI
  - Endpoints document�s
  - Exemples de requ�tes

### 17.2 Guide Utilisateur
- **Manuel d'utilisation** :
  - Par r�le (Admin, �diteur, etc.)
  - Par module
  - Captures d'�cran annot�es
  - Cas d'usage

- **FAQ** :
  - Questions fr�quentes
  - R�solution de probl�mes courants

### 17.3 Formation
- **Formation des administrateurs** :
  - Session en pr�sentiel/distanciel
  - Prise en main de chaque module
  - Bonnes pratiques
  - Q&R

- **Formation des �diteurs** :
  - Focus sur saisie de revenus
  - Gestion des documents
  - Workflow de validation

- **Support post-formation** :
  - Assistance par email
  - Sessions de rappel

---

## =' 18. MAINTENANCE ET �VOLUTION

### 18.1 Maintenance Pr�ventive
- **Mises � jour r�guli�res** :
  - Framework
  - D�pendances
  - Patches de s�curit�

- **V�rifications p�riodiques** :
  - Int�grit� base de donn�es
  - Backups
  - Logs d'erreurs
  - Performance

### 18.2 Maintenance Corrective
- **Correction de bugs** :
  - Syst�me de ticketing
  - Priorisation (critique, haute, normale, basse)
  - D�lai de r�solution selon priorit�

- **Support technique** :
  - Disponibilit� 2 ans minimum (sans frais)
  - Temps de r�ponse < 24h pour bugs critiques
  - Temps de r�ponse < 48h pour bugs normaux

### 18.3 �volution
- **Demandes d'�volution** :
  - Collecte des besoins utilisateurs
  - Priorisation
  - Planning de d�veloppement

- **Nouvelles fonctionnalit�s** :
  - Processus de validation
  - Tests en pr�-production
  - D�ploiement progressif

---

## =� 19. M�TRIQUES DE SUCC�S

### 19.1 KPIs Back-Office
- **Adoption utilisateurs** :
  - Nombre d'utilisateurs actifs
  - Fr�quence de connexion
  - Taux d'utilisation par module

- **Qualit� des donn�es** :
  - Taux de compl�tude
  - Taux de validation
  - Donn�es saisies par mois

- **Performance** :
  - Temps de chargement pages < 2s
  - Disponibilit� > 99.5%
  - Temps de r�ponse API < 500ms

- **Satisfaction utilisateurs** :
  - Enqu�te de satisfaction
  - Nombre de tickets support
  - Feedbacks positifs/n�gatifs

### 19.2 KPIs Front-Office (impact indirect)
- **Visites** :
  - Nombre de visiteurs uniques
  - Pages vues
  - Taux de rebond

- **T�l�chargements** :
  - Nombre de t�l�chargements
  - Types d'exports utilis�s

- **Engagement** :
  - Abonn�s newsletter
  - Taux d'ouverture newsletter
  - Partages sur r�seaux sociaux

---

## <� 20. PRIORISATION DES FONCTIONNALIT�S

### Phase 1 - MVP (Fonctionnalit�s Essentielles)
**Priorit� CRITIQUE** :
1. Authentification & Gestion des utilisateurs
2. Gestion des R�gions/D�partements/Communes
3. Gestion des Rubriques (tableau dynamique)
4. Saisie des Revenus
5. Export Excel/Word
6. Dashboard principal avec statistiques de base

### Phase 2 - Fonctionnalit�s Importantes
**Priorit� HAUTE** :
1. Gestion des Projets Miniers
2. Gestion des Documents + Moteur de recherche
3. Gestion des P�riodes et Exercices
4. Colonnes personnalis�es (extensibilit�)
5. Logs de visites et t�l�chargements
6. Import de donn�es Excel

### Phase 3 - Fonctionnalit�s Compl�mentaires
**Priorit� MOYENNE** :
1. Newsletter (abonn�s + campagnes)
2. Messagerie s�curis�e
3. Logs d'activit�s syst�me
4. Tableaux de bord avanc�s (graphiques)
5. Configuration syst�me
6. Validation workflow

### Phase 4 - Nice to Have
**Priorit� BASSE** :
<!-- 1. Int�gration GlobalLeaks -->
3. Notifications push
6. Export PDF avanc�

---

##  21. CHECKLIST DE VALIDATION FINALE

### 21.1 Fonctionnalit�s
- [ ] Tous les modules MVP impl�ment�s et test�s
- [ ] Authentification s�curis�e fonctionnelle
- [ ] CRUD complet sur toutes les entit�s
- [ ] Tableau dynamique (rubriques + colonnes) op�rationnel
- [ ] Export Excel/Word fonctionnel
- [ ] Moteur de recherche documents op�rationnel
- [ ] Newsletter (inscription + envoi) fonctionnelle
- [ ] Statistiques visites/t�l�chargements disponibles

### 21.2 S�curit�
- [ ] JWT impl�ment� correctement
- [ ] Permissions par r�le respect�es
- [ ] Protection CSRF
- [ ] Validation des inputs
- [ ] Mots de passe hash�s (bcrypt)
- [ ] HTTPS activ� (production)
- [ ] Logs d'audit activ�s

### 21.3 Performance
- [ ] Temps de chargement < 2s
- [ ] Pagination impl�ment�e
- [ ] Index base de donn�es cr��s
- [ ] Requ�tes optimis�es
- [ ] Cache activ� (si n�cessaire)

### 21.4 UX/UI
- [ ] Design conforme � la charte graphique
- [ ] Responsive (desktop, tablette, mobile)
- [ ] Navigation intuitive
- [ ] Messages d'erreur clairs
- [ ] Aide contextuelle disponible

### 21.5 Documentation
- [ ] Guide utilisateur complet
- [ ] Documentation technique
- [ ] Code comment� et clair
- [ ] README � jour

### 21.6 Formation
- [ ] Formation administrateurs effectu�e
- [ ] Formation �diteurs effectu�e
- [ ] Support mis en place

---

## =� 22. SUPPORT ET CONTACT

### 22.1 Organisation
- **Client** : PCQVP Madagascar / TI MG
- **Contact** : vramaherison@transparency.mg

### 22.2 Service Apr�s-Vente
- **Dur�e** : 2 ans minimum (sans frais suppl�mentaires)
- **Services inclus** :
  - Fluidit� et responsivit� du site
  - Correction de bugs et erreurs
  - Mises � jour Framework et logiciels
  - Support technique

---

## <� CONCLUSION

Ce plan couvre l'ensemble des fonctionnalit�s du back-office conform�ment au cahier des charges et au mod�le de donn�es.

**Points cl�s de r�ussite** :
1. **Interface "sans code"** pour la gestion des rubriques et colonnes
2. **S�curit� renforc�e** avec authentification et permissions granulaires
3. **Tableaux de bord** pour suivi et prise de d�cision
4. **Extensibilit�** pour futures �volutions
5. **Documentation et formation** pour adoption utilisateur

**Prochaines �tapes** :
1. Validation du plan avec TI MG
2. Priorisation des phases de d�veloppement
3. Conception des maquettes UI (Adobe XD)
4. D�veloppement it�ratif par module
5. Tests et ajustements
6. Formation et mise en production
