/**
 * Composable pour les données mock
 * Ces données seront remplacées par des données Supabase plus tard
 */

export interface Province {
  id: string
  code: string
  nom: string
  population?: number
}

export interface Region {
  id: string
  provinceId: string
  code: string
  nom: string
  population?: number
}

export interface Commune {
  id: string
  regionId: string
  code: string
  nom: string
  type: 'urbaine' | 'rurale'
  population?: number
  maire?: string
}

export interface LigneBudgetaire {
  code: string
  intitule: string
  niveau: number
  budgetPrimitif?: number
  budgetAdditionnel?: number
  modifications?: number
  previsionDefinitives?: number
  orAdmis?: number
  recouvrement?: number
  resteRecouvrer?: number
  tauxExecution?: number
}

export interface CompteAdministratif {
  annee: number
  commune: Commune
  region: Region
  province: Province
  statut: 'brouillon' | 'valide' | 'publie'
  datePublication?: string
  dateMiseAJour?: string
  lignesRecettes: LigneBudgetaire[]
  lignesDepenses: LigneBudgetaire[]
}

export const useMockData = () => {
  // Données mock des provinces de Madagascar
  const provinces: Province[] = [
    { id: 'p1', code: 'TANA', nom: 'Antananarivo', population: 6500000 },
    { id: 'p2', code: 'FIAN', nom: 'Fianarantsoa', population: 4200000 },
    { id: 'p3', code: 'TOLI', nom: 'Toliara', population: 3100000 },
    { id: 'p4', code: 'MAHA', nom: 'Mahajanga', population: 2800000 },
    { id: 'p5', code: 'ANTS', nom: 'Antsiranana', population: 1800000 },
    { id: 'p6', code: 'TOAM', nom: 'Toamasina', population: 3200000 }
  ]

  // Données mock des régions de Madagascar
  const regions: Region[] = [
    // Province Antsiranana
    { id: 'r1', provinceId: 'p5', code: 'DIANA', nom: 'Diana', population: 890000 },
    { id: 'r2', provinceId: 'p5', code: 'SAVA', nom: 'Sava', population: 980000 },

    // Province Antananarivo
    { id: 'r4', provinceId: 'p1', code: 'ANALAMANGA', nom: 'Analamanga', population: 3618000 },
    { id: 'r3', provinceId: 'p1', code: 'ITASY', nom: 'Itasy', population: 897000 },
    { id: 'r5', provinceId: 'p1', code: 'VAKINANKARATRA', nom: 'Vakinankaratra', population: 2074000 },
    { id: 'r6', provinceId: 'p1', code: 'BONGOLAVA', nom: 'Bongolava', population: 458000 },

    // Province Fianarantsoa
    { id: 'r7', provinceId: 'p2', code: 'AMORON', nom: "Amoron'i Mania", population: 833000 },
    { id: 'r8', provinceId: 'p2', code: 'HMATSIATRA', nom: 'Haute Matsiatra', population: 1447000 },
    { id: 'r9', provinceId: 'p2', code: 'VATOVAVY', nom: 'Vatovavy-Fitovinany', population: 1435000 },
    { id: 'r10', provinceId: 'p2', code: 'IHOROMBE', nom: 'Ihorombe', population: 418000 },
    { id: 'r11', provinceId: 'p2', code: 'ATSIMO-ATS', nom: 'Atsimo-Atsinanana', population: 1026000 },

    // Province Mahajanga
    { id: 'r12', provinceId: 'p4', code: 'BETSIBOKA', nom: 'Betsiboka', population: 394000 },
    { id: 'r13', provinceId: 'p4', code: 'BOENY', nom: 'Boeny', population: 931000 },
    { id: 'r14', provinceId: 'p4', code: 'MELAKY', nom: 'Melaky', population: 309000 },
    { id: 'r15', provinceId: 'p4', code: 'SOFIA', nom: 'Sofia', population: 1500000 },

    // Province Toamasina
    { id: 'r16', provinceId: 'p6', code: 'ATSINANANA', nom: 'Atsinanana', population: 1484000 },
    { id: 'r17', provinceId: 'p6', code: 'ALAOTRA', nom: 'Alaotra-Mangoro', population: 1255000 },
    { id: 'r18', provinceId: 'p6', code: 'ANALANJIROFO', nom: 'Analanjirofo', population: 1152000 },

    // Province Toliara
    { id: 'r19', provinceId: 'p3', code: 'MENABE', nom: 'Menabe', population: 700000 },
    { id: 'r20', provinceId: 'p3', code: 'ATSIMO-AND', nom: 'Atsimo-Andrefana', population: 1799000 },
    { id: 'r21', provinceId: 'p3', code: 'ANDROY', nom: 'Androy', population: 903000 },
    { id: 'r22', provinceId: 'p3', code: 'ANOSY', nom: 'Anosy', population: 809000 }
  ]

  // Données mock des communes (quelques exemples)
  const communes: Commune[] = [
    // Région Analamanga
    {
      id: 'c1',
      regionId: 'r4',
      code: 'ANKAZOBE',
      nom: 'Ankazobe',
      type: 'urbaine',
      population: 35000,
      maire: 'Rakoto Jean'
    },
    {
      id: 'c2',
      regionId: 'r4',
      code: 'AMBATOMANGA',
      nom: 'Ambatomanga',
      type: 'rurale',
      population: 12000,
      maire: 'Razafy Paul'
    },
    {
      id: 'c3',
      regionId: 'r4',
      code: 'MIANTSO',
      nom: 'Miantso',
      type: 'rurale',
      population: 8500,
      maire: 'Rabe Marie'
    },

    // Région Vakinankaratra
    {
      id: 'c4',
      regionId: 'r5',
      code: 'BETAFO',
      nom: 'Betafo',
      type: 'urbaine',
      population: 42000,
      maire: 'Randria Joseph'
    },
    {
      id: 'c5',
      regionId: 'r5',
      code: 'MANDROSOHASINA',
      nom: 'Mandrosohasina',
      type: 'rurale',
      population: 15000,
      maire: 'Rasolofo Claire'
    },

    // Région Atsinanana
    {
      id: 'c6',
      regionId: 'r16',
      code: 'TOAMASINA-I',
      nom: 'Toamasina I',
      type: 'urbaine',
      population: 485000,
      maire: 'Andrianjafy Michel'
    },

    // Région Boeny
    {
      id: 'c7',
      regionId: 'r13',
      code: 'MAHAJANGA-I',
      nom: 'Mahajanga I',
      type: 'urbaine',
      population: 320000,
      maire: 'Ramanantoanina Sophie'
    }
  ]

  // Données mock des lignes budgétaires - RECETTES
  const lignesRecettesMock: LigneBudgetaire[] = [
    // Section 1: RECETTES FISCALES
    {
      code: 'R-1',
      intitule: 'RECETTES FISCALES',
      niveau: 1,
      budgetPrimitif: 28000000,
      budgetAdditionnel: 2000000,
      modifications: 500000,
      previsionDefinitives: 30500000,
      orAdmis: 25000000,
      recouvrement: 23800000,
      resteRecouvrer: 1200000,
      tauxExecution: 82.0
    },
    {
      code: 'R-1-1',
      intitule: 'IMPOTS SUR LES REVENUS',
      niveau: 2,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4200000,
      recouvrement: 3800000,
      resteRecouvrer: 400000,
      tauxExecution: 84.0
    },
    {
      code: 'R-1-1-1',
      intitule: 'Impôt synthétique',
      niveau: 3,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4200000,
      recouvrement: 3800000,
      resteRecouvrer: 400000,
      tauxExecution: 84.0
    },
    {
      code: 'R-1-2',
      intitule: 'IMPOTS SUR LE PATRIMOINE',
      niveau: 2,
      budgetPrimitif: 20000000,
      budgetAdditionnel: 2000000,
      modifications: 500000,
      previsionDefinitives: 22500000,
      orAdmis: 19300000,
      recouvrement: 18700000,
      resteRecouvrer: 600000,
      tauxExecution: 85.8
    },
    {
      code: 'R-1-2-1',
      intitule: 'Impôts fonciers sur les terrains - IFT',
      niveau: 3,
      budgetPrimitif: 12000000,
      budgetAdditionnel: 2000000,
      modifications: 0,
      previsionDefinitives: 14000000,
      orAdmis: 11500000,
      recouvrement: 10200000,
      resteRecouvrer: 1300000,
      tauxExecution: 82.1
    },
    {
      code: 'R-1-2-2',
      intitule: 'Impôt foncier sur les propriétés bâties - IFPB',
      niveau: 3,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 500000,
      previsionDefinitives: 8500000,
      orAdmis: 7800000,
      recouvrement: 7500000,
      resteRecouvrer: 300000,
      tauxExecution: 91.8
    },
    {
      code: 'R-1-3',
      intitule: 'IMPOTS SUR BIENS ET SERVICES',
      niveau: 2,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2500000,
      recouvrement: 2300000,
      resteRecouvrer: 200000,
      tauxExecution: 83.3
    },
    {
      code: 'R-1-3-1',
      intitule: 'Taxes sur la publicité',
      niveau: 3,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2500000,
      recouvrement: 2300000,
      resteRecouvrer: 200000,
      tauxExecution: 83.3
    },

    // Section 2: RECETTES NON FISCALES
    {
      code: 'R-2',
      intitule: 'RECETTES NON FISCALES',
      niveau: 1,
      budgetPrimitif: 258000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 258000000,
      orAdmis: 270000000,
      recouvrement: 269500000,
      resteRecouvrer: 500000,
      tauxExecution: 104.5
    },
    {
      code: 'R-2-1',
      intitule: 'CONTRIBUTIONS RECUES DES TIERS',
      niveau: 2,
      budgetPrimitif: 43000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 43000000,
      orAdmis: 43000000,
      recouvrement: 43000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-1-1',
      intitule: 'Dotation globale - EPP',
      niveau: 3,
      budgetPrimitif: 25000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 25000000,
      orAdmis: 25000000,
      recouvrement: 25000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-1-2',
      intitule: 'Dotation globale - CSB',
      niveau: 3,
      budgetPrimitif: 18000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 18000000,
      orAdmis: 18000000,
      recouvrement: 18000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-2',
      intitule: 'PRODUITS DES RISTOURNES',
      niveau: 2,
      budgetPrimitif: 200000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 200000000,
      orAdmis: 215000000,
      recouvrement: 215000000,
      resteRecouvrer: 0,
      tauxExecution: 107.5
    },
    {
      code: 'R-2-3',
      intitule: 'REDEVANCES',
      niveau: 2,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 11500000,
      resteRecouvrer: 500000,
      tauxExecution: 80.0
    },
    {
      code: 'R-2-3-1',
      intitule: 'Redevances de collecte et de traitement des ordures ménagères - ROM',
      niveau: 3,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 11500000,
      resteRecouvrer: 500000,
      tauxExecution: 80.0
    }
  ]

  // Données mock des lignes budgétaires - DEPENSES
  const lignesDepensesMock: LigneBudgetaire[] = [
    // Section 1: CHARGES DE PERSONNEL
    {
      code: 'D-1',
      intitule: 'CHARGES DE PERSONNEL',
      niveau: 1,
      budgetPrimitif: 51500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 51500000,
      orAdmis: 51500000,
      recouvrement: 49700000,
      resteRecouvrer: 1800000,
      tauxExecution: 96.5
    },
    {
      code: 'D-1-1',
      intitule: 'Salaires et accessoires',
      niveau: 2,
      budgetPrimitif: 45000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 45000000,
      orAdmis: 45000000,
      recouvrement: 43500000,
      resteRecouvrer: 1500000,
      tauxExecution: 96.7
    },
    {
      code: 'D-1-1-1',
      intitule: 'Personnel permanent',
      niveau: 3,
      budgetPrimitif: 45000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 45000000,
      orAdmis: 45000000,
      recouvrement: 43500000,
      resteRecouvrer: 1500000,
      tauxExecution: 96.7
    },
    {
      code: 'D-1-2',
      intitule: 'Charges sociales patronales',
      niveau: 2,
      budgetPrimitif: 6500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 6500000,
      orAdmis: 6500000,
      recouvrement: 6200000,
      resteRecouvrer: 300000,
      tauxExecution: 95.4
    },
    {
      code: 'D-1-2-1',
      intitule: 'Cotisations à la CNAPS',
      niveau: 3,
      budgetPrimitif: 6500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 6500000,
      orAdmis: 6500000,
      recouvrement: 6200000,
      resteRecouvrer: 300000,
      tauxExecution: 95.4
    },

    // Section 2: ACHATS DE BIENS
    {
      code: 'D-2',
      intitule: 'ACHATS DE BIENS',
      niveau: 1,
      budgetPrimitif: 20000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 20000000,
      orAdmis: 17700000,
      recouvrement: 16600000,
      resteRecouvrer: 1100000,
      tauxExecution: 88.5
    },
    {
      code: 'D-2-1',
      intitule: 'Achats de biens de fonctionnement général',
      niveau: 2,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 8000000,
      orAdmis: 7200000,
      recouvrement: 6800000,
      resteRecouvrer: 400000,
      tauxExecution: 90.0
    },
    {
      code: 'D-2-1-1',
      intitule: 'Fournitures et articles de bureau',
      niveau: 3,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 8000000,
      orAdmis: 7200000,
      recouvrement: 6800000,
      resteRecouvrer: 400000,
      tauxExecution: 90.0
    },
    {
      code: 'D-2-2',
      intitule: 'Carburants, Lubrifiants et combustibles',
      niveau: 2,
      budgetPrimitif: 12000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 12000000,
      orAdmis: 10500000,
      recouvrement: 9800000,
      resteRecouvrer: 700000,
      tauxExecution: 87.5
    },

    // Section 3: ACHATS DE SERVICES
    {
      code: 'D-3',
      intitule: 'ACHATS DE SERVICES ET CHARGES PERMANENTES',
      niveau: 1,
      budgetPrimitif: 23000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 23000000,
      orAdmis: 19300000,
      recouvrement: 17300000,
      resteRecouvrer: 2000000,
      tauxExecution: 83.9
    },
    {
      code: 'D-3-1',
      intitule: 'Entretien et maintenance',
      niveau: 2,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 10500000,
      resteRecouvrer: 1500000,
      tauxExecution: 80.0
    },
    {
      code: 'D-3-1-1',
      intitule: 'Entretien de bâtiments',
      niveau: 3,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 10500000,
      resteRecouvrer: 1500000,
      tauxExecution: 80.0
    },
    {
      code: 'D-3-2',
      intitule: 'Eau et électricité',
      niveau: 2,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4500000,
      recouvrement: 4200000,
      resteRecouvrer: 300000,
      tauxExecution: 90.0
    },
    {
      code: 'D-3-3',
      intitule: 'Poste et télécommunications',
      niveau: 2,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2800000,
      recouvrement: 2600000,
      resteRecouvrer: 200000,
      tauxExecution: 92.9
    }
  ]

  // Fonction pour obtenir les régions d'une province
  const getRegionsByProvince = (provinceId: string): Region[] => {
    return regions.filter(r => r.provinceId === provinceId)
  }

  // Fonction pour obtenir les communes d'une région
  const getCommunesByRegion = (regionId: string): Commune[] => {
    return communes.filter(c => c.regionId === regionId)
  }

  // Fonction pour obtenir un compte administratif mock
  const getCompteAdministratif = (communeId: string, annee: number): CompteAdministratif | null => {
    const commune = communes.find(c => c.id === communeId)
    if (!commune) return null

    const region = regions.find(r => r.id === commune.regionId)
    if (!region) return null

    const province = provinces.find(p => p.id === region.provinceId)
    if (!province) return null

    return {
      annee,
      commune,
      region,
      province,
      statut: 'publie',
      datePublication: '2024-06-15',
      dateMiseAJour: '2024-10-28',
      lignesRecettes: lignesRecettesMock,
      lignesDepenses: lignesDepensesMock
    }
  }

  return {
    provinces,
    regions,
    communes,
    getRegionsByProvince,
    getCommunesByRegion,
    getCompteAdministratif
  }
}
