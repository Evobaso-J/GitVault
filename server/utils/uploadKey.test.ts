import { describe, expect, it } from 'vitest'
import { getIngestPath, sealUploadKey, unsealUploadKey, type UploadKeyPayload } from './uploadKey'

const password = 'a-session-password-of-at-least-32-chars'
const payload: UploadKeyPayload = { v: 1, iat: 1, login: 'octocat', token: 'gho_secret', repo: 'gitvault-a', folder: 'Phone' }

describe('upload key', () => {
  it('round-trips and does not expose the token', async () => {
    const key = await sealUploadKey(payload, password)
    expect(key).not.toContain('gho_secret')
    expect(Buffer.from(key.slice(5), 'base64url').toString('latin1')).not.toContain('gho_secret')
    expect(await unsealUploadKey(key, password)).toEqual(payload)
  })

  it('rejects a tampered key, another secret and garbage', async () => {
    const key = await sealUploadKey(payload, password)
    const bytes = Buffer.from(key.slice(5), 'base64url')
    bytes[bytes.length - 1]! ^= 1
    expect(await unsealUploadKey(`gvk1.${bytes.toString('base64url')}`, password)).toBeUndefined()
    expect(await unsealUploadKey(key, `${password}-rotated`)).toBeUndefined()
    expect(await unsealUploadKey('gvk1.AAAA', password)).toBeUndefined()
    expect(await unsealUploadKey('not-a-key', password)).toBeUndefined()
  })
})

describe('getIngestPath', () => {
  it('files under folder/YYYY/MM in UTC', () => {
    expect(getIngestPath('Phone', 'IMG_1.HEIC', new Date('2026-01-31T23:30:00Z'))).toBe('Phone/2026/01/IMG_1.HEIC')
    expect(getIngestPath('', 'a.jpg', new Date('2026-12-01T00:00:00Z'))).toBe('2026/12/a.jpg')
  })
})
