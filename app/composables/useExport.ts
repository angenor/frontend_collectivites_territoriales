/**
 * Composable pour exporter des données en Excel et Word
 * Utilise ExcelJS pour la génération de fichiers Excel
 */

import ExcelJS from 'exceljs'

interface ExportOptions {
  filename?: string
  sheetName?: string
  title?: string
  subtitle?: string
}

export const useExport = () => {
  /**
   * Exporte des données en fichier Excel
   */
  const exportToExcel = async (
    data: any[],
    columns: { header: string; key: string; width?: number }[],
    options: ExportOptions = {}
  ) => {
    const {
      filename = `export_${Date.now()}.xlsx`,
      sheetName = 'Données',
      title = 'Export de données',
      subtitle = '',
    } = options

    try {
      // Créer un nouveau workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(sheetName)

      // Métadonnées
      workbook.creator = 'Plateforme Revenus Miniers - TI Madagascar'
      workbook.created = new Date()

      let currentRow = 1

      // Ajouter le titre si fourni
      if (title) {
        worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`)
        const titleCell = worksheet.getCell(`A${currentRow}`)
        titleCell.value = title
        titleCell.font = { size: 16, bold: true }
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' }, // Blue
        }
        titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } }
        worksheet.getRow(currentRow).height = 30
        currentRow++
      }

      // Ajouter le sous-titre si fourni
      if (subtitle) {
        worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`)
        const subtitleCell = worksheet.getCell(`A${currentRow}`)
        subtitleCell.value = subtitle
        subtitleCell.font = { size: 12, italic: true }
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getRow(currentRow).height = 20
        currentRow++
      }

      // Ligne vide
      if (title || subtitle) {
        currentRow++
      }

      // Définir les colonnes
      worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
      }))

      // Style de l'en-tête
      const headerRow = worksheet.getRow(currentRow)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }, // Dark blue
      }
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
      headerRow.height = 25

      // Ajouter les données
      data.forEach((row) => {
        worksheet.addRow(row)
      })

      // Appliquer des bordures à toutes les cellules avec données
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= currentRow) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            }
          })
        }
      })

      // Générer le fichier
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      // Télécharger le fichier
      downloadFile(blob, filename)

      return { success: true, message: 'Export Excel réussi' }
    } catch (error) {
      console.error('Erreur export Excel:', error)
      return { success: false, message: 'Erreur lors de l\'export Excel' }
    }
  }

  /**
   * Exporte un tableau de revenus en Excel avec formatage avancé
   */
  const exportRevenusToExcel = async (
    exercice: string,
    periode: string,
    commune: string,
    tableData: any[]
  ) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Revenus Miniers')

    // Métadonnées
    workbook.creator = 'Plateforme Revenus Miniers - TI Madagascar'
    workbook.created = new Date()

    // En-tête du document
    worksheet.mergeCells('A1:E1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'COMPTE ADMINISTRATIF - REVENUS MINIERS'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    }
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).height = 30

    // Informations
    worksheet.mergeCells('A2:E2')
    const infoCell = worksheet.getCell('A2')
    infoCell.value = `Exercice: ${exercice} | Période: ${periode} | Commune: ${commune}`
    infoCell.font = { size: 12, italic: true }
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(2).height = 20

    // Date d'export
    worksheet.mergeCells('A3:E3')
    const dateCell = worksheet.getCell('A3')
    dateCell.value = `Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
    dateCell.font = { size: 10, italic: true }
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Ligne vide
    worksheet.addRow([])

    // En-têtes de colonnes
    const headerRow = worksheet.addRow([
      'Code',
      'Rubrique',
      'Montant Prévu (Ar)',
      'Montant Réalisé (Ar)',
      'Écart (Ar)',
      'Taux (%)',
    ])
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.height = 25

    // Définir les largeurs de colonnes
    worksheet.getColumn(1).width = 12 // Code
    worksheet.getColumn(2).width = 40 // Rubrique
    worksheet.getColumn(3).width = 18 // Montant Prévu
    worksheet.getColumn(4).width = 18 // Montant Réalisé
    worksheet.getColumn(5).width = 18 // Écart
    worksheet.getColumn(6).width = 12 // Taux

    // Ajouter les données
    tableData.forEach((row) => {
      const dataRow = worksheet.addRow([
        row.code,
        row.nom,
        row.montant_prevu,
        row.montant_realise,
        row.ecart,
        row.taux_realisation,
      ])

      // Indentation selon le niveau
      const rubriqueCell = dataRow.getCell(2)
      rubriqueCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        indent: row.niveau - 1,
      }

      // Style selon le niveau
      if (row.niveau === 1) {
        dataRow.font = { bold: true }
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBEAFE' }, // Light blue
        }
      } else if (row.niveau === 2) {
        dataRow.font = { bold: true }
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' }, // Light gray
        }
      }

      // Formatage des nombres
      dataRow.getCell(3).numFmt = '#,##0.00'
      dataRow.getCell(4).numFmt = '#,##0.00'
      dataRow.getCell(5).numFmt = '#,##0.00'
      dataRow.getCell(6).numFmt = '0.00"%"'

      // Couleur de l'écart
      const ecartCell = dataRow.getCell(5)
      if (row.ecart > 0) {
        ecartCell.font = { color: { argb: 'FF059669' } } // Green
      } else if (row.ecart < 0) {
        ecartCell.font = { color: { argb: 'FFDC2626' } } // Red
      }

      // Couleur du taux
      const tauxCell = dataRow.getCell(6)
      if (row.taux_realisation >= 100) {
        tauxCell.font = { color: { argb: 'FF059669' } } // Green
      } else if (row.taux_realisation >= 80) {
        tauxCell.font = { color: { argb: 'FF2563EB' } } // Blue
      } else if (row.taux_realisation >= 50) {
        tauxCell.font = { color: { argb: 'FFCA8A04' } } // Yellow
      } else {
        tauxCell.font = { color: { argb: 'FFDC2626' } } // Red
      }
    })

    // Bordures pour toutes les cellules de données
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      }
    })

    // Générer et télécharger
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const filename = `revenus_${commune}_${exercice}_${periode}_${Date.now()}.xlsx`
    downloadFile(blob, filename)

    return { success: true, message: 'Export réussi' }
  }

  /**
   * Exporte des données en CSV
   */
  const exportToCSV = (data: any[], columns: string[], filename: string = `export_${Date.now()}.csv`) => {
    try {
      // Créer l'en-tête
      const header = columns.join(',')

      // Créer les lignes
      const rows = data.map((row) =>
        columns.map((col) => {
          const value = row[col]
          // Échapper les virgules et guillemets
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )

      // Combiner
      const csv = [header, ...rows].join('\n')

      // Créer le blob avec BOM pour Excel
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })

      downloadFile(blob, filename)

      return { success: true, message: 'Export CSV réussi' }
    } catch (error) {
      console.error('Erreur export CSV:', error)
      return { success: false, message: 'Erreur lors de l\'export CSV' }
    }
  }

  /**
   * Fonction helper pour télécharger un fichier
   */
  const downloadFile = (blob: Blob, filename: string) => {
    if (process.client) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }

  return {
    exportToExcel,
    exportRevenusToExcel,
    exportToCSV,
    downloadFile,
  }
}
