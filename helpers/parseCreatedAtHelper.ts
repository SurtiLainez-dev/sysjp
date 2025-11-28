// /server/utils/dateFormat.ts
export function parseCreatedAtHelper(dateInput?: string | Date | null): string {
    if (!dateInput) return ''
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return ''

    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()

    return `${month}/${day}/${year}`
}
