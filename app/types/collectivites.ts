// ============================================================================
// Types pour les Collectivités Territoriales
// Basés sur le schéma SQL dans bank/modele_de_donnees/schema.sql
// ============================================================================

export interface Region {
  id: string
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
  created_at: string
  updated_at: string
}

export interface District {
  id: string
  region_id: string
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
  created_at: string
  updated_at: string
  // Relations
  region?: Region
}

export interface Commune {
  id: string
  district_id: string
  code: string
  nom: string
  type: 'urbaine' | 'rurale'
  description?: string | null
  population?: number | null
  superficie?: number | null
  maire?: string | null
  contact_email?: string | null
  contact_telephone?: string | null
  created_at: string
  updated_at: string
  // Relations
  district?: District
}

// Types pour les formulaires (sans les champs auto-générés)
export interface RegionFormData {
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
}

export interface DistrictFormData {
  region_id: string
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
}

export interface CommuneFormData {
  district_id: string
  code: string
  nom: string
  type: 'urbaine' | 'rurale'
  description?: string | null
  population?: number | null
  superficie?: number | null
  maire?: string | null
  contact_email?: string | null
  contact_telephone?: string | null
}

// Types pour les vues et les statistiques
export interface RegionWithStats extends Region {
  nb_districts?: number
  nb_communes?: number
}

export interface DistrictWithStats extends District {
  nb_communes?: number
}
