import { describe, expect, it } from 'vitest'
import { sealUploadKey, unsealUploadKey, type UploadKeyPayload } from './uploadKey'

const password = 'a-session-password-of-at-least-32-chars'
const payload: UploadKeyPayload = { v: 1, kid: '0123456789abcdef0123456789abcdef', iat: 1, login: 'octocat', token: 'gho_secret', repo: 'gitvault-a' }

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

  it('rejects a payload with a kid that is not a path segment', async () => {
    const key = await sealUploadKey({ ...payload, kid: '../x' as string }, password)
    expect(await unsealUploadKey(key, password)).toBeUndefined()
  })
})
