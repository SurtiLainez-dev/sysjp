import bcrypt from 'bcrypt'
import crypto from 'node:crypto'

const SALT_ROUNDS = 10
const PIN_HMAC_KEY = process.env.PIN_HMAC_KEY || 'dev-pin-key-change-me'

// Hash (para guardar en password)
export async function hashSecret(plain: string) {
    return bcrypt.hash(plain, SALT_ROUNDS)
}

// Verificar
export async function verifySecret(hash: string, plain: string) {
    return bcrypt.compare(plain, hash)
}

// Valor buscable (no reversible) para el PIN
export function pinLookup(pin: string) {
    return crypto.createHmac('sha256', PIN_HMAC_KEY).update(pin).digest('hex')
}
