import { describe, expect, it } from 'vitest'
import { buildFolderDeleteTree } from './deleteFolder'
import type { GhGitTreeEntry } from '~~/server/resources/gitHubRepoTree'

const blob = (path: string): GhGitTreeEntry => ({ path, mode: '100644', type: 'blob', sha: `sha-${path}` })
const dir = (path: string): GhGitTreeEntry => ({ path, mode: '040000', type: 'tree', sha: `sha-${path}` })
const deleted = (path: string) => ({ path, mode: '100644', type: 'blob', sha: null })

describe('buildFolderDeleteTree', () => {
  it('deletes every file under the folder, nested ones and .gitkeep included, and nothing else', () => {
    const tree = [dir('docs'), blob('docs/.gitkeep'), blob('docs/a.txt'), dir('docs/sub'), blob('docs/sub/b.txt'), blob('docs-old/c.txt'), blob('d.txt')]
    expect(buildFolderDeleteTree(tree, 'docs')).toEqual([deleted('docs/.gitkeep'), deleted('docs/a.txt'), deleted('docs/sub/b.txt')])
  })

  it('keeps a root .gitkeep when the folder holds every file of the vault', () => {
    expect(buildFolderDeleteTree([dir('docs'), blob('docs/a.txt')], 'docs'))
      .toEqual([deleted('docs/a.txt'), { path: '.gitkeep', mode: '100644', type: 'blob', content: '' }])
  })

  it('rejects a folder with no files', () => {
    expect(() => buildFolderDeleteTree([blob('docs.txt')], 'docs')).toThrow('not found')
  })
})
