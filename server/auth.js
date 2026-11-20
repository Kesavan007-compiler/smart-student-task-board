/**
 * AUTHENTICATION HELPERS
 * -------------------------------------------------------------
 * Two jobs:
 * 1. Store passwords safely (never in plain text).
 * 2. Give the browser a signed "token" after login, so later requests
 *    can prove who the user is without sending the password again.
 */
import crypto from 'node:crypto'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production'

/* ---------- Passwords ---------- */

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const check = crypto.scryptSync(password, salt, 64).toString('hex')
  // timingSafeEqual avoids leaking information through response timing
  const a = Buffer.from(check, 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/* ---------- Tokens ---------- */

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

/** Create a token that is valid for 7 days. */
export function createToken(userId) {
  const body = b64({ sub: userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  return `${body}.${sign(body)}`
}

/** Returns the user id inside a token, or null if it is invalid/expired. */
export function readToken(token) {
  if (!token || !token.includes('.')) return null
  const [body, signature] = token.split('.')
  if (sign(body) !== signature) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload.sub
  } catch {
    return null
  }
}

/** Express middleware: blocks any request without a valid token. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const userId = readToken(token)
  if (!userId) {
    return res.status(401).json({ error: 'Please log in to continue.' })
  }
  req.userId = userId
  next()
}
