import type { ProjetMinier, ProjetMinierFormData, ProjetMinierWithStats } from '~/types/projets-miniers'

export const useProjetsMiniers = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer tous les projets miniers
   */
  const fetchProjetsMiniers = async (filters?: {
    statut?: string
    type_minerai?: string
    region_id?: string
    district_id?: string
    commune_id?: string
  }): Promise<ProjetMinier[]> => {
    let query = supabase
      .from('projets_miniers')
      .select(`
        *,
        region:regions(id, code, nom),
        district:districts(id, code, nom),
        commune:communes(id, code, nom)
      `)
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters?.statut) {
      query = query.eq('statut', filters.statut)
    }
    if (filters?.type_minerai) {
      query = query.eq('type_minerai', filters.type_minerai)
    }
    if (filters?.region_id) {
      query = query.eq('region_id', filters.region_id)
    }
    if (filters?.district_id) {
      query = query.eq('district_id', filters.district_id)
    }
    if (filters?.commune_id) {
      query = query.eq('commune_id', filters.commune_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des projets miniers:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer un projet minier par ID
   */
  const fetchProjetMinierById = async (id: string): Promise<ProjetMinier | null> => {
    const { data, error } = await supabase
      .from('projets_miniers')
      .select(`
        *,
        region:regions(id, code, nom),
        district:districts(id, code, nom),
        commune:communes(id, code, nom)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du projet minier:', error)
      throw error
    }

    return data
  }

  /**
   * Créer un nouveau projet minier
   */
  const createProjetMinier = async (projetData: ProjetMinierFormData): Promise<ProjetMinier> => {
    const { data, error } = await supabase
      .from('projets_miniers')
      .insert(projetData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du projet minier:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour un projet minier
   */
  const updateProjetMinier = async (id: string, projetData: Partial<ProjetMinierFormData>): Promise<ProjetMinier> => {
    const { data, error } = await supabase
      .from('projets_miniers')
      .update(projetData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du projet minier:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer un projet minier
   */
  const deleteProjetMinier = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projets_miniers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du projet minier:', error)
      throw error
    }
  }

  /**
   * Rechercher des projets miniers
   */
  const searchProjetsMiniers = async (query: string): Promise<ProjetMinier[]> => {
    const { data, error } = await supabase
      .from('projets_miniers')
      .select(`
        *,
        region:regions(id, code, nom),
        district:districts(id, code, nom),
        commune:communes(id, code, nom)
      `)
      .or(`nom.ilike.%${query}%,code.ilike.%${query}%,societe_exploitante.ilike.%${query}%,type_minerai.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la recherche des projets miniers:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer les types de minerais uniques
   */
  const fetchTypesMinerais = async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('projets_miniers')
      .select('type_minerai')

    if (error) {
      console.error('Erreur lors de la récupération des types de minerais:', error)
      throw error
    }

    // Extraire les valeurs uniques
    const uniqueTypes = [...new Set(data?.map(item => item.type_minerai) || [])]
    return uniqueTypes.sort()
  }

  return {
    fetchProjetsMiniers,
    fetchProjetMinierById,
    createProjetMinier,
    updateProjetMinier,
    deleteProjetMinier,
    searchProjetsMiniers,
    fetchTypesMinerais
  }
}
