import * as XLSX from 'xlsx'

export type ExcelFormat = 'xlsx' | 'xls' | 'csv'
export type MergeMode = 'rows' | 'sheets'

const MIME_BY_FORMAT: Record<ExcelFormat, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
}

const EXTENSION_BY_FORMAT: Record<ExcelFormat, string> = {
    xlsx: '.xlsx',
    xls: '.xls',
    csv: '.csv',
}

export const ACCEPTED_EXCEL_TYPES = ['.xlsx', '.xls', '.csv']

export function detectExcelFormat(file: File): ExcelFormat | null {
    const match = /\.(xlsx|xls|csv)$/i.exec(file.name)
    if (!match) return null
    return match[1].toLowerCase() as ExcelFormat
}

export function formatLabel(format: ExcelFormat): string {
    return format.toUpperCase()
}

export function replaceExtension(filename: string, format: ExcelFormat): string {
    const base = filename.replace(/\.[^./]+$/, '')
    return `${base}${EXTENSION_BY_FORMAT[format]}`
}

async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
    const buffer = await file.arrayBuffer()
    return XLSX.read(buffer, { type: 'array' })
}

export async function convertExcel(file: File, targetFormat: ExcelFormat): Promise<Blob> {
    const workbook = await readWorkbook(file)

    if (targetFormat === 'csv') {
        const sheetName = workbook.SheetNames[0]
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
        return new Blob([csv], { type: MIME_BY_FORMAT.csv })
    }

    const output = XLSX.write(workbook, { bookType: targetFormat, type: 'array' })
    return new Blob([output], { type: MIME_BY_FORMAT[targetFormat] })
}

export async function getSheetNames(file: File): Promise<string[]> {
    const workbook = await readWorkbook(file)
    return workbook.SheetNames
}

function uniqueSheetName(name: string, taken: Set<string>): string {
    let candidate = name.slice(0, 31) || 'Sheet'
    let suffix = 1
    while (taken.has(candidate)) {
        const base = name.slice(0, 28) || 'Sheet'
        candidate = `${base}_${suffix}`
        suffix += 1
    }
    taken.add(candidate)
    return candidate
}

export interface MergeRowsOptions {
    /** 1-based row number containing the column headers. */
    headerRow: number
    /** 1-based row number where the data begins (rows between the header and this are skipped). */
    dataStartRow: number
}

export async function mergeExcelFiles(
    files: File[],
    mode: MergeMode,
    rowsOptions: MergeRowsOptions = { headerRow: 1, dataStartRow: 2 },
): Promise<Blob> {
    const workbooks = await Promise.all(files.map(readWorkbook))
    const merged = XLSX.utils.book_new()

    if (mode === 'sheets') {
        const takenNames = new Set<string>()
        workbooks.forEach((workbook, index) => {
            const baseName = files[index].name.replace(/\.[^./]+$/, '')
            for (const sheetName of workbook.SheetNames) {
                const label = workbook.SheetNames.length > 1 ? `${baseName}_${sheetName}` : baseName
                const name = uniqueSheetName(label, takenNames)
                XLSX.utils.book_append_sheet(merged, workbook.Sheets[sheetName], name)
            }
        })
    } else {
        const headerIndex = Math.max(0, rowsOptions.headerRow - 1)
        const dataStartIndex = Math.max(headerIndex + 1, rowsOptions.dataStartRow - 1)
        const rows: unknown[][] = []
        let header: unknown[] | null = null
        for (const workbook of workbooks) {
            const sheetName = workbook.SheetNames[0]
            const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1 })
            if (sheetRows.length === 0) continue
            if (header === null) {
                header = sheetRows[headerIndex] ?? []
                rows.push(header, ...sheetRows.slice(dataStartIndex))
            } else {
                rows.push(...sheetRows.slice(dataStartIndex))
            }
        }
        const sheet = XLSX.utils.aoa_to_sheet(rows)
        XLSX.utils.book_append_sheet(merged, sheet, 'Merged')
    }

    const output = XLSX.write(merged, { bookType: 'xlsx', type: 'array' })
    return new Blob([output], { type: MIME_BY_FORMAT.xlsx })
}
