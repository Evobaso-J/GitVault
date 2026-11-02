import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { renameFile } from './renameFile'
import { github } from './github'
import { fileSchemaRename } from '~~/server/resources/gitHubRepoContents'

vi.mock('./github', () => ({ github: vi.fn() }))

const githubMock = vi.mocked(github)
const event = {} as H3Event
const target = { repo: 'notes', path: 'docs%202026/a%20%231.txt', branch: 'main' }
const file = (name: string, sha = `sha-${name}`) => ({ name, sha, type: 'file' })

const endpointOf = (call: number) => githubMock.mock.calls[call]![1]('octo')
const optionsOf = (call: number) => githubMock.mock.calls[call]![2]

/** Ref, folder listing, then the commit/tree/commit/ref writes */
const mockGitHub = (siblings: unknown[]) => githubMock
  .mockResolvedValueOnce({ object: { sha: 'head' } })
  .mockResolvedValueOnce(siblings)
  .mockResolvedValueOnce({ tree: { sha: 'base-tree' } })
  .mockResolvedValueOnce({ sha: 'new-tree' })
  .mockResolvedValueOnce({ sha: 'new-commit' })
  .mockResolvedValueOnce({})

beforeEach(() => {
  githubMock.mockReset()
})

describe('renameFile', () => {
  it('moves the blob to the new name and drops the old path in one fast-forward commit', async () => {
    mockGitHub([file('a #1.txt', 'blob'), file('b.txt')])

    await renameFile(event, target, { name: 'b #2.txt', sha: 'blob' })

    expect(endpointOf(0)).toBe('/repos/octo/notes/git/ref/heads/main')
    expect(endpointOf(1)).toBe('/repos/octo/notes/contents/docs%202026')
    expect(optionsOf(1)).toEqual({ query: { ref: 'head' } })
    expect(endpointOf(2)).toBe('/repos/octo/notes/git/commits/head')
    expect(endpointOf(3)).toBe('/repos/octo/notes/git/trees')
    expect(optionsOf(3)).toEqual({
      method: 'POST',
      body: {
        base_tree: 'base-tree',
        tree: [
          { path: 'docs 2026/b #2.txt', mode: '100644', type: 'blob', sha: 'blob' },
          { path: 'docs 2026/a #1.txt', mode: '100644', type: 'blob', sha: null },
        ],
      },
    })
    expect(optionsOf(4)).toEqual({ method: 'POST', body: { message: 'feat: rename a #1.txt to b #2.txt', tree: 'new-tree', parents: ['head'] } })
    expect(endpointOf(5)).toBe('/repos/octo/notes/git/refs/heads/main')
    expect(optionsOf(5)).toEqual({ method: 'PATCH', body: { sha: 'new-commit' } })
  })

  it('works at the vault root', async () => {
    mockGitHub([file('a.txt', 'blob')])

    await renameFile(event, { ...target, path: 'a.txt' }, { name: 'c.txt', sha: 'blob' })

    expect(endpointOf(1)).toBe('/repos/octo/notes/contents/')
    expect(optionsOf(3)?.body?.tree).toEqual([
      { path: 'c.txt', mode: '100644', type: 'blob', sha: 'blob' },
      { path: 'a.txt', mode: '100644', type: 'blob', sha: null },
    ])
  })

  it('refuses a name already taken in the folder, writing nothing', async () => {
    mockGitHub([file('a #1.txt', 'blob'), file('b.txt')])

    await expect(renameFile(event, target, { name: 'b.txt', sha: 'blob' })).rejects.toMatchObject({ statusCode: 422 })
    expect(githubMock).toHaveBeenCalledTimes(2)
  })

  it('refuses when the file changed since the user saw it', async () => {
    mockGitHub([file('a #1.txt', 'newer')])

    await expect(renameFile(event, target, { name: 'c.txt', sha: 'blob' })).rejects.toMatchObject({ statusCode: 409 })
    expect(githubMock).toHaveBeenCalledTimes(2)
  })

  it('does nothing when the name is unchanged', async () => {
    await renameFile(event, target, { name: 'a #1.txt', sha: 'blob' })
    expect(githubMock).not.toHaveBeenCalled()
  })
})

describe('fileSchemaRename', () => {
  it('trims the name', () => {
    expect(fileSchemaRename.parse({ name: '  b.txt ', sha: 's' })).toEqual({ name: 'b.txt', sha: 's' })
  })

  it.each(['', '   ', '.', '..', 'a/b.txt', '../b.txt', 'a\0.txt'])('rejects %o', (name) => {
    expect(() => fileSchemaRename.parse({ name, sha: 's' })).toThrow()
  })
})
