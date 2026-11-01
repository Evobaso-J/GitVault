import { describe, expect, it } from 'vitest'
import { isVaultRepo, repoSchemaPost } from './gitHubUserRepos'

describe('isVaultRepo', () => {
  it.each([
    { name: 'photos', topics: ['gitvault'] },
    { name: 'photos', topics: ['backup', 'gitvault'] },
  ])('accepts a repo with the topic: %o', (repo) => {
    expect(isVaultRepo(repo)).toBe(true)
  })

  it.each([
    { name: 'photos', topics: [] },
    { name: 'photos', topics: undefined },
    { name: 'photos', topics: ['gitvault-photos', 'gitvaults'] },
    { name: 'gitvault-photos', topics: [] },
  ])('rejects any other repo: %o', (repo) => {
    expect(isVaultRepo(repo)).toBe(false)
  })
})

describe('repoSchemaPost', () => {
  // GitHub turns a trailing space into a dash: "test " would become "test-"
  it('trims the name', () => expect(repoSchemaPost.parse({ name: ' test ', private: true }).name).toBe('test'))
  it('rejects a blank name', () => expect(() => repoSchemaPost.parse({ name: '  ', private: true })).toThrow())
})
