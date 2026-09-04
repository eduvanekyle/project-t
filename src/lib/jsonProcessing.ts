// export const MAX_JSON_FILE_SIZE = 200 * 1024 * 1024
export const MAX_JSON_FILE_SIZE = 30 * 1024 * 1024

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

function flattenObject(value: { [key: string]: JsonValue }, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {}

    for (const [key, child] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
            Object.assign(result, flattenObject(child, path))
        } else if (Array.isArray(child)) {
            result[path] = JSON.stringify(child)
        } else {
            result[path] = child === null ? '' : String(child)
        }
    }

    return result
}

function csvValue(value: string): string {
    return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function getJsonParseError(error: unknown): string {
    return error instanceof Error ? `Invalid JSON: ${error.message}` : 'Invalid JSON.'
}

export async function convertJsonToCsv(file: File): Promise<Blob> {
    if (file.size > MAX_JSON_FILE_SIZE) {
        throw new Error('JSON files must be 30 MB or smaller.')
    }

    const raw = (await file.text()).replace(/^\uFEFF/, '').trim()
    let parsed: JsonValue
    try {
        parsed = JSON.parse(raw) as JsonValue
    } catch (error) {
        throw new Error(getJsonParseError(error))
    }

    const records = Array.isArray(parsed)
        ? parsed.map((value) => (value !== null && typeof value === 'object' && !Array.isArray(value) ? value : { value }))
        : parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
            ? [parsed]
            : [{ value: parsed }]
    const rows = records.map((record) => flattenObject(record as { [key: string]: JsonValue }))
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
    if (headers.length === 0) headers.push('value')

    const csvRows = [
        headers,
        ...rows.map((row) => headers.map((header) => row[header] ?? '')),
    ]
    const csv = csvRows.map((row) => row.map(csvValue).join(',')).join('\r\n') + '\r\n'
    return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}