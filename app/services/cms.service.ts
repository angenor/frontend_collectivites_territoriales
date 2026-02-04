/**
 * Service pour la gestion du CMS
 * Pages et Sections de comptes administratifs
 * Aligné avec le backend FastAPI : app/api/v1/endpoints/admin/cms.py
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/cms'

// ============================================================================
// TYPES - Alignés avec les schemas backend (app/schemas/cms.py)
// ============================================================================

/** Statut de publication (backend: StatutPublication enum) */
export type StatutPublication = 'brouillon' | 'publie' | 'archive'

/** Types de sections CMS (backend: TypeSectionCMS enum) */
export type SectionType =
  | 'editorjs'
  | 'bloc_image_gauche'
  | 'bloc_image_droite'
  | 'carte_fond_image'
  | 'grille_cartes'
  | 'galerie_photos'
  | 'liens_utiles'
  | 'note_informative'
  | 'tableau_financier'
  | 'graphiques_analytiques'

/** PageCompteAdministratifRead - lecture complète d'une page */
export interface PageCMS {
  id: number
  commune_id: number
  exercice_id: number
  titre?: string
  sous_titre?: string
  meta_description?: string
  image_hero_url?: string
  statut: StatutPublication
  afficher_tableau_financier: boolean
  afficher_graphiques: boolean
  date_publication?: string
  date_mise_a_jour: string
  cree_par?: number
  modifie_par?: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Relations enrichies (disponible via PageCompteAdministratifDetail)
  commune_nom?: string
  commune_code?: string
  exercice_annee?: number
  sections?: SectionCMS[]
}

/** PageCompteAdministratifList - version simplifiée pour la liste */
export interface PageCMSList {
  id: number
  commune_id: number
  exercice_id: number
  titre?: string
  statut: StatutPublication
  date_mise_a_jour: string
}

/** PageCompteAdministratifCreate */
export interface PageCMSFormData {
  commune_id: number | ''
  exercice_id: number | ''
  titre?: string
  sous_titre?: string
  meta_description?: string
  image_hero_url?: string
  statut?: StatutPublication
  afficher_tableau_financier?: boolean
  afficher_graphiques?: boolean
}

/** PageCompteAdministratifUpdate */
export interface PageCMSUpdateData {
  titre?: string
  sous_titre?: string
  meta_description?: string
  image_hero_url?: string
  statut?: StatutPublication
  afficher_tableau_financier?: boolean
  afficher_graphiques?: boolean
}

// --- Sections ---

/** SectionCMSRead */
export interface SectionCMS {
  id: number
  page_id: number
  type_section: SectionType
  titre?: string
  ordre: number
  visible: boolean
  visible_accueil: boolean
  config?: Record<string, any>
  created_at: string
  updated_at: string
  // Relations de contenu (disponible via SectionCMSWithContent)
  contenu_editorjs?: ContenuEditorJS
  bloc_image_texte?: BlocImageTexte
  bloc_carte_fond?: BlocCarteFond
  cartes_informatives?: CarteInformative[]
  photos_galerie?: PhotoGalerie[]
  liens_utiles?: LienUtile[]
}

/** SectionCMSCreate */
export interface SectionCMSFormData {
  page_id: number
  type_section: SectionType
  titre?: string
  ordre?: number
  visible?: boolean
  visible_accueil?: boolean
  config?: Record<string, any>
}

/** SectionCMSUpdate */
export interface SectionCMSUpdateData {
  type_section?: SectionType
  titre?: string
  ordre?: number
  visible?: boolean
  visible_accueil?: boolean
  config?: Record<string, any>
}

// --- Contenus spécifiques ---

export interface BoutonSchema {
  texte: string
  url: string
  type?: string // primary, secondary, outline
  icone?: string
  ouvrir_nouvel_onglet?: boolean
}

export interface ContenuEditorJS {
  id: number
  section_id: number
  contenu: Record<string, any>
  version: number
  created_at: string
  updated_at: string
}

export interface BlocImageTexte {
  id: number
  section_id: number
  titre?: string
  sous_titre?: string
  contenu?: string
  contenu_html?: string
  image_url: string
  image_alt?: string
  legende_image?: string
  boutons: BoutonSchema[]
  note?: string
  note_source?: string
  couleur_fond?: string
  icone_titre?: string
  created_at: string
  updated_at: string
}

export interface BlocCarteFond {
  id: number
  section_id: number
  image_url: string
  image_alt?: string
  badge_texte?: string
  badge_icone?: string
  titre?: string
  contenu?: string
  boutons: BoutonSchema[]
  hauteur_min: number
  opacite_overlay: number
  created_at: string
  updated_at: string
}

export interface CarteInformative {
  id: number
  section_id: number
  ordre: number
  type_carte: 'image' | 'statistique' | 'icone'
  image_url?: string
  image_alt?: string
  stat_valeur?: string
  stat_unite?: string
  stat_evolution?: string
  stat_icone?: string
  badge_texte?: string
  badge_icone?: string
  badge_couleur?: string
  titre?: string
  description?: string
  lien_texte?: string
  lien_url?: string
  note?: string
  couleur_fond?: string
  couleur_gradient_debut?: string
  couleur_gradient_fin?: string
  created_at: string
  updated_at: string
}

export interface PhotoGalerie {
  id: number
  section_id: number
  ordre: number
  image_url: string
  image_alt?: string
  image_thumbnail_url?: string
  titre?: string
  description?: string
  date_prise?: string
  lieu?: string
  credit_photo?: string
  created_at: string
  updated_at: string
}

export interface LienUtile {
  id: number
  section_id: number
  ordre: number
  titre: string
  description?: string
  url: string
  icone?: string
  couleur?: string
  couleur_fond?: string
  ouvrir_nouvel_onglet: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// SERVICE
// ============================================================================

export const useCMSService = () => {
  const api = useApi()

  // ============================================================================
  // PAGES
  // ============================================================================

  /**
   * Liste des pages CMS (retourne un tableau simple, pas paginé)
   * GET /api/v1/admin/cms/pages
   */
  const getPages = async (
    params?: {
      commune_id?: number
      exercice_id?: number
      statut?: StatutPublication
      limit?: number
      offset?: number
    }
  ): Promise<PageCMSList[]> => {
    return api.get<PageCMSList[]>(`${BASE_PATH}/pages`, params)
  }

  /**
   * Détail d'une page
   * GET /api/v1/admin/cms/pages/{page_id}
   */
  const getPage = async (id: number): Promise<PageCMS> => {
    return api.get<PageCMS>(`${BASE_PATH}/pages/${id}`)
  }

  /**
   * Créer une page
   * POST /api/v1/admin/cms/pages
   */
  const createPage = async (data: PageCMSFormData): Promise<PageCMS> => {
    return api.post<PageCMS>(`${BASE_PATH}/pages`, data)
  }

  /**
   * Modifier une page
   * PUT /api/v1/admin/cms/pages/{page_id}
   */
  const updatePage = async (id: number, data: PageCMSUpdateData): Promise<PageCMS> => {
    return api.put<PageCMS>(`${BASE_PATH}/pages/${id}`, data)
  }

  /**
   * Supprimer une page et toutes ses sections
   * DELETE /api/v1/admin/cms/pages/{page_id}
   */
  const deletePage = async (id: number): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/pages/${id}`)
  }

  /**
   * Changer le statut de publication
   * PUT /api/v1/admin/cms/pages/{page_id}/publish
   */
  const publishPage = async (id: number, statut: StatutPublication): Promise<PageCMS> => {
    return api.put<PageCMS>(`${BASE_PATH}/pages/${id}/publish`, { statut })
  }

  /** Raccourci : publier une page */
  const publierPage = async (id: number): Promise<PageCMS> => {
    return publishPage(id, 'publie')
  }

  /** Raccourci : archiver une page */
  const archiverPage = async (id: number): Promise<PageCMS> => {
    return publishPage(id, 'archive')
  }

  /** Raccourci : repasser en brouillon */
  const depublierPage = async (id: number): Promise<PageCMS> => {
    return publishPage(id, 'brouillon')
  }

  // ============================================================================
  // SECTIONS
  // ============================================================================

  /**
   * Sections d'une page
   * GET /api/v1/admin/cms/pages/{page_id}/sections
   */
  const getSections = async (pageId: number): Promise<SectionCMS[]> => {
    return api.get<SectionCMS[]>(`${BASE_PATH}/pages/${pageId}/sections`)
  }

  /**
   * Créer une section
   * POST /api/v1/admin/cms/sections
   */
  const createSection = async (data: SectionCMSFormData): Promise<SectionCMS> => {
    return api.post<SectionCMS>(`${BASE_PATH}/sections`, data)
  }

  /**
   * Modifier une section
   * PUT /api/v1/admin/cms/sections/{section_id}
   */
  const updateSection = async (
    sectionId: number,
    data: SectionCMSUpdateData
  ): Promise<SectionCMS> => {
    return api.put<SectionCMS>(`${BASE_PATH}/sections/${sectionId}`, data)
  }

  /**
   * Supprimer une section et son contenu
   * DELETE /api/v1/admin/cms/sections/{section_id}
   */
  const deleteSection = async (sectionId: number): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/sections/${sectionId}`)
  }

  /**
   * Réordonner les sections d'une page
   * PUT /api/v1/admin/cms/sections/reorder
   */
  const reorderSections = async (
    pageId: number,
    sectionIds: number[]
  ): Promise<SectionCMS[]> => {
    return api.put<SectionCMS[]>(`${BASE_PATH}/sections/reorder`, undefined, {
      params: { page_id: pageId, section_ids: sectionIds },
    })
  }

  // ============================================================================
  // TYPES DE SECTIONS (statique)
  // ============================================================================

  const getSectionTypes = (): Array<{ value: SectionType; label: string; description: string }> => {
    return [
      { value: 'editorjs', label: 'Éditeur de texte', description: 'Contenu texte riche avec blocs' },
      { value: 'bloc_image_gauche', label: 'Image à gauche', description: 'Image avec texte à droite' },
      { value: 'bloc_image_droite', label: 'Image à droite', description: 'Image avec texte à gauche' },
      { value: 'carte_fond_image', label: 'Carte avec fond', description: 'Carte avec image de fond' },
      { value: 'grille_cartes', label: 'Grille de cartes', description: 'Collection de cartes informatives' },
      { value: 'galerie_photos', label: 'Galerie photos', description: 'Galerie d\'images' },
      { value: 'liens_utiles', label: 'Liens utiles', description: 'Liste de liens' },
      { value: 'note_informative', label: 'Note informative', description: 'Encadré d\'information' },
      { value: 'tableau_financier', label: 'Tableau financier', description: 'Tableau de données budgétaires' },
      { value: 'graphiques_analytiques', label: 'Graphiques', description: 'Visualisations de données' },
    ]
  }

  return {
    // Pages
    getPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
    publishPage,
    publierPage,
    archiverPage,
    depublierPage,

    // Sections
    getSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,

    // Types
    getSectionTypes,
  }
}
