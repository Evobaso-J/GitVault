import { describe, expect, it } from 'vitest'
import { formatBytes } from './formatBytes'

describe('formatBytes', () => {
  it('keeps small sizes in bytes', () => {
    expect(formatBytes(0, 'en-US')).toBe('0 byte')
    expect(formatBytes(512, 'en-US')).toBe('512 byte')
  })

  it('switches to the largest unit with one decimal', () => {
    expect(formatBytes(1536, 'en-US')).toBe('1.5 kB')
    expect(formatBytes(1258291, 'en-US')).toBe('1.2 MB')
  })
})
