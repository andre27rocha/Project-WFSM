/**
 * Edge-compatible HMAC-SHA256 token utilities — no Node.js imports.
 * Token format: `{timestamp_ms}.{hmac_hex}`
 */

const ALGO = { name: 'HMAC', hash: 'SHA-256' } as const

// TypeScript 6 requires concrete ArrayBuffer (not ArrayBufferLike) for Web Crypto.
function encode(s: string): ArrayBuffer {
  const u8 = new TextEncoder().encode(s)
  const buf = new ArrayBuffer(u8.byteLength)
  new Uint8Array(buf).set(u8)
  return buf
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuf(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2)
  const view = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return buf
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encode(secret), ALGO, false, ['sign', 'verify'])
}

export async function signAdminToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString()
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign(ALGO.name, key, encode(timestamp))
  return `${timestamp}.${bufToHex(sig)}`
}

export async function verifyAdminToken(
  token: string,
  secret: string,
  maxAgeMs: number
): Promise<boolean> {
  const dotIndex = token.indexOf('.')
  if (dotIndex === -1) return false

  const timestamp = token.slice(0, dotIndex)
  const sigHex = token.slice(dotIndex + 1)

  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Date.now() - ts > maxAgeMs) return false

  try {
    const key = await importKey(secret)
    return crypto.subtle.verify(ALGO.name, key, hexToBuf(sigHex), encode(timestamp))
  } catch {
    return false
  }
}
