import type { RevenuMinier, RevenuMinierFormData, RevenuMinierStats } from '~/types/projets-miniers'

export const useRevenusMiniers = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer tous les revenus miniers
   */
  const fetchRevenusMiniers = async (filters?: {
    projet_minier_id?: string
    commune_id?: string
    district_id?: string
    region_id?: string
    annee?: number
    trimestre?: number
    type_revenu?: string
  }): Promise<RevenuMinier[]> => {
    let query = supabase
      .from('revenus_miniers')
      .select(`
        *,
        projet_minier:projets_miniers(id, code, nom, type_minerai),
        commune:communes(id, code, nom),
        district:districts(id, code, nom),
        region:regions(id, code, nom)
      `)
      .order('annee', { ascending: false })
      .order('trimestre', { ascending: false })

    // Appliquer les filtres
    if (filters?.projet_minier_id) {
      query = query.eq('projet_minier_id', filters.projet_minier_id)
    }
    if (filters?.commune_id) {
      query = query.eq('commune_id', filters.commune_id)
    }
    if (filters?.district_id) {
      query = query.eq('district_id', filters.district_id)
    }
    if (filters?.region_id) {
      query = query.eq('region_id', filters.region_id)
    }
    if (filters?.annee) {
      query = query.eq('annee', filters.annee)
    }
    if (filters?.trimestre) {
      query = query.eq('trimestre', filters.trimestre)
    }
    if (filters?.type_revenu) {
      query = query.eq('type_revenu', filters.type_revenu)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des revenus miniers:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer un revenu minier par ID
   */
  const fetchRevenuMinierById = async (id: string): Promise<RevenuMinier | null> => {
    const { data, error } = await supabase
      .from('revenus_miniers')
      .select(`
        *,
        projet_minier:projets_miniers(id, code, nom, type_minerai),
        commune:communes(id, code, nom),
        district:districts(id, code, nom),
        region:regions(id, code, nom)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du revenu minier:', error)
      throw error
    }

    return data
  }

  /**
   * Créer un nouveau revenu minier
   */
  const createRevenuMinier = async (revenuData: RevenuMinierFormData): Promise<RevenuMinier> => {
    const { data, error } = await supabase
      .from('revenus_miniers')
      .insert(revenuData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du revenu minier:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour un revenu minier
   */
  const updateRevenuMinier = async (id: string, revenuData: Partial<RevenuMinierFormData>): Promise<RevenuMinier> => {
    const { data, error } = await supabase
      .from('revenus_miniers')
      .update(revenuData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du revenu minier:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer un revenu minier
   */
  const deleteRevenuMinier = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('revenus_miniers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du revenu minier:', error)
      throw error
    }
  }

  /**
   * Récupérer les années disponibles
   */
  const fetchAnneesDisponibles = async (): Promise<number[]> => {
    const { data, error } = await supabase
      .from('revenus_miniers')
      .select('annee')
      .order('annee', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des années:', error)
      throw error
    }

    // Extraire les valeurs uniques
    const uniqueYears = [...new Set(data?.map(item => item.annee) || [])]
    return uniqueYears.sort((a, b) => b - a)
  }

  /**
   * Récupérer les statistiques des revenus par année
   */
  const fetchStatistiquesParAnnee = async (annee?: number): Promise<RevenuMinierStats[]> => {
    let query = supabase
      .from('revenus_miniers')
      .select('annee, type_revenu, montant, projet_minier_id')

    if (annee) {
      query = query.eq('annee', annee)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }

    // Grouper par année et calculer les totaux
    const statsMap = new Map<number, RevenuMinierStats>()

    data?.forEach(revenu => {
      if (!statsMap.has(revenu.annee)) {
        statsMap.set(revenu.annee, {
          annee: revenu.annee,
          total_ristournes: 0,
          total_redevances: 0,
          total_autres: 0,
          total_general: 0,
          nombre_projets: new Set()
        } as any)
      }

      const stats = statsMap.get(revenu.annee)!
      const montant = Number(revenu.montant) || 0

      if (revenu.type_revenu === 'ristourne') {
        stats.total_ristournes += montant
      } else if (revenu.type_revenu === 'redevance') {
        stats.total_redevances += montant
      } else {
        stats.total_autres += montant
      }

      stats.total_general += montant
      ;(stats as any).nombre_projets.add(revenu.projet_minier_id)
    })

    // Convertir Set en nombre et retourner array
    return Array.from(statsMap.values()).map(stats => ({
      ...stats,
      nombre_projets: (stats as any).nombre_projets.size
    })).sort((a, b) => b.annee - a.annee)
  }

  return {
    fetchRevenusMiniers,
    fetchRevenuMinierById,
    createRevenuMinier,
    updateRevenuMinier,
    deleteRevenuMinier,
    fetchAnneesDisponibles,
    fetchStatistiquesParAnnee
  }
}
