import type { ColonneDynamique, ColonneDynamiqueFormData } from '~/types/comptes-administratifs'

export const useColonnesDynamiques = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer toutes les colonnes dynamiques actives
   */
  const fetchColonnesDynamiques = async (filters?: {
    applicable_a?: 'recette' | 'depense' | 'tous' | 'equilibre'
    est_active?: boolean
  }): Promise<ColonneDynamique[]> => {
    let query = supabase
      .from('colonnes_dynamiques')
      .select('*')
      .order('ordre', { ascending: true })

    // Appliquer les filtres
    if (filters?.applicable_a) {
      // Récupérer les colonnes qui s'appliquent au type spécifié OU à 'tous'
      query = query.or(`applicable_a.eq.${filters.applicable_a},applicable_a.eq.tous`)
    }

    if (filters?.est_active !== undefined) {
      query = query.eq('est_active', filters.est_active)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des colonnes dynamiques:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer les colonnes pour les recettes
   */
  const fetchColonnesRecettes = async (): Promise<ColonneDynamique[]> => {
    return fetchColonnesDynamiques({ applicable_a: 'recette', est_active: true })
  }

  /**
   * Récupérer les colonnes pour les dépenses
   */
  const fetchColonnesDepenses = async (): Promise<ColonneDynamique[]> => {
    return fetchColonnesDynamiques({ applicable_a: 'depense', est_active: true })
  }

  /**
   * Récupérer une colonne par ID
   */
  const fetchColonneById = async (id: string): Promise<ColonneDynamique | null> => {
    const { data, error } = await supabase
      .from('colonnes_dynamiques')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération de la colonne:', error)
      throw error
    }

    return data
  }

  /**
   * Créer une nouvelle colonne dynamique
   */
  const createColonne = async (colonneData: ColonneDynamiqueFormData): Promise<ColonneDynamique> => {
    const { data, error } = await supabase
      .from('colonnes_dynamiques')
      .insert(colonneData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la colonne:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour une colonne dynamique
   */
  const updateColonne = async (id: string, colonneData: Partial<ColonneDynamiqueFormData>): Promise<ColonneDynamique> => {
    const { data, error } = await supabase
      .from('colonnes_dynamiques')
      .update(colonneData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la colonne:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer une colonne dynamique
   */
  const deleteColonne = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('colonnes_dynamiques')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de la colonne:', error)
      throw error
    }
  }

  /**
   * Activer/Désactiver une colonne
   */
  const toggleColonneActive = async (id: string, est_active: boolean): Promise<ColonneDynamique> => {
    const { data, error } = await supabase
      .from('colonnes_dynamiques')
      .update({ est_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors du changement d\'état de la colonne:', error)
      throw error
    }

    return data
  }

  /**
   * Récupérer les colonnes communes (applicable à tous)
   */
  const fetchColonnesCommunes = async (): Promise<ColonneDynamique[]> => {
    const { data, error } = await supabase
      .from('colonnes_dynamiques')
      .select('*')
      .eq('applicable_a', 'tous')
      .eq('est_active', true)
      .order('ordre', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des colonnes communes:', error)
      throw error
    }

    return data || []
  }

  return {
    fetchColonnesDynamiques,
    fetchColonnesRecettes,
    fetchColonnesDepenses,
    fetchColonnesCommunes,
    fetchColonneById,
    createColonne,
    updateColonne,
    deleteColonne,
    toggleColonneActive
  }
}
