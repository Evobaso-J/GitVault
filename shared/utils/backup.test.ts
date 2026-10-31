import { describe, expect, it } from 'vitest'
import { getBackupPath, gitBlobSha, indexTree, parseTakenAt, placeFile, withCopyNumber, yearMonthOf } from './backup'

// `printf hello | git hash-object --stdin`
const HELLO_SHA = 'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0'

describe('gitBlobSha', () => {
  it('matches git hash-object', async () => {
    expect(await gitBlobSha(new Blob(['hello']))).toBe(HELLO_SHA)
    expect(await gitBlobSha(new Blob([]))).toBe('e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')
  })
})

describe('withCopyNumber', () => {
  it('numbers the stem, keeping the folder and the extension', () => {
    expect(withCopyNumber('a.txt', 1)).toBe('a (1).txt')
    expect(withCopyNumber('docs/2026/a.tar.gz', 2)).toBe('docs/2026/a.tar (2).gz')
    expect(withCopyNumber('docs/README', 1)).toBe('docs/README (1)')
    expect(withCopyNumber('.env', 1)).toBe('.env (1)')
  })
})

describe('dates', () => {
  it('takes the month from the phone clock, no time zone conversion', () => {
    expect(yearMonthOf(new Date(2026, 2, 15, 12))).toEqual({ year: 2026, month: 3 })
    expect(parseTakenAt('2026-10-31T23:30:00+01:00')).toEqual({ year: 2026, month: 10 })
    expect(parseTakenAt('2026-01-01')).toEqual({ year: 2026, month: 1 })
  })

  it.each(['', 'yesterday', '2026-13-01', '2026-00-01', '26-10-31', undefined])('rejects %s', (taken) => {
    expect(parseTakenAt(taken)).toBeUndefined()
  })

  it('files by year and zero-padded month', () => {
    expect(getBackupPath('IMG_1.jpg', { year: 2026, month: 3 })).toBe('Photos/2026/03/IMG_1.jpg')
  })
})

describe('placeFile', () => {
  const tree = [
    { path: 'Photos', type: 'tree', sha: 'tree-sha' },
    { path: 'Photos/2026/10/a.jpg', type: 'blob', sha: HELLO_SHA },
    { path: 'Photos/2026/10/b.jpg', type: 'blob', sha: 'other' },
    { path: 'Photos/2026/10/b (1).jpg', type: 'blob', sha: 'other-2' },
  ]

  it('indexes blobs only', () => {
    expect(indexTree(tree)).toEqual({
      shas: new Set([HELLO_SHA, 'other', 'other-2']),
      paths: new Set(['Photos/2026/10/a.jpg', 'Photos/2026/10/b.jpg', 'Photos/2026/10/b (1).jpg']),
    })
  })

  it('skips content already in the vault, under any name', () => {
    expect(placeFile(indexTree(tree), { target: 'Photos/2026/11/renamed.jpg', sha: HELLO_SHA })).toBeUndefined()
  })

  it('uploads new content to the target, or to the first free numbered name', () => {
    expect(placeFile(indexTree(tree), { target: 'Photos/2026/10/c.jpg', sha: 'new' })).toBe('Photos/2026/10/c.jpg')
    expect(placeFile(indexTree(tree), { target: 'Photos/2026/10/b.jpg', sha: 'new' })).toBe('Photos/2026/10/b (2).jpg')
  })

  it('dedupes a batch against itself', () => {
    const index = indexTree(tree)

    expect(placeFile(index, { target: 'Photos/2026/10/c.jpg', sha: 'new' })).toBe('Photos/2026/10/c.jpg')
    expect(placeFile(index, { target: 'Photos/2026/10/d.jpg', sha: 'new' })).toBeUndefined()
    expect(placeFile(index, { target: 'Photos/2026/10/c.jpg', sha: 'newer' })).toBe('Photos/2026/10/c (1).jpg')
  })
})
