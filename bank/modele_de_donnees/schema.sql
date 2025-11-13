-- ============================================================================
-- SCHEMA SQL - PLATEFORME DE SUIVI DES REVENUS MINIERS
-- ============================================================================
-- Base de données: PostgreSQL (Supabase)
-- Version: 1.0
-- Date: 2025-10-31
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search with trigrams

-- ============================================================================
-- 1. COLLECTIVITÉS TERRITORIALES
-- ============================================================================

-- Table: Régions
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    population INTEGER,
    superficie DECIMAL(10, 2), -- en km²
    chef_lieu VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE regions IS 'Régions administratives de Madagascar';

-- Table: Districts (Départements)
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    population INTEGER,
    superficie DECIMAL(10, 2), -- en km²
    chef_lieu VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE districts IS 'Districts (départements) de Madagascar';

-- Table: Communes
CREATE TABLE communes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('urbaine', 'rurale')),
    description TEXT,
    population INTEGER,
    superficie DECIMAL(10, 2), -- en km²
    maire VARCHAR(255),
    contact_email VARCHAR(255),
    contact_telephone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE communes IS 'Communes de Madagascar bénéficiaires des revenus miniers';

-- ============================================================================
-- 2. PROJETS MINIERS
-- ============================================================================

-- Table: Projets Miniers
CREATE TABLE projets_miniers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type_minerai VARCHAR(100) NOT NULL, -- graphite, ilménite, cobalt, nickel, etc.
    societe_exploitante VARCHAR(255) NOT NULL,
    region_id UUID REFERENCES regions(id),
    district_id UUID REFERENCES districts(id),
    commune_id UUID REFERENCES communes(id),
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(50) CHECK (statut IN ('en_cours', 'suspendu', 'termine', 'planifie')) DEFAULT 'en_cours',
    description TEXT,
    coordonnees_gps JSONB, -- {latitude, longitude}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE projets_miniers IS 'Projets d''extraction de minerais critiques';

-- Table: Revenus Miniers
CREATE TABLE revenus_miniers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projet_minier_id UUID NOT NULL REFERENCES projets_miniers(id) ON DELETE CASCADE,
    commune_id UUID REFERENCES communes(id),
    district_id UUID REFERENCES districts(id),
    region_id UUID REFERENCES regions(id),
    annee INTEGER NOT NULL,
    trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
    type_revenu VARCHAR(100) NOT NULL CHECK (type_revenu IN ('ristourne', 'redevance', 'autre')),
    montant DECIMAL(15, 2) NOT NULL,
    date_versement DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(projet_minier_id, commune_id, annee, trimestre, type_revenu)
);

COMMENT ON TABLE revenus_miniers IS 'Revenus miniers (ristournes et redevances) versés aux collectivités';

-- ============================================================================
-- 3. COMPTES ADMINISTRATIFS
-- ============================================================================

-- Table: Comptes Administratifs
CREATE TABLE comptes_administratifs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commune_id UUID REFERENCES communes(id),
    district_id UUID REFERENCES districts(id),
    region_id UUID REFERENCES regions(id),
    annee INTEGER NOT NULL,
    statut VARCHAR(50) CHECK (statut IN ('brouillon', 'valide', 'publie', 'archive')) DEFAULT 'brouillon',
    date_validation DATE,
    date_publication DATE,
    validateur_id UUID, -- Reference to auth.users
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Reference to auth.users
    UNIQUE(commune_id, annee),
    UNIQUE(district_id, annee),
    UNIQUE(region_id, annee),
    CHECK (
        (commune_id IS NOT NULL AND district_id IS NULL AND region_id IS NULL) OR
        (commune_id IS NULL AND district_id IS NOT NULL AND region_id IS NULL) OR
        (commune_id IS NULL AND district_id IS NULL AND region_id IS NOT NULL)
    )
);

COMMENT ON TABLE comptes_administratifs IS 'Comptes administratifs annuels des collectivités';

-- Table: Catégories de Rubriques
CREATE TABLE categories_rubriques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('recette', 'depense', 'equilibre')) NOT NULL,
    section VARCHAR(50) CHECK (section IN ('fonctionnement', 'investissement', 'ordre', 'equilibre')),
    parent_id UUID REFERENCES categories_rubriques(id) ON DELETE SET NULL,
    ordre INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories_rubriques IS 'Catégories hiérarchiques des rubriques budgétaires';

-- Table: Rubriques Budgétaires
CREATE TABLE rubriques_budgetaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    intitule TEXT NOT NULL,
    categorie_id UUID REFERENCES categories_rubriques(id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('recette', 'depense', 'equilibre')) NOT NULL,
    section VARCHAR(50) CHECK (section IN ('fonctionnement', 'investissement', 'ordre', 'equilibre')),
    parent_id UUID REFERENCES rubriques_budgetaires(id) ON DELETE SET NULL,
    niveau INTEGER DEFAULT 1, -- Niveau de hiérarchie (1=principal, 2=sous-rubrique, etc.)
    ordre INTEGER DEFAULT 0,
    est_calculee BOOLEAN DEFAULT FALSE, -- Si la valeur est calculée automatiquement
    formule_calcul TEXT, -- Formule de calcul si applicable
    est_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE rubriques_budgetaires IS 'Catalogue des rubriques budgétaires (recettes et dépenses)';

-- Table: Configuration des Colonnes Dynamiques
CREATE TABLE colonnes_dynamiques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    type_donnee VARCHAR(50) CHECK (type_donnee IN ('montant', 'pourcentage', 'texte', 'date', 'nombre')) DEFAULT 'montant',
    ordre INTEGER DEFAULT 0,
    est_calculee BOOLEAN DEFAULT FALSE,
    formule_calcul TEXT, -- Ex: "recouvrement - mandat_admis"
    format_affichage VARCHAR(100), -- Ex: "0,0.00" pour les montants
    est_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE colonnes_dynamiques IS 'Configuration des colonnes pour les tableaux dynamiques';

-- Insérer les colonnes standards
INSERT INTO colonnes_dynamiques (code, nom, type_donnee, ordre, est_calculee) VALUES
('compte', 'COMPTE', 'texte', 1, FALSE),
('budget_primitif', 'BUDGET PRIMITIF', 'montant', 2, FALSE),
('budget_additionnel', 'BUDGET ADDITIONNEL', 'montant', 3, FALSE),
('modifications', 'MODIFICATIONS +/-', 'montant', 4, FALSE),
('previsions_definitives', 'PREVISIONS DEFINITIVES (1)', 'montant', 5, TRUE),
('engagement', 'ENGAGEMENT', 'montant', 6, FALSE),
('or_admis', 'OR ADMIS (2)', 'montant', 7, FALSE),
('mandat_admis', 'MANDAT ADMIS (2)', 'montant', 7, FALSE),
('recouvrement', 'RECOUVREMENT', 'montant', 8, FALSE),
('paiement', 'PAIEMENT', 'montant', 8, FALSE),
('reste_recouvrer', 'RESTE A RECOUVRER', 'montant', 9, TRUE),
('reste_payer', 'RESTE A PAYER', 'montant', 9, TRUE),
('taux_execution', 'TAUX D''EXECUTION (2/1)', 'pourcentage', 10, TRUE);

-- Table: Lignes Budgétaires (Données)
CREATE TABLE lignes_budgetaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compte_administratif_id UUID NOT NULL REFERENCES comptes_administratifs(id) ON DELETE CASCADE,
    rubrique_id UUID NOT NULL REFERENCES rubriques_budgetaires(id) ON DELETE RESTRICT,
    valeurs JSONB NOT NULL DEFAULT '{}', -- Stockage flexible: {"budget_primitif": 1000000, "recouvrement": 850000, ...}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID, -- Reference to auth.users
    UNIQUE(compte_administratif_id, rubrique_id)
);

COMMENT ON TABLE lignes_budgetaires IS 'Données financières par rubrique et compte administratif';
COMMENT ON COLUMN lignes_budgetaires.valeurs IS 'Stockage JSON des valeurs pour chaque colonne dynamique';

-- Index pour améliorer les performances
CREATE INDEX idx_lignes_budgetaires_compte ON lignes_budgetaires(compte_administratif_id);
CREATE INDEX idx_lignes_budgetaires_rubrique ON lignes_budgetaires(rubrique_id);
CREATE INDEX idx_lignes_budgetaires_valeurs ON lignes_budgetaires USING GIN (valeurs);

-- ============================================================================
-- 4. GESTION DU CONTENU ET DOCUMENTS
-- ============================================================================

-- Table: Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compte_administratif_id UUID REFERENCES comptes_administratifs(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    type_fichier VARCHAR(50) CHECK (type_fichier IN ('excel', 'word', 'pdf', 'autre')),
    fichier_url TEXT NOT NULL, -- URL Supabase Storage
    fichier_nom VARCHAR(255) NOT NULL,
    taille_fichier INTEGER, -- en octets
    nombre_telechargements INTEGER DEFAULT 0,
    est_public BOOLEAN DEFAULT TRUE,
    tags TEXT[], -- Array de tags pour recherche
    uploaded_by UUID, -- Reference to auth.users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE documents IS 'Documents téléchargeables (Excel, Word, PDF)';

-- ============================================================================
-- 5. NEWSLETTER
-- ============================================================================

-- Table: Abonnés Newsletter
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    organisation VARCHAR(255),
    statut VARCHAR(50) CHECK (statut IN ('actif', 'inactif', 'desabonne')) DEFAULT 'actif',
    preferences JSONB DEFAULT '{}', -- Préférences d'abonnement
    token_confirmation VARCHAR(255) UNIQUE,
    date_confirmation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE newsletter_subscribers IS 'Abonnés à la newsletter';

-- ============================================================================
-- 6. ANALYTICS ET STATISTIQUES
-- ============================================================================

-- Table: Statistiques de Visite
CREATE TABLE analytics_visites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    page_url TEXT NOT NULL,
    commune_id UUID REFERENCES communes(id),
    district_id UUID REFERENCES districts(id),
    region_id UUID REFERENCES regions(id),
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    pays VARCHAR(100),
    ville VARCHAR(255),
    duree_visite INTEGER, -- en secondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE analytics_visites IS 'Statistiques des visites de la plateforme';

-- Table: Statistiques de Téléchargement
CREATE TABLE analytics_telechargements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    user_id UUID, -- Reference to auth.users si connecté
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE analytics_telechargements IS 'Statistiques des téléchargements de documents';

-- ============================================================================
-- 7. UTILISATEURS ET RÔLES (Extension de Supabase Auth)
-- ============================================================================

-- Table: Profils Utilisateurs
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('administrateur', 'editeur', 'lecteur')) DEFAULT 'lecteur',
    organisation VARCHAR(255),
    telephone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    permissions JSONB DEFAULT '{}', -- Permissions spécifiques
    est_actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profils utilisateurs étendus (lié à Supabase Auth)';

-- Table: Journal d'Activité (Audit Log)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE activity_logs IS 'Journal d''activité pour audit et traçabilité';

-- ============================================================================
-- 8. INTÉGRATION GLOBALLEAKS (OPTIONNEL)
-- ============================================================================

-- Table: Messages Sécurisés (Alternative simple à GlobalLeaks)
CREATE TABLE messages_securises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id UUID REFERENCES auth.users(id),
    destinataire_id UUID REFERENCES auth.users(id),
    sujet VARCHAR(255),
    contenu TEXT NOT NULL,
    est_chiffre BOOLEAN DEFAULT FALSE,
    est_lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP WITH TIME ZONE,
    fichiers_joints JSONB DEFAULT '[]', -- Array d'URLs vers Supabase Storage
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE messages_securises IS 'Système de messagerie sécurisée interne';

-- ============================================================================
-- 9. FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction: Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer la fonction à toutes les tables pertinentes
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communes_updated_at BEFORE UPDATE ON communes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projets_miniers_updated_at BEFORE UPDATE ON projets_miniers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenus_miniers_updated_at BEFORE UPDATE ON revenus_miniers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comptes_administratifs_updated_at BEFORE UPDATE ON comptes_administratifs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rubriques_budgetaires_updated_at BEFORE UPDATE ON rubriques_budgetaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colonnes_dynamiques_updated_at BEFORE UPDATE ON colonnes_dynamiques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lignes_budgetaires_updated_at BEFORE UPDATE ON lignes_budgetaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Incrémenter le compteur de téléchargements
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE documents
    SET nombre_telechargements = nombre_telechargements + 1
    WHERE id = NEW.document_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download_count
AFTER INSERT ON analytics_telechargements
FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Fonction: Calcul automatique des valeurs calculées
CREATE OR REPLACE FUNCTION calculer_valeurs_derivees()
RETURNS TRIGGER AS $$
DECLARE
    colonnes RECORD;
    valeur_calculee NUMERIC;
BEGIN
    -- Parcourir les colonnes calculées
    FOR colonnes IN
        SELECT code, formule_calcul
        FROM colonnes_dynamiques
        WHERE est_calculee = TRUE AND est_active = TRUE
    LOOP
        -- Exemple simple: calculer "reste_recouvrer" = "or_admis" - "recouvrement"
        IF colonnes.code = 'reste_recouvrer' THEN
            NEW.valeurs = jsonb_set(
                NEW.valeurs,
                ARRAY['reste_recouvrer'],
                to_jsonb(
                    COALESCE((NEW.valeurs->>'or_admis')::NUMERIC, 0) -
                    COALESCE((NEW.valeurs->>'recouvrement')::NUMERIC, 0)
                )
            );
        END IF;

        -- Calculer le taux d'exécution
        IF colonnes.code = 'taux_execution' THEN
            IF COALESCE((NEW.valeurs->>'previsions_definitives')::NUMERIC, 0) != 0 THEN
                NEW.valeurs = jsonb_set(
                    NEW.valeurs,
                    ARRAY['taux_execution'],
                    to_jsonb(
                        ROUND(
                            (COALESCE((NEW.valeurs->>'or_admis')::NUMERIC, 0) /
                            COALESCE((NEW.valeurs->>'previsions_definitives')::NUMERIC, 1)) * 100,
                            2
                        )
                    )
                );
            END IF;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculer_valeurs_derivees
BEFORE INSERT OR UPDATE ON lignes_budgetaires
FOR EACH ROW EXECUTE FUNCTION calculer_valeurs_derivees();

-- ============================================================================
-- 10. VUES UTILES
-- ============================================================================

-- Vue: Hiérarchie complète des collectivités
CREATE OR REPLACE VIEW v_hierarchie_collectivites AS
SELECT
    c.id as commune_id,
    c.code as commune_code,
    c.nom as commune_nom,
    c.type as commune_type,
    d.id as district_id,
    d.code as district_code,
    d.nom as district_nom,
    r.id as region_id,
    r.code as region_code,
    r.nom as region_nom
FROM communes c
JOIN districts d ON c.district_id = d.id
JOIN regions r ON d.region_id = r.id;

-- Vue: Récapitulatif des revenus miniers par collectivité
CREATE OR REPLACE VIEW v_revenus_par_collectivite AS
SELECT
    c.id as collectivite_id,
    'commune' as type_collectivite,
    c.nom as collectivite_nom,
    rm.annee,
    SUM(rm.montant) as total_revenus,
    COUNT(DISTINCT rm.projet_minier_id) as nombre_projets
FROM communes c
JOIN revenus_miniers rm ON c.id = rm.commune_id
GROUP BY c.id, c.nom, rm.annee

UNION ALL

SELECT
    d.id as collectivite_id,
    'district' as type_collectivite,
    d.nom as collectivite_nom,
    rm.annee,
    SUM(rm.montant) as total_revenus,
    COUNT(DISTINCT rm.projet_minier_id) as nombre_projets
FROM districts d
JOIN revenus_miniers rm ON d.id = rm.district_id
GROUP BY d.id, d.nom, rm.annee

UNION ALL

SELECT
    r.id as collectivite_id,
    'region' as type_collectivite,
    r.nom as collectivite_nom,
    rm.annee,
    SUM(rm.montant) as total_revenus,
    COUNT(DISTINCT rm.projet_minier_id) as nombre_projets
FROM regions r
JOIN revenus_miniers rm ON r.id = rm.region_id
GROUP BY r.id, r.nom, rm.annee;

-- ============================================================================
-- 11. INDEX POUR PERFORMANCE
-- ============================================================================

-- Index sur les clés étrangères
CREATE INDEX idx_districts_region ON districts(region_id);
CREATE INDEX idx_communes_district ON communes(district_id);
CREATE INDEX idx_projets_miniers_region ON projets_miniers(region_id);
CREATE INDEX idx_projets_miniers_commune ON projets_miniers(commune_id);
CREATE INDEX idx_revenus_miniers_projet ON revenus_miniers(projet_minier_id);
CREATE INDEX idx_revenus_miniers_commune ON revenus_miniers(commune_id);
CREATE INDEX idx_revenus_miniers_annee ON revenus_miniers(annee);
CREATE INDEX idx_comptes_administratifs_commune ON comptes_administratifs(commune_id);
CREATE INDEX idx_comptes_administratifs_annee ON comptes_administratifs(annee);
CREATE INDEX idx_rubriques_budgetaires_type ON rubriques_budgetaires(type);
CREATE INDEX idx_rubriques_budgetaires_section ON rubriques_budgetaires(section);
CREATE INDEX idx_documents_compte ON documents(compte_administratif_id);
CREATE INDEX idx_analytics_visites_date ON analytics_visites(created_at);
CREATE INDEX idx_analytics_visites_commune ON analytics_visites(commune_id);

-- Index full-text search
CREATE INDEX idx_communes_nom_trgm ON communes USING gin (nom gin_trgm_ops);
CREATE INDEX idx_rubriques_intitule_trgm ON rubriques_budgetaires USING gin (intitule gin_trgm_ops);

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================
