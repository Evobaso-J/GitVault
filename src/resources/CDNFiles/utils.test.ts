import { describe, expect, it } from 'vitest'
import { decodeBase64Utf8, getPathToFile, getPathToFolder } from './utils'

describe('decodeBase64Utf8', () => {
  it('decodes multi-byte UTF-8 from GitHub-style base64 with newlines', () => {
    // base64 of UTF-8 "echo venerdì\n", line-wrapped like the GitHub contents API
    expect(decodeBase64Utf8('ZWNobyB2ZW5l\ncmTDrAo=\n')).toBe('echo venerdì\n')
  })

  it('decodes plain ASCII', () => {
    expect(decodeBase64Utf8('aGVsbG8gd29ybGQ=')).toBe('hello world')
  })
})

describe('getPathToFile / getPathToFolder', () => {
  it('encodes each segment of a file path', () => {
    expect(getPathToFile({ path: 'smoke/note #1 50% off?.txt', repo: 'gitvault-a' }))
      .toBe('/gitvault-a/file/smoke/note%20%231%2050%25%20off%3F.txt')
  })

  it('encodes each segment of a folder path', () => {
    expect(getPathToFolder({ path: 'a #1/b?', repo: 'gitvault-a' })).toBe('/gitvault-a/a%20%231/b%3F')
  })

  it('returns an empty path without a repo', () => {
    expect(getPathToFolder({ path: 'docs', repo: undefined })).toBe('')
  })
})
