import { randomBytes, scrypt as _scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(_scrypt)

/**
 * Hash a plain-text password using scrypt (Node.js built-in).
 * Returns a string in the format "salt:hash" for storage in the database.
 *
 * scrypt is recommended by OWASP for password hashing:
 * - Memory-hard (resistant to GPU/ASIC attacks)
 * - Built into Node.js (no extra dependencies)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a plain-text password against a stored "salt:hash" string.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  const derivedHex = derivedKey.toString('hex')

  // Constant-time comparison to prevent timing attacks
  if (derivedHex.length !== hash.length) return false
  let result = 0
  for (let i = 0; i < derivedHex.length; i++) {
    result |= derivedHex.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return result === 0
}
