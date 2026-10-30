import { describe, expect, it } from 'vitest'
import { decodeBase64Utf8 } from './utils'

describe('decodeBase64Utf8', () => {
  it('decodes multi-byte UTF-8 from GitHub-style base64 with newlines', () => {
    // base64 of UTF-8 "echo venerdì\n", line-wrapped like the GitHub contents API
    expect(decodeBase64Utf8('ZWNobyB2ZW5l\ncmTDrAo=\n')).toBe('echo venerdì\n')
  })

  it('decodes plain ASCII', () => {
    expect(decodeBase64Utf8('aGVsbG8gd29ybGQ=')).toBe('hello world')
  })
})
