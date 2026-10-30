import { describe, expect, it } from 'vitest'
import { getGalleryPath, gitBlobSha, planGalleryBackup } from './galleryBackup'

// `printf hello | git hash-object --stdin`
const HELLO_SHA = 'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0'

describe('gitBlobSha', () => {
  it('matches git hash-object', async () => {
    expect(await gitBlobSha(new Blob(['hello']))).toBe(HELLO_SHA)
    expect(await gitBlobSha(new Blob([]))).toBe('e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')
  })
})

describe('getGalleryPath', () => {
  it('files by year and zero-padded month', () => {
    const lastModified = new Date(2026, 2, 15, 12).getTime()
    expect(getGalleryPath({ name: 'IMG_1.jpg', lastModified })).toBe('Photos/2026/03/IMG_1.jpg')
  })
})

describe('planGalleryBackup', () => {
  it('skips files already in the vault, picked twice, or too large', async () => {
    const inVault = new File(['hello'], 'renamed.jpg')
    const fresh = new File(['new'], 'a.jpg')
    const freshAgain = new File(['new'], 'b.jpg')
    const big = new File(['0123456789'], 'video.mp4')

    const plan = await planGalleryBackup([inVault, fresh, freshAgain, big], new Set([HELLO_SHA]), 5)

    expect(plan).toEqual({ newFiles: [fresh], backedUp: [inVault, freshAgain], tooLarge: [big] })
  })
})
