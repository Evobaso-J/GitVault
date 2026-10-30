import { describe, expect, it } from 'vitest'
import { vaultRepoQuerySchema } from './github'

describe('vaultRepoQuerySchema', () => {
  it('encodes each path segment and keeps the slashes', () => {
    expect(vaultRepoQuerySchema.parse({ repo: 'gitvault-a', path: 'notes #1/50% off?.txt' }))
      .toEqual({ repo: 'gitvault-a', path: 'notes%20%231/50%25%20off%3F.txt' })
  })

  it('defaults the path to the repo root', () => {
    expect(vaultRepoQuerySchema.parse({ repo: 'gitvault-a' })).toEqual({ repo: 'gitvault-a', path: '' })
  })

  it.each([
    { repo: '..', path: 'a.txt' },
    { repo: 'gitvault-a/../other', path: 'a.txt' },
    { repo: 'gitvault-a', path: '../../other/contents/a.txt' },
    { repo: 'gitvault-a', path: 'a//b.txt' },
    { repo: undefined, path: 'a.txt' },
  ])('rejects a query that could leave the repo: %o', (query) => {
    expect(() => vaultRepoQuerySchema.parse(query)).toThrow()
  })
})
