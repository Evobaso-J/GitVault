import { describe, expect, it } from 'vitest'
import { isVaultRepo } from './gitHubUserRepos'

describe('isVaultRepo', () => {
  it.each([
    { name: 'photos', topics: ['gitvault'] },
    { name: 'photos', topics: ['backup', 'gitvault'] },
    { name: 'gitvault-photos', topics: [] },
    { name: 'gitvault-photos', topics: undefined },
  ])('accepts a repo with the topic or the legacy prefix: %o', (repo) => {
    expect(isVaultRepo(repo)).toBe(true)
  })

  it.each([
    { name: 'photos', topics: [] },
    { name: 'photos', topics: undefined },
    { name: 'photos', topics: ['gitvault-photos', 'gitvaults'] },
    { name: 'my-gitvault-photos', topics: ['backup'] },
  ])('rejects any other repo: %o', (repo) => {
    expect(isVaultRepo(repo)).toBe(false)
  })
})
