import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { buildRenameTree, renameFile } from './renameFile'
import { github } from './github'
import type { GhGitTreeEntry } from '~~/server/resources/gitHubRepoTree'
import { fileSchemaRename } from '~~/server/resources/gitHubRepoContents'

vi.mock('./github', () => ({ github: vi.fn() }))

const githubMock = vi.mocked(github)
const event = {} as H3Event
const target = { repo: 'notes', path: 'docs 2026/foto.jpg', branch: 'main' }

const entry = (path: string, mode = '100644', type = 'blob'): GhGitTreeEntry => ({ path, mode, type, sha: `sha-${path}` })

beforeEach(() => {
  githubMock.mockReset()
})

describe('buildRenameTree', () => {
  const tree = [entry('docs'), entry('docs/foto.jpg'), entry('docs/b.jpg')]

  it('moves the blob to the new path and drops the old one', () => {
    expect(buildRenameTree(tree, 'docs/foto.jpg', 'docs/mare.jpg', 'sha-docs/foto.jpg')).toEqual([
      { path: 'docs/mare.jpg', mode: '100644', type: 'blob', sha: 'sha-docs/foto.jpg' },
      { path: 'docs/foto.jpg', mode: '100644', type: 'blob', sha: null },
    ])
  })

  it('keeps an executable file executable', () => {
    expect(buildRenameTree([entry('run.sh', '100755')], 'run.sh', 'go.sh', 'sha-run.sh').map(item => item.mode)).toEqual(['100755', '100755'])
  })

  it('refuses a taken name', () => {
    expect(() => buildRenameTree(tree, 'docs/foto.jpg', 'docs/b.jpg', 'sha-docs/foto.jpg')).toThrow(expect.objectContaining({ statusCode: 409, data: { code: 'nameTaken' } }))
  })

  it.each([
    ['a symlink', entry('link', '120000')],
    ['a submodule', entry('link', '160000', 'commit')],
    ['a folder', entry('link', '040000', 'tree')],
  ])('refuses %s', (_, item) => {
    expect(() => buildRenameTree([item], 'link', 'other', item.sha!)).toThrow(expect.objectContaining({ statusCode: 400, data: { code: 'notRenamable' } }))
  })

  it.each([
    ['changed', 'stale-sha'],
    ['removed', 'sha-docs/foto.jpg'],
  ])('refuses a file %s since the user saw it', (_, sha) => {
    const current = sha === 'stale-sha' ? tree : [entry('docs')]
    expect(() => buildRenameTree(current, 'docs/foto.jpg', 'docs/mare.jpg', sha)).toThrow(expect.objectContaining({ statusCode: 409, data: { code: 'vaultChanged' } }))
  })
})

describe('renameFile', () => {
  it('commits the rename with a readable message', async () => {
    githubMock
      .mockResolvedValueOnce({ object: { sha: 'head' } })
      .mockResolvedValueOnce({ sha: 'base', truncated: false, tree: [entry('docs 2026/foto.jpg')] })
      .mockResolvedValueOnce({ sha: 'new-tree' })
      .mockResolvedValueOnce({ sha: 'new-commit' })
      .mockResolvedValueOnce({})

    await renameFile(event, target, { name: 'mare.jpg', sha: 'sha-docs 2026/foto.jpg' })

    expect(githubMock.mock.calls[2]![2]!.body!.tree).toEqual([
      { path: 'docs 2026/mare.jpg', mode: '100644', type: 'blob', sha: 'sha-docs 2026/foto.jpg' },
      { path: 'docs 2026/foto.jpg', mode: '100644', type: 'blob', sha: null },
    ])
    expect(githubMock.mock.calls[3]![2]!.body!.message).toBe('Rename foto.jpg to mare.jpg')
  })

  it.each(['mare.png', 'mare', '.jpg'])('refuses %s: the extension is locked', async (name) => {
    await expect(renameFile(event, target, { name, sha: 's' })).rejects.toMatchObject({ statusCode: 400 })
    expect(githubMock).not.toHaveBeenCalled()
  })

  it.each([
    ['README', 'NOTES.md'],
    ['.env', '.env.local'],
  ])('lets %s change its whole name', async (oldName, name) => {
    githubMock.mockRejectedValue(createError({ statusCode: 500 }))
    // Past the extension check: it reaches GitHub
    await expect(renameFile(event, { ...target, path: oldName }, { name, sha: 's' })).rejects.toMatchObject({ statusCode: 500 })
  })

  it('refuses the repo root', async () => {
    await expect(renameFile(event, { ...target, path: '' }, { name: 'a', sha: 's' })).rejects.toMatchObject({ statusCode: 400, data: { code: 'notRenamable' } })
  })

  it('does nothing when the name is unchanged', async () => {
    await renameFile(event, target, { name: 'foto.jpg', sha: 's' })
    expect(githubMock).not.toHaveBeenCalled()
  })
})

describe('fileSchemaRename', () => {
  it.each(['a/b.txt', '.', '..', '', '   ', 'a\u0000b'])('rejects %o', (name) => {
    expect(fileSchemaRename.safeParse({ name, sha: 's' }).success).toBe(false)
  })

  it('trims the name', () => {
    expect(fileSchemaRename.parse({ name: ' b.txt ', sha: 's' })).toEqual({ name: 'b.txt', sha: 's' })
  })
})
