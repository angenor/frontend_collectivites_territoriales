import type { Commune, CommuneFormData } from '~/types/collectivites'

export const useCommunes = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer toutes les communes
   */
  const fetchCommunes = async (filters?: {
    districtId?: string
    regionId?: string
    type?: 'urbaine' | 'rurale'
  }): Promise<Commune[]> => {
    let query = supabase
      .from('communes')
      .select(`
        *,
        district:districts(
          id,
          code,
          nom,
          region:regions(id, code, nom)
        )
      `)
      .order('nom', { ascending: true })

    // Appliquer les filtres
    if (filters?.districtId) {
      query = query.eq('district_id', filters.districtId)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des communes:', error)
      throw error
    }

    // Filtrer par région si spécifié (après la requête car c'est une relation indirecte)
    if (filters?.regionId && data) {
      return data.filter(commune =>
        commune.district?.region?.id === filters.regionId
      )
    }

    return data || []
  }

  /**
   * Récupérer une commune par ID
   */
  const fetchCommuneById = async (id: string): Promise<Commune | null> => {
    const { data, error } = await supabase
      .from('communes')
      .select(`
        *,
        district:districts(
          id,
          code,
          nom,
          region:regions(id, code, nom)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération de la commune:', error)
      throw error
    }

    return data
  }

  /**
   * Créer une nouvelle commune
   */
  const createCommune = async (communeData: CommuneFormData): Promise<Commune> => {
    const { data, error } = await supabase
      .from('communes')
      .insert(communeData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la commune:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour une commune
   */
  const updateCommune = async (id: string, communeData: Partial<CommuneFormData>): Promise<Commune> => {
    const { data, error } = await supabase
      .from('communes')
      .update(communeData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la commune:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer une commune
   */
  const deleteCommune = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('communes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de la commune:', error)
      throw error
    }
  }

  /**
   * Rechercher des communes
   */
  const searchCommunes = async (
    query: string,
    filters?: {
      districtId?: string
      regionId?: string
      type?: 'urbaine' | 'rurale'
    }
  ): Promise<Commune[]> => {
    let searchQuery = supabase
      .from('communes')
      .select(`
        *,
        district:districts(
          id,
          code,
          nom,
          region:regions(id, code, nom)
        )
      `)
      .or(`nom.ilike.%${query}%,code.ilike.%${query}%,maire.ilike.%${query}%`)
      .order('nom', { ascending: true })

    if (filters?.districtId) {
      searchQuery = searchQuery.eq('district_id', filters.districtId)
    }

    if (filters?.type) {
      searchQuery = searchQuery.eq('type', filters.type)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Erreur lors de la recherche des communes:', error)
      throw error
    }

    // Filtrer par région si spécifié
    if (filters?.regionId && data) {
      return data.filter(commune =>
        commune.district?.region?.id === filters.regionId
      )
    }

    return data || []
  }

  /**
   * Compter les communes par critères
   */
  const countCommunes = async (filters?: {
    districtId?: string
    type?: 'urbaine' | 'rurale'
  }): Promise<number> => {
    let query = supabase
      .from('communes')
      .select('*', { count: 'exact', head: true })

    if (filters?.districtId) {
      query = query.eq('district_id', filters.districtId)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    const { count, error } = await query

    if (error) {
      console.error('Erreur lors du comptage des communes:', error)
      throw error
    }

    return count || 0
  }

  return {
    fetchCommunes,
    fetchCommuneById,
    createCommune,
    updateCommune,
    deleteCommune,
    searchCommunes,
    countCommunes
  }
}
