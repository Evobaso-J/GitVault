import { describe, expect, it } from 'vitest'
import { isRepoNameValid } from './utils'

describe('isRepoNameValid', () => {
  it.each(['gitvault-a', 'photos', 'my.repo_2'])('accepts a GitHub repo name without the prefix requirement: %s', (name) => {
    expect(isRepoNameValid(name)).toBe(true)
  })

  it.each(['', '.', '..', 'a/b', 'my notes', 'a%2Fb'])('rejects a name that is not a single safe URL segment: %s', (name) => {
    expect(isRepoNameValid(name)).toBe(false)
  })
})
