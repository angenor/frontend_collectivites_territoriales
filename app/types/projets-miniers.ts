// ============================================================================
// Types pour les Projets Miniers
// Basés sur le schéma SQL dans bank/modele_de_donnees/schema.sql
// ============================================================================

export interface ProjetMinier {
  id: string
  nom: string
  code: string
  type_minerai: string
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
}

export interface RevenuMinier {
  id: string
  projet_minier_id: string
  commune_id?: string | null
  district_id?: string | null
  region_id?: string | null
  annee: number
  trimestre?: number | null
  type_revenu: 'ristourne' | 'redevance' | 'autre'
  montant: number
  date_versement?: string | null
  description?: string | null
  created_at: string
  updated_at: string
  // Relations
  projet_minier?: {
    id: string
    code: string
    nom: string
    type_minerai: string
  }
  commune?: {
    id: string
    code: string
    nom: string
  }
  district?: {
    id: string
    code: string
    nom: string
  }
  region?: {
    id: string
    code: string
    nom: string
  }
}

// Types pour les formulaires
export interface ProjetMinierFormData {
  nom: string
  code: string
  type_minerai: string
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
}

export interface RevenuMinierFormData {
  projet_minier_id: string
  commune_id?: string | null
  district_id?: string | null
  region_id?: string | null
  annee: number
  trimestre?: number | null
  type_revenu: 'ristourne' | 'redevance' | 'autre'
  montant: number
  date_versement?: string | null
  description?: string | null
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
