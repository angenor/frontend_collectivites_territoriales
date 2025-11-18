import ExcelJS from 'exceljs'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { annee, collectivite_id, collectivite_type } = query

  if (!annee || !collectivite_id || !collectivite_type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Paramètres manquants: annee, collectivite_id, collectivite_type requis'
    })
  }

  const supabase = await serverSupabaseClient(event)

  try {
    // 1. Récupérer les informations de la collectivité
    let collectiviteTable = ''
    if (collectivite_type === 'commune') collectiviteTable = 'communes'
    else if (collectivite_type === 'district') collectiviteTable = 'districts'
    else if (collectivite_type === 'region') collectiviteTable = 'regions'
    else throw createError({ statusCode: 400, statusMessage: 'Type de collectivité invalide' })

    const { data: collectivite, error: collectiviteError } = await supabase
      .from(collectiviteTable)
      .select('code, nom')
      .eq('id', collectivite_id)
      .single()

    if (collectiviteError) throw collectiviteError

    // 2. Récupérer le compte administratif
    const filters: any = { annee }
    if (collectivite_type === 'commune') filters.commune_id = collectivite_id
    else if (collectivite_type === 'district') filters.district_id = collectivite_id
    else if (collectivite_type === 'region') filters.region_id = collectivite_id

    const { data: compte, error: compteError } = await supabase
      .from('comptes_administratifs')
      .select('id, annee, statut')
      .match(filters)
      .single()

    if (compteError) throw compteError

    // 3. Récupérer toutes les rubriques avec leurs lignes budgétaires
    // Utilisation de LEFT JOIN pour inclure TOUTES les rubriques (niveaux 1, 2, 3)
    // même si elles n'ont pas de lignes budgétaires directes
    const { data: rubriquesRecettes, error: errorRecettes } = await supabase
      .from('rubriques_budgetaires')
      .select(`
        id,
        code,
        intitule,
        type,
        section,
        niveau,
        ordre,
        lignes_budgetaires!left(valeurs, compte_administratif_id)
      `)
      .eq('type', 'recette')
      .order('ordre')

    const { data: rubriquesDepenses, error: errorDepenses } = await supabase
      .from('rubriques_budgetaires')
      .select(`
        id,
        code,
        intitule,
        type,
        section,
        niveau,
        ordre,
        lignes_budgetaires!left(valeurs, compte_administratif_id)
      `)
      .eq('type', 'depense')
      .order('ordre')

    if (errorRecettes) throw errorRecettes
    if (errorDepenses) throw errorDepenses

    // Filtrer les lignes budgétaires pour ne garder que celles du compte administratif
    const rubriquesRecettesFiltrees = (rubriquesRecettes as any[] || []).map((rubrique: any) => ({
      ...rubrique,
      lignes_budgetaires: (rubrique.lignes_budgetaires || []).filter(
        (ligne: any) => ligne.compte_administratif_id === compte.id
      )
    }))

    const rubriquesDepensesFiltrees = (rubriquesDepenses as any[] || []).map((rubrique: any) => ({
      ...rubrique,
      lignes_budgetaires: (rubrique.lignes_budgetaires || []).filter(
        (ligne: any) => ligne.compte_administratif_id === compte.id
      )
    }))

    // 4. Créer le fichier Excel
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Système CT'
    workbook.created = new Date()

    // 5. Créer la feuille RECETTES
    const wsRecettes = workbook.addWorksheet('RECETTE')
    createRecettesSheet(wsRecettes, collectivite, annee as string, rubriquesRecettesFiltrees)

    // 6. Créer la feuille DÉPENSES
    const wsDepenses = workbook.addWorksheet('DEPENSES')
    createDepensesSheet(wsDepenses, collectivite, annee as string, rubriquesDepensesFiltrees)

    // 7. Créer la feuille EQUILIBRE
    const wsEquilibre = workbook.addWorksheet('EQUILIBRE')
    createEquilibreSheet(wsEquilibre, collectivite, annee as string, rubriquesRecettesFiltrees, rubriquesDepensesFiltrees)

    // 8. Générer le buffer Excel
    const buffer = await workbook.xlsx.writeBuffer()

    // 9. Retourner le fichier
    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="CA_${collectivite.code}_${annee}.xlsx"`
    })

    return buffer
  } catch (error: any) {
    console.error('Erreur export Excel:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur lors de la génération du fichier Excel'
    })
  }
})

// Fonction pour créer la feuille RECETTES
function createRecettesSheet(ws: ExcelJS.Worksheet, collectivite: any, annee: string, rubriques: any[]) {
  // En-tête du document
  ws.getCell('B2').value = 'TABLEAU DETAILLE DES RECETTES'
  ws.getCell('B2').font = { bold: true, size: 14 }
  ws.mergeCells('B2:M2')

  ws.getCell('E4').value = `COLLECTIVITE : ${collectivite.nom} (${collectivite.code})`
  ws.getCell('E4').font = { bold: true }
  ws.mergeCells('E4:H4')

  // Titre de section
  ws.getCell('B6').value = 'RECETTES DE FONCTIONNEMENT'
  ws.getCell('B6').font = { bold: true, size: 12 }
  ws.mergeCells('B6:M6')

  // En-têtes de colonnes (ligne 7)
  const headers = [
    { col: 'B', value: 'COMPTE' },
    { col: 'E', value: 'INTITULES' },
    { col: 'F', value: 'BUDGET PRIMITIF' },
    { col: 'G', value: 'BUDGET ADDITIONNEL' },
    { col: 'H', value: 'MODIFICATIONS +/-' },
    { col: 'I', value: 'PREVISIONS DEFINITIVES (1)' },
    { col: 'J', value: 'OR ADMIS (2)' },
    { col: 'K', value: 'RECOUVREMENT' },
    { col: 'L', value: 'RESTE A RECOUVRER' },
    { col: 'M', value: 'TAUX D\'EXECUTION (2)/(1)' }
  ]

  headers.forEach(({ col, value }) => {
    const cell = ws.getCell(`${col}7`)
    cell.value = value
    cell.font = { bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })

  // Données
  let currentRow = 8
  const rubriquesFonctionnement = rubriques.filter((r: any) => r.section === 'fonctionnement')

  currentRow = writeRubriqueData(ws, rubriquesFonctionnement, currentRow, 'recette')

  // Section INVESTISSEMENT
  const rubriquesSectionInvest = rubriques.filter((r: any) => r.section === 'investissement')
  if (rubriquesSectionInvest.length > 0) {
    currentRow += 2
    ws.getCell(`B${currentRow}`).value = 'RECETTES D\'INVESTISSEMENT'
    ws.getCell(`B${currentRow}`).font = { bold: true, size: 12 }
    ws.mergeCells(`B${currentRow}:M${currentRow}`)
    currentRow++

    currentRow = writeRubriqueData(ws, rubriquesSectionInvest, currentRow, 'recette')
  }

  // Mise en forme des colonnes
  ws.getColumn('B').width = 12
  ws.getColumn('C').width = 12
  ws.getColumn('D').width = 12
  ws.getColumn('E').width = 50
  ws.getColumn('F').width = 15
  ws.getColumn('G').width = 15
  ws.getColumn('H').width = 15
  ws.getColumn('I').width = 15
  ws.getColumn('J').width = 15
  ws.getColumn('K').width = 15
  ws.getColumn('L').width = 15
  ws.getColumn('M').width = 15
}

// Fonction pour créer la feuille DÉPENSES
function createDepensesSheet(ws: ExcelJS.Worksheet, collectivite: any, annee: string, rubriques: any[]) {
  // En-tête du document
  ws.getCell('B2').value = 'TABLEAU DETAILLE DES DEPENSES'
  ws.getCell('B2').font = { bold: true, size: 14 }
  ws.mergeCells('B2:N2')

  ws.getCell('E4').value = `COLLECTIVITE : ${collectivite.nom} (${collectivite.code})`
  ws.getCell('E4').font = { bold: true }
  ws.mergeCells('E4:H4')

  // Titre de section
  ws.getCell('B6').value = 'DÉPENSES DE FONCTIONNEMENT'
  ws.getCell('B6').font = { bold: true, size: 12 }
  ws.mergeCells('B6:N6')

  // En-têtes de colonnes (ligne 7)
  const headers = [
    { col: 'B', value: 'COMPTE' },
    { col: 'E', value: 'INTITULES' },
    { col: 'F', value: 'BUDGET PRIMITIF' },
    { col: 'G', value: 'BUDGET ADDITIONNEL' },
    { col: 'H', value: 'MODIFICATIONS +/-' },
    { col: 'I', value: 'PREVISIONS DEFINITIVES (1)' },
    { col: 'J', value: 'ENGAGEMENT' },
    { col: 'K', value: 'MANDAT ADMIS' },
    { col: 'L', value: 'PAIEMENT' },
    { col: 'M', value: 'RESTE A PAYER' },
    { col: 'N', value: 'TAUX D\'EXECUTION (2)/(1)' }
  ]

  headers.forEach(({ col, value }) => {
    const cell = ws.getCell(`${col}7`)
    cell.value = value
    cell.font = { bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })

  // Données
  let currentRow = 8
  const rubriquesFonctionnement = rubriques.filter((r: any) => r.section === 'fonctionnement')

  currentRow = writeRubriqueData(ws, rubriquesFonctionnement, currentRow, 'depense')

  // Section INVESTISSEMENT
  const rubriquesSectionInvest = rubriques.filter((r: any) => r.section === 'investissement')
  if (rubriquesSectionInvest.length > 0) {
    currentRow += 2
    ws.getCell(`B${currentRow}`).value = 'DÉPENSES D\'INVESTISSEMENT'
    ws.getCell(`B${currentRow}`).font = { bold: true, size: 12 }
    ws.mergeCells(`B${currentRow}:N${currentRow}`)
    currentRow++

    currentRow = writeRubriqueData(ws, rubriquesSectionInvest, currentRow, 'depense')
  }

  // Mise en forme des colonnes
  ws.getColumn('B').width = 12
  ws.getColumn('C').width = 12
  ws.getColumn('D').width = 12
  ws.getColumn('E').width = 50
  ws.getColumn('F').width = 15
  ws.getColumn('G').width = 15
  ws.getColumn('H').width = 15
  ws.getColumn('I').width = 15
  ws.getColumn('J').width = 15
  ws.getColumn('K').width = 15
  ws.getColumn('L').width = 15
  ws.getColumn('M').width = 15
  ws.getColumn('N').width = 15
}

// Fonction pour écrire les données de rubriques
function writeRubriqueData(ws: ExcelJS.Worksheet, rubriques: any[], startRow: number, type: 'recette' | 'depense'): number {
  let currentRow = startRow
  const rowMap = new Map<string, number>() // Map rubrique.id -> row number pour les formules SUM

  rubriques.forEach((rubrique: any) => {
    const valeurs = rubrique.lignes_budgetaires?.[0]?.valeurs || {}
    const hasData = rubrique.lignes_budgetaires?.length > 0

    // Déterminer la colonne du code selon le niveau
    let codeCol = 'B'
    if (rubrique.niveau === 2) codeCol = 'C'
    else if (rubrique.niveau === 3) codeCol = 'D'

    // Enregistrer la ligne pour cette rubrique (pour formules SUM)
    rowMap.set(rubrique.id, currentRow)

    // Code
    ws.getCell(`${codeCol}${currentRow}`).value = rubrique.code
    ws.getCell(`${codeCol}${currentRow}`).font = { bold: rubrique.niveau === 1 }

    // Intitulé
    ws.getCell(`E${currentRow}`).value = rubrique.intitule
    ws.getCell(`E${currentRow}`).font = { bold: rubrique.niveau === 1 }
    ws.getCell(`E${currentRow}`).alignment = { indent: rubrique.niveau - 1 }

    // Déterminer si c'est une ligne feuille (niveau 3) ou une ligne parent
    const children = rubriques.filter((r: any) => r.parent_id === rubrique.id)
    const isLeaf = children.length === 0

    // Si c'est une feuille ET a des données, écrire les valeurs
    // Sinon, écrire des formules SUM() pour agréger les enfants
    if (isLeaf && hasData) {
      // Écrire les valeurs directement pour les feuilles
      ws.getCell(`F${currentRow}`).value = valeurs.budget_primitif || 0
      ws.getCell(`F${currentRow}`).numFmt = '#,##0.00'

      ws.getCell(`G${currentRow}`).value = valeurs.budget_additionnel || 0
      ws.getCell(`G${currentRow}`).numFmt = '#,##0.00'

      ws.getCell(`H${currentRow}`).value = valeurs.modifications || 0
      ws.getCell(`H${currentRow}`).numFmt = '#,##0.00'

      // Prévisions définitives = F + G + H
      ws.getCell(`I${currentRow}`).value = { formula: `F${currentRow}+G${currentRow}+H${currentRow}` }
      ws.getCell(`I${currentRow}`).numFmt = '#,##0.00'

      if (type === 'recette') {
        ws.getCell(`J${currentRow}`).value = valeurs.or_admis || 0
        ws.getCell(`J${currentRow}`).numFmt = '#,##0.00'

        ws.getCell(`K${currentRow}`).value = valeurs.recouvrement || 0
        ws.getCell(`K${currentRow}`).numFmt = '#,##0.00'

        // RESTE À RECOUVRER = J - K
        ws.getCell(`L${currentRow}`).value = { formula: `J${currentRow}-K${currentRow}` }
        ws.getCell(`L${currentRow}`).numFmt = '#,##0.00'

        // TAUX D'EXÉCUTION = J / I
        ws.getCell(`M${currentRow}`).value = { formula: `IF(I${currentRow}=0,0,J${currentRow}/I${currentRow})` }
        ws.getCell(`M${currentRow}`).numFmt = '0.00%'
      } else {
        ws.getCell(`J${currentRow}`).value = valeurs.engagement || 0
        ws.getCell(`J${currentRow}`).numFmt = '#,##0.00'

        ws.getCell(`K${currentRow}`).value = valeurs.mandat_admis || 0
        ws.getCell(`K${currentRow}`).numFmt = '#,##0.00'

        ws.getCell(`L${currentRow}`).value = valeurs.paiement || 0
        ws.getCell(`L${currentRow}`).numFmt = '#,##0.00'

        // RESTE À PAYER = K - L
        ws.getCell(`M${currentRow}`).value = { formula: `K${currentRow}-L${currentRow}` }
        ws.getCell(`M${currentRow}`).numFmt = '#,##0.00'

        // TAUX D'EXÉCUTION = K / I
        ws.getCell(`N${currentRow}`).value = { formula: `IF(I${currentRow}=0,0,K${currentRow}/I${currentRow})` }
        ws.getCell(`N${currentRow}`).numFmt = '0.00%'
      }
    }

    // Bordures pour toutes les lignes
    const endCol = type === 'recette' ? 'M' : 'N'
    for (let col = 'B'; col <= endCol; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
      ws.getCell(`${col}${currentRow}`).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    currentRow++
  })

  // Deuxième passe : ajouter les formules SUM() pour les parents
  rubriques.forEach((rubrique: any) => {
    const children = rubriques.filter((r: any) => r.parent_id === rubrique.id)
    if (children.length > 0) {
      const parentRow = rowMap.get(rubrique.id)!
      const childRows = children.map(c => rowMap.get(c.id)!).filter(r => r !== undefined)

      if (childRows.length > 0) {
        const rangeList = childRows.map(r => `{COL}${r}`).join(',')

        // Formules SUM pour chaque colonne budgétaire
        const columns = type === 'recette'
          ? ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
          : ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']

        columns.forEach(col => {
          if (col === 'M' && type === 'recette') {
            // TAUX pour recettes
            ws.getCell(`${col}${parentRow}`).value = { formula: `IF(I${parentRow}=0,0,J${parentRow}/I${parentRow})` }
            ws.getCell(`${col}${parentRow}`).numFmt = '0.00%'
          } else if (col === 'N' && type === 'depense') {
            // TAUX pour dépenses
            ws.getCell(`${col}${parentRow}`).value = { formula: `IF(I${parentRow}=0,0,K${parentRow}/I${parentRow})` }
            ws.getCell(`${col}${parentRow}`).numFmt = '0.00%'
          } else if (col === 'L' && type === 'recette') {
            // RESTE À RECOUVRER
            ws.getCell(`${col}${parentRow}`).value = { formula: `J${parentRow}-K${parentRow}` }
            ws.getCell(`${col}${parentRow}`).numFmt = '#,##0.00'
          } else if (col === 'M' && type === 'depense') {
            // RESTE À PAYER
            ws.getCell(`${col}${parentRow}`).value = { formula: `K${parentRow}-L${parentRow}` }
            ws.getCell(`${col}${parentRow}`).numFmt = '#,##0.00'
          } else {
            // SUM pour les autres colonnes
            const formula = `SUM(${rangeList.replace(/{COL}/g, col)})`
            ws.getCell(`${col}${parentRow}`).value = { formula }
            ws.getCell(`${col}${parentRow}`).numFmt = '#,##0.00'
          }
        })
      }
    }
  })

  return currentRow
}

// Fonction pour créer la feuille EQUILIBRE
function createEquilibreSheet(ws: ExcelJS.Worksheet, collectivite: any, annee: string, rubriquesRecettes: any[], rubriquesDepenses: any[]) {
  // En-tête
  ws.getCell('B2').value = 'TABLEAU D\'ÉQUILIBRE BUDGÉTAIRE'
  ws.getCell('B2').font = { bold: true, size: 14 }
  ws.mergeCells('B2:H2')

  ws.getCell('E4').value = `COLLECTIVITE : ${collectivite.nom} (${collectivite.code}) - ANNÉE ${annee}`
  ws.getCell('E4').font = { bold: true }
  ws.mergeCells('E4:H4')

  let currentRow = 7

  // Section FONCTIONNEMENT
  ws.getCell(`B${currentRow}`).value = 'SECTION FONCTIONNEMENT'
  ws.getCell(`B${currentRow}`).font = { bold: true, size: 12 }
  ws.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
  ws.getCell(`B${currentRow}`).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.mergeCells(`B${currentRow}:H${currentRow}`)
  currentRow++

  // Calculs recettes fonctionnement
  const recettesFonct = rubriquesRecettes.filter((r: any) => r.section === 'fonctionnement' && r.niveau === 1)
  const totalRecettesFonct = recettesFonct.reduce((sum: number, r: any) => {
    const valeurs = r.lignes_budgetaires?.[0]?.valeurs || {}
    return sum + (valeurs.recouvrement || 0)
  }, 0)

  // Calculs dépenses fonctionnement
  const depensesFonct = rubriquesDepenses.filter((r: any) => r.section === 'fonctionnement' && r.niveau === 1)
  const totalDepensesFonct = depensesFonct.reduce((sum: number, r: any) => {
    const valeurs = r.lignes_budgetaires?.[0]?.valeurs || {}
    return sum + (valeurs.paiement || 0)
  }, 0)

  ws.getCell(`C${currentRow}`).value = 'Total Recettes'
  ws.getCell(`D${currentRow}`).value = totalRecettesFonct
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  currentRow++

  ws.getCell(`C${currentRow}`).value = 'Total Dépenses'
  ws.getCell(`D${currentRow}`).value = totalDepensesFonct
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  currentRow++

  ws.getCell(`C${currentRow}`).value = 'SOLDE FONCTIONNEMENT'
  ws.getCell(`C${currentRow}`).font = { bold: true }
  ws.getCell(`D${currentRow}`).value = totalRecettesFonct - totalDepensesFonct
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  ws.getCell(`D${currentRow}`).font = { bold: true }
  currentRow += 3

  // Section INVESTISSEMENT
  ws.getCell(`B${currentRow}`).value = 'SECTION INVESTISSEMENT'
  ws.getCell(`B${currentRow}`).font = { bold: true, size: 12 }
  ws.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9966FF' } }
  ws.getCell(`B${currentRow}`).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.mergeCells(`B${currentRow}:H${currentRow}`)
  currentRow++

  // Calculs recettes investissement
  const recettesInvest = rubriquesRecettes.filter((r: any) => r.section === 'investissement' && r.niveau === 1)
  const totalRecettesInvest = recettesInvest.reduce((sum: number, r: any) => {
    const valeurs = r.lignes_budgetaires?.[0]?.valeurs || {}
    return sum + (valeurs.recouvrement || 0)
  }, 0)

  // Calculs dépenses investissement
  const depensesInvest = rubriquesDepenses.filter((r: any) => r.section === 'investissement' && r.niveau === 1)
  const totalDepensesInvest = depensesInvest.reduce((sum: number, r: any) => {
    const valeurs = r.lignes_budgetaires?.[0]?.valeurs || {}
    return sum + (valeurs.paiement || 0)
  }, 0)

  ws.getCell(`C${currentRow}`).value = 'Total Recettes'
  ws.getCell(`D${currentRow}`).value = totalRecettesInvest
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  currentRow++

  ws.getCell(`C${currentRow}`).value = 'Total Dépenses'
  ws.getCell(`D${currentRow}`).value = totalDepensesInvest
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  currentRow++

  ws.getCell(`C${currentRow}`).value = 'SOLDE INVESTISSEMENT'
  ws.getCell(`C${currentRow}`).font = { bold: true }
  ws.getCell(`D${currentRow}`).value = totalRecettesInvest - totalDepensesInvest
  ws.getCell(`D${currentRow}`).numFmt = '#,##0.00'
  ws.getCell(`D${currentRow}`).font = { bold: true }

  // Mise en forme des colonnes
  ws.getColumn('B').width = 5
  ws.getColumn('C').width = 30
  ws.getColumn('D').width = 20
}
