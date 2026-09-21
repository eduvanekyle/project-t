import * as XLSX from 'xlsx'

export type ExcelFormat = 'xlsx' | 'xls' | 'csv'
export type ConversionFormat = ExcelFormat | 'json'
export type MergeMode = 'rows' | 'sheets'

const MIME_BY_FORMAT: Record<ConversionFormat, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
    json: 'application/json',
}

const EXTENSION_BY_FORMAT: Record<ConversionFormat, string> = {
    xlsx: '.xlsx',
    xls: '.xls',
    csv: '.csv',
    json: '.json',
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

export function replaceExtension(filename: string, format: ConversionFormat): string {
    const base = filename.replace(/\.[^./]+$/, '')
    return `${base}${EXTENSION_BY_FORMAT[format]}`
}

async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
    const buffer = await file.arrayBuffer()
    return XLSX.read(buffer, { type: 'array' })
}

export async function convertExcel(file: File, targetFormat: ConversionFormat): Promise<Blob> {
    const workbook = await readWorkbook(file)

    if (targetFormat === 'json') {
        const sheetName = workbook.SheetNames[0]
        const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName])
        return new Blob([JSON.stringify(records, null, 2)], { type: MIME_BY_FORMAT.json })
    }

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

export async function getExcelHeaders(file: File, headerRow = 1): Promise<string[]> {
    const workbook = await readWorkbook(file)
    const sheetName = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1 })
    const headers = rows[Math.max(0, headerRow - 1)] ?? []
    return headers.map((cell, index) => String(cell ?? '').trim() || `Column ${index + 1}`)
}

export interface SheetSplitResult {
    sheetName: string
    blob: Blob
}

function visibleSheetNames(workbook: XLSX.WorkBook): string[] {
    const sheetProps = workbook.Workbook?.Sheets
    return workbook.SheetNames.filter((_, index) => !sheetProps?.[index]?.Hidden)
}

export async function splitExcelSheets(file: File, format: ExcelFormat = 'xlsx'): Promise<SheetSplitResult[]> {
    const workbook = await readWorkbook(file)

    return visibleSheetNames(workbook).map((sheetName) => {
        if (format === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
            return { sheetName, blob: new Blob([csv], { type: MIME_BY_FORMAT.csv }) }
        }

        const single = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(single, workbook.Sheets[sheetName], sheetName)
        const output = XLSX.write(single, { bookType: format, type: 'array' })
        return { sheetName, blob: new Blob([output], { type: MIME_BY_FORMAT[format] }) }
    })
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

export interface UnpivotOptions {
    /** 1-based row number containing the column headers. */
    headerRow: number
    /** 1-based row number where the data begins (rows between the header and this are skipped). */
    dataStartRow: number
    /** Zero-based column indexes whose values should be repeated on every output row. */
    identifierColumnIndexes: number[]
    /** Omit output rows whose value cell is null, undefined, or empty. */
    skipNullValues: boolean
}

export async function unpivotExcel(file: File, options: UnpivotOptions): Promise<Blob> {
    const workbook = await readWorkbook(file)
    const sheetName = workbook.SheetNames[0]
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1 })
    const headerIndex = Math.max(0, options.headerRow - 1)
    const dataStartIndex = Math.max(headerIndex + 1, options.dataStartRow - 1)
    const rawHeaders = sheetRows[headerIndex] ?? []
    const headers = rawHeaders.map((cell, index) => String(cell ?? '').trim() || `Column ${index + 1}`)
    const identifierIndexes = new Set(options.identifierColumnIndexes)
    const valueIndexes = headers.map((_, index) => index).filter((index) => !identifierIndexes.has(index))
    const rows: unknown[][] = [
        [...options.identifierColumnIndexes.map((index) => headers[index]), 'Attribute', 'Value'],
    ]

    for (const row of sheetRows.slice(dataStartIndex)) {
        for (const valueIndex of valueIndexes) {
            const value = row[valueIndex]
            if (options.skipNullValues && (value === null || value === undefined || value === '')) continue
            rows.push([
                ...options.identifierColumnIndexes.map((index) => row[index] ?? ''),
                headers[valueIndex],
                value ?? '',
            ])
        }
    }

    const outputSheet = XLSX.utils.aoa_to_sheet(rows)
    const outputWorkbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(outputWorkbook, outputSheet, 'Unpivoted')
    const output = XLSX.write(outputWorkbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([output], { type: MIME_BY_FORMAT.xlsx })
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

const SOURCE_FILE_HEADER = 'Source File'

export async function mergeExcelFilesByHeader(
    files: File[],
    rowsOptions: MergeRowsOptions = { headerRow: 1, dataStartRow: 2 },
): Promise<Blob> {
    const workbooks = await Promise.all(files.map(readWorkbook))
    const headerIndex = Math.max(0, rowsOptions.headerRow - 1)
    const dataStartIndex = Math.max(headerIndex + 1, rowsOptions.dataStartRow - 1)

    // Union of headers in first-seen order, so new columns from later files are appended.
    const headers: string[] = [SOURCE_FILE_HEADER]
    const headerSet = new Set<string>([SOURCE_FILE_HEADER])
    const fileRecords: Record<string, unknown>[][] = []

    workbooks.forEach((workbook, fileIndex) => {
        const sourceName = files[fileIndex].name.replace(/\.[^./]+$/, '')
        const sheetName = workbook.SheetNames[0]
        const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1 })
        const fileHeader = (sheetRows[headerIndex] ?? []).map((cell) => String(cell ?? '').trim())
        for (const name of fileHeader) {
            if (name && !headerSet.has(name)) {
                headerSet.add(name)
                headers.push(name)
            }
        }

        const records = sheetRows.slice(dataStartIndex).map((row) => {
            const record: Record<string, unknown> = { [SOURCE_FILE_HEADER]: sourceName }
            fileHeader.forEach((name, columnIndex) => {
                if (name) record[name] = row[columnIndex]
            })
            return record
        })
        fileRecords.push(records)
    })

    // Look up each cell by header name so column order and missing columns don't matter.
    const rows: unknown[][] = [headers]
    for (const records of fileRecords) {
        for (const record of records) {
            rows.push(headers.map((name) => record[name] ?? ''))
        }
    }

    const sheet = XLSX.utils.aoa_to_sheet(rows)
    const merged = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(merged, sheet, 'Merged')
    const output = XLSX.write(merged, { bookType: 'xlsx', type: 'array' })
    return new Blob([output], { type: MIME_BY_FORMAT.xlsx })
}
