export function useValidators(){
    const isNumber = (v?: string) =>
        /^\d+$/.test(v ?? '') || 'Solo se permiten números'
    const isFourDigits = (v: string) =>
        /^\d{4}$/.test(v ?? '') || 'Debe tener exactamente 4 dígitos'
    const minLen = (n: number) => (v: string) =>
        (v?.length ?? 0) >= n || `Mínimo ${n} caracteres`
    const rangeDigits = (min: number, max: number) => (v: string) =>
        new RegExp(`^\\d{${min},${max}}$`).test(v ?? '') ||
        `Debe tener entre ${min} y ${max} dígitos`
    const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m;
    const max = (n: number, m?: string) => (v: any) => (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`);
    const isBetween = (min: number, max: number) => (v: string | number) => {
        const num = Number(v)
        if (isNaN(num)) return 'Debe ser un número'
        return (num >= min && num <= max) || `El número debe estar entre ${min} y ${max}`
    }
    const isGreaterThan = (n: number) => (v: string | number) => {
        const num = Number(v)
        if (isNaN(num)) return 'Debe ser un número'
        return num > n || `El número debe ser mayor a ${n}`
    }
    const isMoney = (v?: string) =>
        /^\d+(\.\d+)?$/.test(v ?? '') || 'Solo se permiten números'
    return { req, isNumber, isFourDigits, minLen, max, rangeDigits, isBetween, isGreaterThan, isMoney }
}
