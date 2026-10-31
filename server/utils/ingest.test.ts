import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { ingestFiles } from './ingest'
import { github } from './github'
import { getRepoTree } from './repoTree'
import type { UploadKeyPayload } from './uploadKey'

vi.mock('./github', () => ({ github: vi.fn() }))
vi.mock('./repoTree', () => ({ getRepoTree: vi.fn() }))

const githubMock = vi.mocked(github)
const treeMock = vi.mocked(getRepoTree)
const event = {} as H3Event
const auth: UploadKeyPayload = { v: 1, kid: '0123456789abcdef0123456789abcdef', iat: 1, login: 'octo', token: 'gho_x', repo: 'gitvault-a' }
const registry = { path: `.gitvault/keys/${auth.kid}.json`, type: 'blob', sha: 'reg' }
// `printf hello | git hash-object --stdin`
const HELLO_SHA = 'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0'
const file = (name: string, content: string) => ({ filename: name, data: Buffer.from(content) })

const puts = () => githubMock.mock.calls.map(([, endpoint, options]) => ({ url: endpoint('octo'), ...options }))

beforeEach(() => {
  githubMock.mockReset().mockResolvedValue({})
  treeMock.mockReset().mockResolvedValue([registry])
})

describe('ingestFiles', () => {
  it('rejects a key whose registry file is gone, before any write', async () => {
    treeMock.mockResolvedValue([])

    await expect(ingestFiles(event, auth, [file('a.jpg', 'hello')])).rejects.toMatchObject({ statusCode: 401, statusMessage: 'Upload key revoked' })
    expect(githubMock).not.toHaveBeenCalled()
  })

  it('uploads as the key holder, into the month the photo was taken, with the backup marker', async () => {
    const result = await ingestFiles(event, auth, [file('IMG #1.jpg', 'hello')], '2026-10-31T23:30:00+01:00')

    expect(result).toEqual({ uploaded: ['Photos/2026/10/IMG #1.jpg'], skipped: [], tooLarge: [] })
    expect(puts()).toEqual([{
      url: '/repos/octo/gitvault-a/contents/Photos/2026/10/IMG%20%231.jpg',
      method: 'PUT',
      body: { content: btoa('hello'), message: 'feat: phone backup' },
      auth,
    }])
  })

  it('falls back to the current month without a taken date', async () => {
    vi.useFakeTimers({ now: new Date(2026, 1, 15) })
    try {
      const { uploaded } = await ingestFiles(event, auth, [file('a.jpg', 'x')], 'garbage')
      expect(uploaded).toEqual(['Photos/2026/02/a.jpg'])
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('skips content already in the vault under any name, numbers a clash, dedupes the batch', async () => {
    treeMock.mockResolvedValue([
      registry,
      { path: 'Photos/2025/01/old.jpg', type: 'blob', sha: HELLO_SHA },
      { path: 'Photos/2026/10/b.jpg', type: 'blob', sha: 'other' },
    ])

    const result = await ingestFiles(event, auth, [file('a.jpg', 'hello'), file('b.jpg', 'new'), file('c.jpg', 'new')], '2026-10-01')

    expect(result).toEqual({ uploaded: ['Photos/2026/10/b (1).jpg'], skipped: ['Photos/2026/10/a.jpg', 'Photos/2026/10/c.jpg'], tooLarge: [] })
    expect(puts().map(put => put.url)).toEqual(['/repos/octo/gitvault-a/contents/Photos/2026/10/b%20(1).jpg'])
  })

  it('reports files over the cap without writing them', async () => {
    const result = await ingestFiles(event, auth, [file('video.mp4', 'x'.repeat(MAX_UPLOAD_BYTES + 1))], '2026-10-01')

    expect(result).toEqual({ uploaded: [], skipped: [], tooLarge: ['Photos/2026/10/video.mp4'] })
    expect(githubMock).not.toHaveBeenCalled()
  })
})
