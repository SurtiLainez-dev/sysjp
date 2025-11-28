import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

const issuer = 'sys-jp'
const audience = 'sys-jp-web'

// Crear token
export async function signToken(payload: object, expiresIn = '1h') {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(issuer)
        .setAudience(audience)
        .setExpirationTime(expiresIn)
        .sign(secret)
}

// Verificar token
export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, secret, {
        issuer,
        audience
    })
    return payload
}
