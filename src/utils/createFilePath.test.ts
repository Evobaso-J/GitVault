import { describe, expect, it } from 'vitest'
import { createFilePath } from './createFilePath'

describe('createFilePath', () => {
  it('returns the name alone at the repo root', () => {
    expect(createFilePath(undefined, 'a.txt')).toBe('a.txt')
    expect(createFilePath('', 'a.txt')).toBe('a.txt')
  })

  it('joins nested folder paths', () => {
    expect(createFilePath('docs/2026', 'a.txt')).toBe('docs/2026/a.txt')
  })
})
