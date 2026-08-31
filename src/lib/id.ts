// crypto.randomUUID requires a secure context (HTTPS/localhost); fall back otherwise.
export function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
