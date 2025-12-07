/**
 * Types pour les tableaux financiers (Compte Administratif)
 * Correspondant aux schémas backend /api/v1/tableaux
 */

// =====================
// Enums
// =====================

export type SectionBudgetaire = 'FONCTIONNEMENT' | 'INVESTISSEMENT'

// =====================
// Lignes de tableau
// =====================

export interface LigneRecettes {
  code: string
  intitule: string
  niveau: number
  est_sommable: boolean
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  or_admis: number
  recouvrement: number
  reste_a_recouvrer: number
  taux_execution: number | null
}

export interface LigneDepenses {
  code: string
  intitule: string
  niveau: number
  est_sommable: boolean
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  engagement: number
  mandat_admis: number
  paiement: number
  reste_a_payer: number
  taux_execution: number | null
}

export interface LigneEquilibre {
  libelle: string
  section: SectionBudgetaire | null
  recettes_previsions: number
  recettes_realisations: number
  depenses_previsions: number
  depenses_realisations: number
  solde_previsions: number
  solde_realisations: number
}

// =====================
// Sections de tableau
// =====================

export interface SectionTableauRecettes {
  section: SectionBudgetaire
  titre: string
  lignes: LigneRecettes[]
  total_budget_primitif: number
  total_budget_additionnel: number
  total_modifications: number
  total_previsions_definitives: number
  total_or_admis: number
  total_recouvrement: number
  total_reste_a_recouvrer: number
  taux_execution_global: number | null
}

export interface SectionTableauDepenses {
  section: SectionBudgetaire
  titre: string
  lignes: LigneDepenses[]
  total_budget_primitif: number
  total_budget_additionnel: number
  total_modifications: number
  total_previsions_definitives: number
  total_engagement: number
  total_mandat_admis: number
  total_paiement: number
  total_reste_a_payer: number
  taux_execution_global: number | null
}

// =====================
// Tableaux complets
// =====================

export interface TableauRecettes {
  commune_id: number
  commune_nom: string
  exercice_annee: number
  sections: SectionTableauRecettes[]
  total_general_previsions: number
  total_general_or_admis: number
  total_general_recouvrement: number
  taux_execution_global: number | null
}

export interface TableauDepenses {
  commune_id: number
  commune_nom: string
  exercice_annee: number
  sections: SectionTableauDepenses[]
  total_general_previsions: number
  total_general_mandat_admis: number
  total_general_paiement: number
  taux_execution_global: number | null
}

export interface TableauEquilibre {
  commune_id: number
  commune_nom: string
  exercice_annee: number
  lignes: LigneEquilibre[]
  // Section fonctionnement
  fonctionnement_recettes_prev: number
  fonctionnement_recettes_real: number
  fonctionnement_depenses_prev: number
  fonctionnement_depenses_real: number
  fonctionnement_solde_prev: number
  fonctionnement_solde_real: number
  // Section investissement
  investissement_recettes_prev: number
  investissement_recettes_real: number
  investissement_depenses_prev: number
  investissement_depenses_real: number
  investissement_solde_prev: number
  investissement_solde_real: number
  // Totaux généraux
  total_recettes_prev: number
  total_recettes_real: number
  total_depenses_prev: number
  total_depenses_real: number
  total_solde_prev: number
  total_solde_real: number
}

export interface TableauComplet {
  commune_id: number
  commune_nom: string
  commune_code: string
  region_nom: string
  province_nom: string
  exercice_annee: number
  exercice_cloture: boolean
  recettes: TableauRecettes
  depenses: TableauDepenses
  equilibre: TableauEquilibre
  date_generation: string | null
  validee: boolean
}

// =====================
// Résumé et statistiques
// =====================

export interface ResumeFinancier {
  commune_id: number
  exercice_annee: number
  total_recettes_prevues: number
  total_recettes_realisees: number
  total_depenses_prevues: number
  total_depenses_realisees: number
  solde_budgetaire: number
  taux_execution_recettes: number | null
  taux_execution_depenses: number | null
}

export interface ComparaisonExercices {
  commune_id: number
  commune_nom: string
  exercice_annee_1: number
  exercice_annee_2: number
  recettes_annee_1: number
  recettes_annee_2: number
  variation_recettes: number
  variation_recettes_pct: number | null
  depenses_annee_1: number
  depenses_annee_2: number
  variation_depenses: number
  variation_depenses_pct: number | null
}

export interface StatistiquesRegion {
  region_id: number
  region_nom: string
  exercice_annee: number
  nb_communes: number
  total_recettes: number
  total_depenses: number
  moyenne_recettes_commune: number
  moyenne_depenses_commune: number
  taux_execution_moyen: number | null
}
