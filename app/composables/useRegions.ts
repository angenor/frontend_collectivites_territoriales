import type { Region, RegionFormData, RegionWithStats } from '~/types/collectivites'

export const useRegions = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer toutes les régions avec le nombre de districts
   */
  const fetchRegions = async (): Promise<RegionWithStats[]> => {
    const { data, error } = await supabase
      .from('regions')
      .select(`
        *,
        districts:districts(count)
      `)
      .order('nom', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des régions:', error)
      throw error
    }

    // Transformer les données pour inclure le nombre de districts
    return (data || []).map(region => ({
      ...region,
      nb_districts: region.districts?.[0]?.count || 0
    }))
  }

  /**
   * Récupérer une région par ID
   */
  const fetchRegionById = async (id: string): Promise<Region | null> => {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération de la région:', error)
      throw error
    }

    return data
  }

  /**
   * Créer une nouvelle région
   */
  const createRegion = async (regionData: RegionFormData): Promise<Region> => {
    const { data, error } = await supabase
      .from('regions')
      .insert(regionData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la région:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour une région
   */
  const updateRegion = async (id: string, regionData: Partial<RegionFormData>): Promise<Region> => {
    const { data, error } = await supabase
      .from('regions')
      .update(regionData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la région:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer une région
   */
  const deleteRegion = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de la région:', error)
      throw error
    }
  }

  /**
   * Rechercher des régions
   */
  const searchRegions = async (query: string): Promise<Region[]> => {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .or(`nom.ilike.%${query}%,code.ilike.%${query}%,chef_lieu.ilike.%${query}%`)
      .order('nom', { ascending: true })

    if (error) {
      console.error('Erreur lors de la recherche des régions:', error)
      throw error
    }

    return data || []
  }

  return {
    fetchRegions,
    fetchRegionById,
    createRegion,
    updateRegion,
    deleteRegion,
    searchRegions
  }
}
