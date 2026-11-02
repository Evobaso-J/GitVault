import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { commitTreeChanges } from './commitTreeChanges'
import { github } from './github'

vi.mock('./github', () => ({ github: vi.fn() }))

const githubMock = vi.mocked(github)
const event = {} as H3Event
const entries = [{ path: 'a.txt', mode: '100644' as const, type: 'blob' as const, sha: null }]
const notFastForward = createError({ statusCode: 422, statusMessage: 'Update is not a fast forward' })

/** One read → write round on `head`; `refUpdate` is what the final PATCH does */
const mockRound = (head: string, refUpdate: () => Promise<unknown>) => githubMock
  .mockResolvedValueOnce({ object: { sha: head } })
  .mockResolvedValueOnce({ sha: `tree-${head}`, truncated: false, tree: [] })
  .mockResolvedValueOnce({ sha: `new-tree-${head}` })
  .mockResolvedValueOnce({ sha: `commit-${head}` })
  .mockImplementationOnce(refUpdate)

const call = (index: number) => ({ endpoint: githubMock.mock.calls[index]![1]('octo'), options: githubMock.mock.calls[index]![2] })

beforeEach(() => {
  githubMock.mockReset()
})

describe('commitTreeChanges', () => {
  it('commits the built entries on the head tree and fast-forwards the branch', async () => {
    mockRound('h1', async () => ({}))
    const build = vi.fn(() => entries)

    await commitTreeChanges(event, 'notes', 'main', build, 'Delete folder docs')

    expect(call(0).endpoint).toBe('/repos/octo/notes/git/ref/heads/main')
    expect(call(1)).toEqual({ endpoint: '/repos/octo/notes/git/trees/h1', options: { query: { recursive: '1' } } })
    expect(build).toHaveBeenCalledWith({ sha: 'tree-h1', truncated: false, tree: [] })
    expect(call(2).options).toEqual({ method: 'POST', body: { base_tree: 'tree-h1', tree: entries } })
    expect(call(3).options).toEqual({ method: 'POST', body: { message: 'Delete folder docs', tree: 'new-tree-h1', parents: ['h1'] } })
    expect(call(4)).toEqual({ endpoint: '/repos/octo/notes/git/refs/heads/main', options: { method: 'PATCH', body: { sha: 'commit-h1', force: false } } })
  })

  it('rebuilds once on the new head when the branch moved', async () => {
    mockRound('h1', () => Promise.reject(notFastForward))
    mockRound('h2', async () => ({}))
    const build = vi.fn(() => entries)

    await commitTreeChanges(event, 'notes', 'main', build, 'm')

    expect(build).toHaveBeenCalledTimes(2)
    expect(call(8).options).toEqual({ method: 'POST', body: { message: 'm', tree: 'new-tree-h2', parents: ['h2'] } })
  })

  it('gives up with vaultChanged when the branch moves twice', async () => {
    mockRound('h1', () => Promise.reject(notFastForward))
    mockRound('h2', () => Promise.reject(notFastForward))

    await expect(commitTreeChanges(event, 'notes', 'main', () => entries, 'm'))
      .rejects.toMatchObject({ statusCode: 409, data: { code: 'vaultChanged' } })
    expect(githubMock).toHaveBeenCalledTimes(10)
  })

  it.each([
    createError({ statusCode: 403, statusMessage: 'Forbidden' }),
    createError({ statusCode: 422, statusMessage: 'Protected branch update failed' }),
  ])('does not retry other errors: %s', async (error) => {
    mockRound('h1', () => Promise.reject(error))

    await expect(commitTreeChanges(event, 'notes', 'main', () => entries, 'm')).rejects.toBe(error)
    expect(githubMock).toHaveBeenCalledTimes(5)
  })

  it('fails before any write on a truncated tree', async () => {
    githubMock
      .mockResolvedValueOnce({ object: { sha: 'h1' } })
      .mockResolvedValueOnce({ sha: 'tree-h1', truncated: true, tree: [] })

    await expect(commitTreeChanges(event, 'notes', 'main', () => entries, 'm')).rejects.toMatchObject({ statusCode: 422 })
    expect(githubMock).toHaveBeenCalledTimes(2)
  })
})
