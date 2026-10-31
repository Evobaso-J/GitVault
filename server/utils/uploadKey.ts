import { z } from 'zod'

const UPLOAD_KEY_PREFIX = 'gvk1.'
const IV_BYTES = 12
const encoder = new TextEncoder()

const uploadKeyPayloadSchema = z.object({
  v: z.literal(1),
  /** Key id: name of its registry file, `UPLOAD_KEYS_DIR/<kid>.json`; a hex uuid, so safe as a path segment */
  kid: z.string().regex(/^[0-9a-f]{32}$/),
  /** Issued at, ms since epoch */
  iat: z.number(),
  login: z.string(),
  token: z.string(),
  repo: z.string(),
})

export type UploadKeyPayload = z.infer<typeof uploadKeyPayloadSchema>

// HKDF with its own `info`: an upload key never shares an AES key with the session cookie
const deriveAesKey = async (password: string) => {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(), info: encoder.encode('gitvault upload key v1') },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypts the payload (AES-256-GCM, authenticated) with a key derived from the session password.
 * The result carries a GitHub token: never log it.
 */
export const sealUploadKey = async (payload: UploadKeyPayload, password: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(UPLOAD_KEY_PREFIX) },
    await deriveAesKey(password),
    encoder.encode(JSON.stringify(payload)),
  )
  return UPLOAD_KEY_PREFIX + Buffer.concat([iv, new Uint8Array(ciphertext)]).toString('base64url')
}

/** The payload of a key sealed with `password`, or undefined for anything else (tampered, other secret, garbage) */
export const unsealUploadKey = async (key: string, password: string): Promise<UploadKeyPayload | undefined> => {
  if (!key.startsWith(UPLOAD_KEY_PREFIX)) return undefined
  const bytes = new Uint8Array(Buffer.from(key.slice(UPLOAD_KEY_PREFIX.length), 'base64url'))
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.subarray(0, IV_BYTES), additionalData: encoder.encode(UPLOAD_KEY_PREFIX) },
      await deriveAesKey(password),
      bytes.subarray(IV_BYTES),
    )
    return uploadKeyPayloadSchema.parse(JSON.parse(new TextDecoder().decode(plaintext)))
  }
  catch {
    return undefined
  }
}
