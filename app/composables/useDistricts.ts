import type { District, DistrictFormData, DistrictWithStats } from '~/types/collectivites'

export const useDistricts = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer tous les districts avec le nombre de communes
   */
  const fetchDistricts = async (regionId?: string): Promise<DistrictWithStats[]> => {
    let query = supabase
      .from('districts')
      .select(`
        *,
        region:regions(id, code, nom),
        communes:communes(count)
      `)
      .order('nom', { ascending: true })

    // Filtrer par région si spécifié
    if (regionId) {
      query = query.eq('region_id', regionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des districts:', error)
      throw error
    }

    // Transformer les données pour inclure le nombre de communes
    return (data || []).map(district => ({
      ...district,
      nb_communes: district.communes?.[0]?.count || 0
    }))
  }

  /**
   * Récupérer un district par ID
   */
  const fetchDistrictById = async (id: string): Promise<District | null> => {
    const { data, error } = await supabase
      .from('districts')
      .select(`
        *,
        region:regions(id, code, nom)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du district:', error)
      throw error
    }

    return data
  }

  /**
   * Créer un nouveau district
   */
  const createDistrict = async (districtData: DistrictFormData): Promise<District> => {
    const { data, error } = await supabase
      .from('districts')
      .insert(districtData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du district:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour un district
   */
  const updateDistrict = async (id: string, districtData: Partial<DistrictFormData>): Promise<District> => {
    const { data, error } = await supabase
      .from('districts')
      .update(districtData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du district:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer un district
   */
  const deleteDistrict = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('districts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du district:', error)
      throw error
    }
  }

  /**
   * Rechercher des districts
   */
  const searchDistricts = async (query: string, regionId?: string): Promise<District[]> => {
    let searchQuery = supabase
      .from('districts')
      .select(`
        *,
        region:regions(id, code, nom)
      `)
      .or(`nom.ilike.%${query}%,code.ilike.%${query}%,chef_lieu.ilike.%${query}%`)
      .order('nom', { ascending: true })

    if (regionId) {
      searchQuery = searchQuery.eq('region_id', regionId)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Erreur lors de la recherche des districts:', error)
      throw error
    }

    return data || []
  }

  return {
    fetchDistricts,
    fetchDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    searchDistricts
  }
}
