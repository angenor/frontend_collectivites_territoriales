// ============================================================================
// Types pour les Projets Miniers
// Basés sur le schéma SQL dans bank/modele_de_donnees/schema.sql
// ============================================================================

export interface ProjetMinier {
  id: string
  nom: string
  code: string
  type_minerai: string
  societe_id: number
  societe_exploitante: string
  region_id?: string | null
  district_id?: string | null
  commune_id?: string | null
  date_debut?: string | null
  date_fin?: string | null
  statut: 'en_cours' | 'suspendu' | 'termine' | 'planifie'
  description?: string | null
  coordonnees_gps?: {
    latitude: number
    longitude: number
  } | null
  created_at: string
  updated_at: string
  // Relations
  societe?: {
    id: number
    nom: string
    actif: boolean
  }
  region?: {
    id: string
    code: string
    nom: string
  }
  district?: {
    id: string
    code: string
    nom: string
  }
  commune?: {
    id: string
    code: string
    nom: string
  }
  communes?: ProjetCommuneInfo[]
}

export interface ProjetCommuneInfo {
  id: number
  projet_id: number
  commune_id: number
  pourcentage_territoire: number
  date_debut?: string | null
  date_fin?: string | null
  commune_nom?: string
  commune_code?: string
}

export interface RevenuMinier {
  id: string
  commune_id: number
  exercice_id: number
  projet_id: number
  type_revenu: 'ristourne_miniere' | 'redevance_miniere' | 'frais_administration_miniere' | 'quote_part_ristourne' | 'autre'
  montant_prevu: number
  montant_recu: number
  date_reception?: string | null
  reference_paiement?: string | null
  compte_code: string
  compte_administratif_id: number
  commentaire?: string | null
  ecart?: number
  taux_realisation?: number
  created_at: string
  updated_at: string
  // Relations
  projet?: {
    id: number
    nom: string
    type_minerai?: string
  }
  commune?: {
    id: number
    code: string
    nom: string
  }
  compte_intitule?: string
  compte_administratif_label?: string
  exercice_annee?: number
  projet_nom?: string
  commune_nom?: string
}

// Types pour les formulaires
export interface ProjetMinierFormData {
  nom: string
  code: string
  type_minerai: string
  societe_id: string
  region_id?: string | null
  district_id?: string | null
  date_debut?: string | null
  date_fin?: string | null
  statut: 'en_cours' | 'suspendu' | 'termine' | 'planifie'
  description?: string | null
  coordonnees_gps?: {
    latitude: number
    longitude: number
  } | null
  communes: Array<{
    commune_id: string
    pourcentage_territoire: number
    date_debut?: string | null
    date_fin?: string | null
  }>
}

export interface RevenuMinierFormData {
  projet_id: string
  commune_id: string
  exercice_id: string
  type_revenu: string
  montant_prevu: number
  montant_recu: number
  date_reception?: string | null
  reference_paiement?: string | null
  compte_code: string
  compte_administratif_id: number | null
  commentaire?: string | null
}

// Types pour les statistiques
export interface ProjetMinierWithStats extends ProjetMinier {
  total_revenus?: number
  nombre_revenus?: number
}

export interface RevenuMinierStats {
  annee: number
  total_ristournes: number
  total_redevances: number
  total_autres: number
  total_general: number
  nombre_projets: number
}
